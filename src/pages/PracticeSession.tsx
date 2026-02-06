import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Clock, ChevronLeft, ChevronRight, Check, X, Home, Loader2, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
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

  // Fetch specific question
  const fetchQuestion = async (questionNo: number) => {
    try {
      const response = await attemptService.getQuestion(attemptId, questionNo);

      if (!response.success) {
        throw new Error("Failed to fetch question");
      }

      const question = response.data;

      // Check if attempt is no longer in progress
      if (question.status !== "in_progress") {
        setIsFinished(true);
        setShowResults(true);
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

    // Save answer to temporary storage (not sent to API yet)
    setTempAnswers((prev) => ({
      ...prev,
      [currentQuestion.question_id]: optionId,
    }));

    // Update local question state for UI
    setCurrentQuestion({
      ...currentQuestion,
      selected_option_id: optionId,
    });
  };

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

  const handleMark = () => {
    if (!currentQuestion) return;

    const isNowMarked = !currentQuestion.is_marked;

    // Save marked status to temporary storage
    setTempMarked((prev) => ({
      ...prev,
      [currentQuestion.question_id]: isNowMarked,
    }));

    // Update local question state for UI
    setCurrentQuestion({
      ...currentQuestion,
      is_marked: isNowMarked,
    });

    toast({
      description: isNowMarked
        ? "Question marked"
        : "Question unmarked",
    });
  };

  const handleNext = async () => {
    if (!questions || currentIndex >= questions.length - 1) return;
    
    // Submit current question to API before moving to next
    await submitCurrentQuestionToAPI();
    
    await fetchQuestion(currentIndex + 2);
  };

  const handlePrev = async () => {
    if (currentIndex <= 0) return;
    
    // Submit current question to API before moving to previous
    await submitCurrentQuestionToAPI();
    
    await fetchQuestion(currentIndex);
  };

  const handleNavigateToQuestion = async (index: number) => {
    await fetchQuestion(index + 1);
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const handleFinish = useCallback(async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      
      // Submit current question to API before finishing
      await submitCurrentQuestionToAPI();
      
      const response = await attemptService.submitAttempt(attemptId);

      if (response.success) {
        // Store submit response data
        setSubmitResponse(response.data);
        setIsFinished(true);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error submitting attempt:", error);
      toast({
        title: "Error",
        description: "Failed to submit attempt",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, submitting, currentQuestion, tempAnswers, tempMarked]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Exit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span
              className={cn(
                "font-mono font-semibold",
                timeLeft < 60 && "text-destructive"
              )}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
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
        <main className="flex-1 px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {attemptSummary.progress.total}
            </span>
          </div>

          <Card className="mb-6">
            <CardContent className="py-6">
              <p className="text-lg font-medium">{currentQuestion.question}</p>
            </CardContent>
          </Card>

          <div className="mb-8 space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                disabled={currentQuestion.status !== "in_progress"}
                className={cn(
                  "w-full rounded-lg border-2 p-4 text-left transition-all",
                  currentQuestion.status === "in_progress" &&
                    "hover:border-primary cursor-pointer",
                  currentQuestion.selected_option_id === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border",
                  currentQuestion.status !== "in_progress" && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {option.label}
                </span>
                {option.text}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleMark}
                className={cn(currentQuestion.is_marked && "bg-warning/10")}
              >
                {currentQuestion.is_marked ? "Marked" : "Mark"}
              </Button>
            </div>

            {currentIndex === attemptSummary.progress.total - 1 ? (
              <Button
                onClick={handleFinish}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Finish
                    <Check className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
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
