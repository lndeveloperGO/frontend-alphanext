import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Home, 
  Loader2, 
  Menu,
  Save,
  AlertCircle,
  BookmarkCheck,
  Keyboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  attemptService,
  type AttemptSummary,
  type QuestionData,
} from "@/lib/attemptService";

interface NavigationItem {
  question_id: number;
  done: boolean;
  marked: boolean;
}

// Question cache type
interface QuestionCache {
  [questionNo: number]: QuestionData;
}

export default function PracticeSession() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const attemptId = parseInt(searchParams.get("attemptId") || "0", 10);

  // State
  const [attemptSummary, setAttemptSummary] = useState<AttemptSummary | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [questions, setQuestions] = useState<NavigationItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  // Submit response data
  const [submitResponse, setSubmitResponse] = useState<{
    attempt_id: number;
    status: string;
    submitted_at: string;
    total_score: number;
    summary: {
      total_questions: number;
      answered: number;
      unanswered: number;
      progress_percent: number;
    };
  } | null>(null);
  
  // Temporary answer storage (key: question_id, value: option_id)
  const [tempAnswers, setTempAnswers] = useState<Record<number, number>>({});
  // Temporary marked status (key: question_id, value: is_marked)
  const [tempMarked, setTempMarked] = useState<Record<number, boolean>>({});
  
  // NEW: Question cache for faster navigation
  const [questionCache, setQuestionCache] = useState<QuestionCache>({});
  
  // NEW: Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedAnswerRef = useRef<Record<number, number>>({});

  // Redirect if no attemptId
  useEffect(() => {
    if (!attemptId) {
      navigate("/dashboard");
      return;
    }

    fetchAttemptSummary();
  }, [attemptId]);

  // Fetch attempt summary
  const fetchAttemptSummary = async () => {
    try {
      setLoading(true);
      const response = await attemptService.getAttemptSummary(attemptId);

      if (!response.success) {
        throw new Error("Failed to fetch attempt");
      }

      const summary = response.data;

      // Check if attempt is already finished
      if (summary.status !== "in_progress") {
        setShowResults(true);
        setIsFinished(true);
        return;
      }

      setAttemptSummary(summary);
      setQuestions(summary.nav);
      setTimeLeft(summary.remaining_seconds);

      // Fetch first question
      await fetchQuestion(1);
    } catch (error) {
      console.error("Error fetching attempt:", error);
      toast({
        title: "Error",
        description: "Failed to load attempt",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch specific question with caching
  const fetchQuestion = async (questionNo: number, skipCache = false) => {
    try {
      setNavigating(true);
      
      // Check cache first (unless skipCache is true)
      if (!skipCache && questionCache[questionNo]) {
        const cachedQuestion = questionCache[questionNo];
        setCurrentQuestion(cachedQuestion);
        setTimeLeft(cachedQuestion.remaining_seconds);
        setCurrentIndex(questionNo - 1);
        setNavigating(false);
        
        // Prefetch next question in background
        prefetchQuestion(questionNo + 1);
        return;
      }

      const response = await attemptService.getQuestion(attemptId, questionNo);

      if (!response.success) {
        throw new Error("Failed to fetch question");
      }

      const question = response.data;

      // Check if attempt is no longer in progress
      if (question.status !== "in_progress") {
        setIsFinished(true);
        setShowResults(true);
        setNavigating(false);
        return;
      }

      // Update cache
      setQuestionCache(prev => ({
        ...prev,
        [questionNo]: question
      }));

      setCurrentQuestion(question);
      setTimeLeft(question.remaining_seconds);
      setCurrentIndex(questionNo - 1);
      
      // Prefetch next question in background
      prefetchQuestion(questionNo + 1);
    } catch (error) {
      console.error("Error fetching question:", error);
      toast({
        title: "Error",
        description: "Failed to load question",
        variant: "destructive",
      });
    } finally {
      setNavigating(false);
    }
  };

  // NEW: Prefetch question for faster navigation
  const prefetchQuestion = async (questionNo: number) => {
    if (!attemptSummary) return;
    if (questionNo < 1 || questionNo > attemptSummary.progress.total) return;
    if (questionCache[questionNo]) return; // Already cached

    try {
      const response = await attemptService.getQuestion(attemptId, questionNo);
      if (response.success) {
        setQuestionCache(prev => ({
          ...prev,
          [questionNo]: response.data
        }));
      }
    } catch (error) {
      // Silent fail for prefetch
      console.debug("Prefetch failed for question", questionNo);
    }
  };

  // Timer effect
  useEffect(() => {
    if (isFinished || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, currentQuestion]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (optionId: number) => {
    if (!currentQuestion) return;
    if (currentQuestion.status !== "in_progress") return;

    const questionId = currentQuestion.question_id;
    const questionNo = currentQuestion.no;

    // Save answer to temporary storage (not sent to API yet)
    setTempAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));

    // Update local question state for UI (optimistic update)
    const updatedQuestion = {
      ...currentQuestion,
      selected_option_id: optionId,
    };
    setCurrentQuestion(updatedQuestion);
    
    // Update cache
    setQuestionCache(prev => ({
      ...prev,
      [questionNo]: updatedQuestion
    }));

    // Trigger auto-save
    scheduleAutoSave(questionId, optionId);
  };

  // NEW: Auto-save with debounce
  const scheduleAutoSave = (questionId: number, optionId: number) => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setAutoSaveStatus('idle');

    // Set new timer (2 seconds debounce)
    autoSaveTimerRef.current = setTimeout(async () => {
      // Check if answer has changed since last save
      if (lastSavedAnswerRef.current[questionId] === optionId) {
        return;
      }

      setAutoSaveStatus('saving');
      
      try {
        await attemptService.submitAnswer(attemptId, questionId, optionId);
        lastSavedAnswerRef.current[questionId] = optionId;
        setAutoSaveStatus('saved');
        
        // Update navigation status
        setQuestions((prev) =>
          prev.map((q) =>
            q.question_id === questionId ? { ...q, done: true } : q
          )
        );

        // Clear saved status after 2 seconds
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 2000);
      } catch (error) {
        console.error("Auto-save failed:", error);
        setAutoSaveStatus('error');
        
        // Keep error status visible for 3 seconds
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 3000);
      }
    }, 2000);
  };

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Submit answers and marked status to API for current question
  const submitCurrentQuestionToAPI = async () => {
    if (!currentQuestion) return;

    try {
      const questionId = currentQuestion.question_id;
      let hasAnswered = false;
      
      // Submit answer if it was changed
      if (tempAnswers[questionId] !== undefined) {
        await attemptService.submitAnswer(
          attemptId,
          questionId,
          tempAnswers[questionId]
        );
        hasAnswered = true;
        // Clear from temp storage after successful submission
        setTempAnswers((prev) => {
          const updated = { ...prev };
          delete updated[questionId];
          return updated;
        });
      }

      // Submit marked status if it was changed
      if (tempMarked[questionId] !== undefined && tempMarked[questionId] !== currentQuestion.is_marked) {
        await attemptService.markQuestion(attemptId, questionId);
        // Clear from temp storage after successful submission
        setTempMarked((prev) => {
          const updated = { ...prev };
          delete updated[questionId];
          return updated;
        });
      }

      // Update the navigation item status if answer was submitted
      if (hasAnswered) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.question_id === questionId ? { ...q, done: true } : q
          )
        );
      }
    } catch (error) {
      console.error("Error submitting question data:", error);
      toast({
        title: "Error",
        description: "Failed to save question data",
        variant: "destructive",
      });
    }
  };

  const handleMark = async () => {
    if (!currentQuestion) return;

    const questionId = currentQuestion.question_id;
    const questionNo = currentQuestion.no;
    const isNowMarked = !currentQuestion.is_marked;

    // Optimistic update
    const updatedQuestion = {
      ...currentQuestion,
      is_marked: isNowMarked,
    };
    setCurrentQuestion(updatedQuestion);
    
    // Update cache
    setQuestionCache(prev => ({
      ...prev,
      [questionNo]: updatedQuestion
    }));

    // Update navigation
    setQuestions((prev) =>
      prev.map((q) =>
        q.question_id === questionId ? { ...q, marked: isNowMarked } : q
      )
    );

    toast({
      description: isNowMarked ? "Soal ditandai" : "Tanda dihapus",
    });

    // Submit to API in background
    try {
      await attemptService.markQuestion(attemptId, questionId);
    } catch (error) {
      console.error("Failed to mark question:", error);
      // Revert on error
      setCurrentQuestion(currentQuestion);
      setQuestionCache(prev => ({
        ...prev,
        [questionNo]: currentQuestion
      }));
      setQuestions((prev) =>
        prev.map((q) =>
          q.question_id === questionId ? { ...q, marked: !isNowMarked } : q
        )
      );
      toast({
        title: "Error",
        description: "Gagal menandai soal",
        variant: "destructive",
      });
    }
  };

  const handleNext = async () => {
    if (!questions || currentIndex >= questions.length - 1) return;
    await fetchQuestion(currentIndex + 2);
  };

  const handlePrev = async () => {
    if (currentIndex <= 0) return;
    await fetchQuestion(currentIndex);
  };

  const handleNavigateToQuestion = async (index: number) => {
    if (index === currentIndex) return;
    await fetchQuestion(index + 1);
    setIsSidebarOpen(false);
  };

  const handleFinish = useCallback(async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      
      // Force save any pending changes
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      // Submit any unsaved answers
      const unsavedQuestions = Object.keys(tempAnswers).filter(
        qId => lastSavedAnswerRef.current[parseInt(qId)] !== tempAnswers[parseInt(qId)]
      );
      
      for (const qId of unsavedQuestions) {
        try {
          await attemptService.submitAnswer(
            attemptId,
            parseInt(qId),
            tempAnswers[parseInt(qId)]
          );
        } catch (error) {
          console.error(`Failed to save answer for question ${qId}:`, error);
        }
      }
      
      const response = await attemptService.submitAttempt(attemptId);

      if (response.success) {
        setSubmitResponse(response.data);
        setIsFinished(true);
        setShowResults(true);
        setShowFinishDialog(false);
      }
    } catch (error) {
      console.error("Error submitting attempt:", error);
      toast({
        title: "Error",
        description: "Gagal mengirim jawaban",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, submitting, tempAnswers]);

  // NEW: Keyboard shortcuts
  useEffect(() => {
    if (isFinished || !currentQuestion) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (currentIndex > 0) handlePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentIndex < questions.length - 1) handleNext();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          handleMark();
          break;
        case '?':
          e.preventDefault();
          setShowKeyboardHelp(true);
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          e.preventDefault();
          const optionIndex = parseInt(e.key) - 1;
          if (currentQuestion.options[optionIndex]) {
            handleAnswer(currentQuestion.options[optionIndex].id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestion, currentIndex, questions.length, isFinished]);

  // NEW: Calculate statistics
  const answeredCount = questions.filter(q => q.done).length;
  const markedCount = questions.filter(q => q.marked).length;
  const unansweredCount = questions.length - answeredCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat sesi latihan...</p>
        </div>
      </div>
    );
  }

  if (showResults && submitResponse) {
    const summary = submitResponse.summary;
    const passScore = 70;
    const isPassed = submitResponse.total_score >= passScore;

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-3xl">
          <Card className="text-center">
            <CardContent className="py-12">
              {/* Result Icon */}
              <div
                className={cn(
                  "mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full",
                  isPassed ? "bg-success/20" : "bg-destructive/20"
                )}
              >
                {isPassed ? (
                  <Check className="h-12 w-12 text-success" />
                ) : (
                  <X className="h-12 w-12 text-destructive" />
                )}
              </div>

              {/* Header */}
              <h1 className="mb-2 text-3xl font-bold">Practice Complete!</h1>
              <p className="mb-8 text-muted-foreground">Here's how you did</p>

              {/* Main Score Card */}
              <div className="mb-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-8 border border-primary/20">
                <p className="text-5xl font-bold text-primary mb-2">
                  {submitResponse.total_score}%
                </p>
                <p className="text-lg text-muted-foreground">Your Score</p>
                <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full",
                      isPassed ? "bg-success" : "bg-destructive"
                    )}
                    style={{ width: `${submitResponse.total_score}%` }}
                  />
                </div>
              </div>

              {/* Summary Grid */}
              <div className="mb-8 grid grid-cols-4 gap-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-3xl font-bold text-foreground">
                    {summary.total_questions}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total Questions
                  </p>
                </div>
                <div className="rounded-lg bg-success/10 p-4 border border-success/20">
                  <p className="text-3xl font-bold text-success">
                    {summary.answered}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Answered
                  </p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20">
                  <p className="text-3xl font-bold text-destructive">
                    {summary.unanswered}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Unanswered
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
                  <p className="text-3xl font-bold text-primary">
                    {summary.progress_percent}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Progress
                  </p>
                </div>
              </div>

              {/* Result Message */}
              <div className="mb-8 rounded-lg bg-card p-6 border">
                <p className="text-lg font-semibold text-foreground mb-1">
                  {isPassed ? "Great Job! 🎉" : "Keep Practicing!"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isPassed
                    ? `You scored ${submitResponse.total_score}% and passed the practice session.`
                    : `You scored ${submitResponse.total_score}%. Keep practicing to improve your score.`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Back to Practice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / attemptSummary.progress.total) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keluar dari Latihan?</AlertDialogTitle>
            <AlertDialogDescription>
              Progress Anda akan tersimpan. Anda dapat melanjutkan latihan nanti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/dashboard")}>
              Ya, Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Finish Confirmation Dialog */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Selesaikan Latihan?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Anda akan menyelesaikan latihan dengan status:</p>
              <div className="grid grid-cols-3 gap-2 my-3">
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">{answeredCount}</div>
                  <div className="text-xs text-muted-foreground">Terjawab</div>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <div className="text-2xl font-bold text-red-600">{unansweredCount}</div>
                  <div className="text-xs text-muted-foreground">Belum</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded">
                  <div className="text-2xl font-bold text-yellow-600">{markedCount}</div>
                  <div className="text-xs text-muted-foreground">Ditandai</div>
                </div>
              </div>
              <p className="text-sm">Setelah selesai, Anda tidak dapat mengubah jawaban.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinish} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Ya, Selesaikan"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Keyboard Help Dialog */}
      <AlertDialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Pintasan Keyboard
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground">← →</span>
                  <span>Navigasi soal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">1-5</span>
                  <span>Pilih jawaban A-E</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">M</span>
                  <span>Tandai soal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">?</span>
                  <span>Tampilkan bantuan ini</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Mengerti</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExitDialog(true)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Keluar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKeyboardHelp(true)}
              title="Pintasan Keyboard (?)"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-save indicator */}
            {autoSaveStatus !== 'idle' && (
              <div className="flex items-center gap-1.5 text-xs">
                {autoSaveStatus === 'saving' && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                    <span className="text-blue-500">Menyimpan...</span>
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Tersimpan</span>
                  </>
                )}
                {autoSaveStatus === 'error' && (
                  <>
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">Gagal</span>
                  </>
                )}
              </div>
            )}

            {/* Timer */}
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
              <Clock className="h-4 w-4 text-primary" />
              <span
                className={cn(
                  "font-mono font-semibold",
                  timeLeft < 60 && "text-destructive animate-pulse"
                )}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar with stats */}
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress: {answeredCount}/{questions.length} soal</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Question */}
        <main className="flex-1 px-4 py-8 max-w-4xl mx-auto">
          {/* Question Header with Stats */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                Soal {currentIndex + 1} dari {attemptSummary.progress.total}
              </Badge>
              {currentQuestion.is_marked && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  ⚑ Ditandai
                </Badge>
              )}
            </div>
            <div className="flex gap-2 text-xs">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                ✓ {answeredCount} Terjawab
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                ✗ {unansweredCount} Belum
              </Badge>
              {markedCount > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  ⚑ {markedCount} Ditandai
                </Badge>
              )}
            </div>
          </div>

          {/* Question Card with Loading State */}
          {navigating ? (
            <Card className="mb-6 animate-pulse">
              <CardContent className="py-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-6 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6 border-2 shadow-sm">
              <CardContent className="py-6">
                <p className="text-lg font-medium leading-relaxed">{currentQuestion.question}</p>
              </CardContent>
            </Card>
          )}

          {/* Options with Loading State */}
          {navigating ? (
            <div className="mb-8 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-full rounded-lg border-2 p-4 animate-pulse">
                  <div className="h-5 bg-muted rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-8 space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  disabled={currentQuestion.status !== "in_progress"}
                  className={cn(
                    "w-full rounded-lg border-2 p-4 text-left transition-all relative group",
                    currentQuestion.status === "in_progress" &&
                      "hover:border-primary hover:shadow-md cursor-pointer",
                    currentQuestion.selected_option_id === option.id
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border hover:bg-muted/50",
                    currentQuestion.status !== "in_progress" && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className={cn(
                      "flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition-colors",
                      currentQuestion.selected_option_id === option.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/20"
                    )}>
                      {option.label}
                    </span>
                    <span className="flex-1 pt-0.5">{option.text}</span>
                    {currentQuestion.selected_option_id === option.id && (
                      <Check className="flex-shrink-0 h-5 w-5 text-primary" />
                    )}
                  </div>
                  {/* Keyboard hint */}
                  <span className="absolute top-2 right-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    Tekan {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentIndex === 0 || navigating}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                onClick={handleMark}
                className={cn(currentQuestion.is_marked && "bg-yellow-100 border-yellow-400")}
              >
                {currentQuestion.is_marked ? "Ditandai ⚑" : "Tandai"}
              </Button>
            </div>

            {currentIndex === attemptSummary.progress.total - 1 ? (
              <Button
                onClick={() => setShowFinishDialog(true)}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                Selesaikan
                <Check className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={navigating}>
                {navigating ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Selanjutnya
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </main>

        {/* Right Sidebar Navigation */}
        <aside
          className={cn(
            "fixed right-0 top-16 z-50 h-[calc(100vh-4rem)] w-36 border-l bg-card p-4 overflow-y-auto lg:sticky lg:top-16 lg:z-auto",
            isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          )}
        >
          <h3 className="mb-4 font-semibold text-xs text-center">
            Q ({attemptSummary.progress.done}/{attemptSummary.progress.total})
          </h3>
          <div className="grid grid-cols-3 gap-5">
            {questions.map((q, idx) => (
              <button
                key={q.question_id}
                onClick={() => handleNavigateToQuestion(idx)}
                className={cn(
                  "h-10 w-10 rounded flex items-center justify-center text-xs font-semibold transition-all hover:scale-110 relative",
                  idx === currentIndex
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                    : q.done
                    ? "bg-green-500 text-white border-2 border-green-600 font-bold shadow-md"
                    : q.marked
                    ? "bg-yellow-400 text-yellow-900 border-2 border-yellow-500 font-bold"
                    : "bg-gray-300 text-gray-700 border-2 border-gray-400"
                )}
                title={`Q${idx + 1}${q.done ? " ✓ Answered" : ""}${q.marked ? " ⚑ Marked" : ""}`}
              >
                <span>{idx + 1}</span>
                {q.done && (
                  <Check className="absolute -top-2 -right-2 h-4 w-4 bg-green-600 rounded-full text-white border border-white" />
                )}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
