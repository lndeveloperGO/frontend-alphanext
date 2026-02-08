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
  Loader2, 
  AlertTriangle,
  Shield,
  Eye,
  EyeOff
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

export default function LockdownPracticeSession() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const attemptId = parseInt(searchParams.get("attemptId") || "0", 10);

  // Lockdown state
  const [violations, setViolations] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // Practice state
  const [attemptSummary, setAttemptSummary] = useState<AttemptSummary | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [questions, setQuestions] = useState<NavigationItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  
  const [submitResponse, setSubmitResponse] = useState<any | null>(null);
  const [tempAnswers, setTempAnswers] = useState<Record<number, number>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedAnswerRef = useRef<Record<number, number>>({});

  // LOCKDOWN: Disable copy/paste
  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation("Mencoba menyalin teks");
      toast({
        title: "Peringatan Keamanan",
        description: "Copy/paste tidak diizinkan selama tryout akbar",
        variant: "destructive",
      });
    };

    const preventPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation("Mencoba paste teks");
    };

    const preventCut = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation("Mencoba cut teks");
    };

    document.addEventListener('copy', preventCopy);
    document.addEventListener('paste', preventPaste);
    document.addEventListener('cut', preventCut);

    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('paste', preventPaste);
      document.removeEventListener('cut', preventCut);
    };
  }, []);

  // LOCKDOWN: Disable right-click
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordViolation("Mencoba membuka context menu");
      toast({
        title: "Peringatan Keamanan",
        description: "Right-click tidak diizinkan",
        variant: "destructive",
      });
    };

    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, []);

  // LOCKDOWN: Detect tab switch/blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isFinished) {
        setTabSwitchCount(prev => prev + 1);
        recordViolation("Berpindah tab/window");
        setShowViolationWarning(true);
      }
    };

    const handleBlur = () => {
      if (!isFinished) {
        recordViolation("Window kehilangan fokus");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isFinished]);

  // LOCKDOWN: Request fullscreen on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Failed to enter fullscreen:", err);
        toast({
          title: "Peringatan",
          description: "Mohon aktifkan fullscreen untuk keamanan tryout",
          variant: "destructive",
        });
      }
    };

    enterFullscreen();

    // Monitor fullscreen changes
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      
      if (!isNowFullscreen && !isFinished) {
        recordViolation("Keluar dari fullscreen");
        toast({
          title: "Peringatan Keamanan",
          description: "Tryout harus dalam mode fullscreen",
          variant: "destructive",
        });
        // Try to re-enter fullscreen
        setTimeout(() => {
          document.documentElement.requestFullscreen().catch(console.error);
        }, 1000);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
    };
  }, [isFinished]);

  // LOCKDOWN: Disable keyboard shortcuts including Alt+Tab
  useEffect(() => {
    const preventShortcuts = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        recordViolation("Mencoba membuka DevTools");
        toast({
          title: "Peringatan Keamanan",
          description: "Developer tools tidak diizinkan",
          variant: "destructive",
        });
      }

      // Prevent Alt+Tab, Alt+F4, Windows Key
      if (
        e.altKey && e.key === 'Tab' ||
        e.altKey && e.key === 'F4' ||
        e.key === 'Meta' ||
        e.key === 'OS'
      ) {
        e.preventDefault();
        recordViolation("Mencoba berpindah aplikasi (Alt+Tab)");
        setShowViolationWarning(true);
        toast({
          title: "Peringatan Keamanan",
          description: "Tidak boleh berpindah aplikasi selama tryout",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('keydown', preventShortcuts);
    return () => window.removeEventListener('keydown', preventShortcuts);
  }, []);

  // LOCKDOWN: Prevent page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isFinished) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFinished]);

  const recordViolation = (type: string) => {
    console.warn(`Security violation: ${type}`);
    setViolations(prev => prev + 1);
    
    // Log violation to backend (optional)
    // attemptService.logViolation(attemptId, type).catch(console.error);
  };

  // Redirect if no attemptId
  useEffect(() => {
    if (!attemptId) {
      window.close();
      return;
    }

    fetchAttemptSummary();
  }, [attemptId]);

  const fetchAttemptSummary = async () => {
    try {
      setLoading(true);
      const response = await attemptService.getAttemptSummary(attemptId);

      if (!response.success) {
        throw new Error("Failed to fetch attempt");
      }

      const summary = response.data;

      if (summary.status !== "in_progress") {
        setShowResults(true);
        setIsFinished(true);
        return;
      }

      setAttemptSummary(summary);
      setQuestions(summary.nav);
      setTimeLeft(summary.remaining_seconds);

      await fetchQuestion(1);
    } catch (error) {
      console.error("Error fetching attempt:", error);
      toast({
        title: "Error",
        description: "Failed to load attempt",
        variant: "destructive",
      });
      window.close();
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestion = async (questionNo: number) => {
    try {
      setNavigating(true);
      const response = await attemptService.getQuestion(attemptId, questionNo);

      if (!response.success) {
        throw new Error("Failed to fetch question");
      }

      const question = response.data;

      if (question.status !== "in_progress") {
        setIsFinished(true);
        setShowResults(true);
        setNavigating(false);
        return;
      }

      setCurrentQuestion(question);
      setTimeLeft(question.remaining_seconds);
      setCurrentIndex(questionNo - 1);
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

    setTempAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));

    const updatedQuestion = {
      ...currentQuestion,
      selected_option_id: optionId,
    };
    setCurrentQuestion(updatedQuestion);

    scheduleAutoSave(questionId, optionId);
  };

  const scheduleAutoSave = (questionId: number, optionId: number) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setAutoSaveStatus('idle');

    autoSaveTimerRef.current = setTimeout(async () => {
      if (lastSavedAnswerRef.current[questionId] === optionId) {
        return;
      }

      setAutoSaveStatus('saving');
      
      try {
        await attemptService.submitAnswer(attemptId, questionId, optionId);
        lastSavedAnswerRef.current[questionId] = optionId;
        setAutoSaveStatus('saved');
        
        setQuestions((prev) =>
          prev.map((q) =>
            q.question_id === questionId ? { ...q, done: true } : q
          )
        );

        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 2000);
      } catch (error) {
        console.error("Auto-save failed:", error);
        setAutoSaveStatus('error');
        
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 3000);
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const handleNext = async () => {
    if (!questions || currentIndex >= questions.length - 1) return;
    await fetchQuestion(currentIndex + 2);
  };

  const handlePrev = async () => {
    if (currentIndex <= 0) return;
    await fetchQuestion(currentIndex);
  };

  const handleFinish = useCallback(async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
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

  const answeredCount = questions.filter(q => q.done).length;
  const unansweredCount = questions.length - answeredCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Memuat Tryout Akbar...</p>
          <p className="text-sm text-muted-foreground">Mode keamanan akan diaktifkan</p>
        </div>
      </div>
    );
  }

  if (showResults && submitResponse) {
    const summary = submitResponse.summary;
    const isPassed = submitResponse.total_score >= 70;

    // Exit fullscreen and close window after showing results
    setTimeout(() => {
      if (document.fullscreenElement) {
        document.exitFullscreen().then(() => {
          setTimeout(() => {
            window.close();
            // Fallback if window.close() doesn't work
            window.location.href = '/dashboard';
          }, 3000);
        });
      } else {
        setTimeout(() => {
          window.close();
          window.location.href = '/dashboard';
        }, 3000);
      }
    }, 5000);

    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardContent className="py-12 text-center">
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

            <h1 className="mb-2 text-3xl font-bold">Tryout Selesai!</h1>
            <p className="mb-8 text-muted-foreground">Hasil Anda</p>

            <div className="mb-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-8 border border-primary/20">
              <p className="text-5xl font-bold text-primary mb-2">
                {submitResponse.total_score}%
              </p>
              <p className="text-lg text-muted-foreground">Skor Anda</p>
            </div>

            <div className="mb-8 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-3xl font-bold">{summary.total_questions}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Soal</p>
              </div>
              <div className="rounded-lg bg-success/10 p-4 border border-success/20">
                <p className="text-3xl font-bold text-success">{summary.answered}</p>
                <p className="text-xs text-muted-foreground mt-1">Terjawab</p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20">
                <p className="text-3xl font-bold text-destructive">{summary.unanswered}</p>
                <p className="text-xs text-muted-foreground mt-1">Tidak Terjawab</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Jendela ini akan tertutup otomatis dalam 5 detik...
            </p>
            <p className="text-xs text-muted-foreground">
              Pelanggaran keamanan: {violations}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / attemptSummary.progress.total) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Violation Warning Dialog */}
      <AlertDialog open={showViolationWarning} onOpenChange={setShowViolationWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Peringatan Keamanan!
            </AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-2">Anda telah berpindah tab/window sebanyak <strong>{tabSwitchCount} kali</strong>.</p>
              <p className="mb-2">Pelanggaran keamanan: <strong>{violations}</strong></p>
              <p className="text-destructive font-semibold">
                Pelanggaran berulang dapat mengakibatkan diskualifikasi!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Saya Mengerti</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Finish Confirmation Dialog */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Selesaikan Tryout Akbar?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Status pengerjaan:</p>
              <div className="grid grid-cols-2 gap-2 my-3">
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">{answeredCount}</div>
                  <div className="text-xs text-muted-foreground">Terjawab</div>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <div className="text-2xl font-bold text-red-600">{unansweredCount}</div>
                  <div className="text-xs text-muted-foreground">Belum</div>
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

      {/* Security Header */}
      <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Tryout Akbar - Mode Keamanan</span>
            {violations > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {violations} Pelanggaran
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
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
              </div>
            )}

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

        <div className="px-4 pb-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress: {answeredCount}/{questions.length} soal</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      <div className="flex">
        <main className="flex-1 px-4 py-8 max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <Badge variant="outline" className="text-sm">
              Soal {currentIndex + 1} dari {attemptSummary.progress.total}
            </Badge>
            <div className="flex gap-2 text-xs">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                ✓ {answeredCount} Terjawab
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                ✗ {unansweredCount} Belum
              </Badge>
            </div>
          </div>

          {navigating ? (
            <Card className="mb-6 animate-pulse">
              <CardContent className="py-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-6 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6 border-2 shadow-sm select-none">
              <CardContent className="py-6">
                <p className="text-lg font-medium leading-relaxed">{currentQuestion.question}</p>
              </CardContent>
            </Card>
          )}

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
                    "w-full rounded-lg border-2 p-4 text-left transition-all select-none",
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
                        : "bg-muted text-muted-foreground"
                    )}>
                      {option.label}
                    </span>
                    <span className="flex-1 pt-0.5">{option.text}</span>
                    {currentQuestion.selected_option_id === option.id && (
                      <Check className="flex-shrink-0 h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0 || navigating}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Sebelumnya
            </Button>

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
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-36 border-l bg-card p-4 overflow-y-auto hidden lg:block">
          <h3 className="mb-4 font-semibold text-xs text-center">
            Q ({answeredCount}/{attemptSummary.progress.total})
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.question_id}
                onClick={() => fetchQuestion(idx + 1)}
                className={cn(
                  "h-10 w-10 rounded flex items-center justify-center text-xs font-semibold transition-all hover:scale-110",
                  idx === currentIndex
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                    : q.done
                    ? "bg-green-500 text-white border-2 border-green-600 font-bold shadow-md"
                    : "bg-gray-300 text-gray-700 border-2 border-gray-400"
                )}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
