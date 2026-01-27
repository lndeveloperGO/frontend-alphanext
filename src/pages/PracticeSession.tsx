import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Clock, ChevronLeft, ChevronRight, Check, X, Home, Loader2 } from "lucide-react";
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

  // Redirect if no attemptId
  useEffect(() => {
    if (!attemptId) {
      navigate("/dashboard/practice");
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
      navigate("/dashboard/practice");
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

  const handleAnswer = async (optionId: number) => {
    if (!currentQuestion) return;
    if (currentQuestion.status !== "in_progress") return;

    try {
      const response = await attemptService.submitAnswer(
        attemptId,
        currentQuestion.question_id,
        optionId
      );

      if (response.success) {
        // Update local question state
        setCurrentQuestion({
          ...currentQuestion,
          selected_option_id: optionId,
        });

        // Refresh summary to update navigation
        await fetchAttemptSummary();
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive",
      });
    }
  };

  const handleMark = async () => {
    if (!currentQuestion) return;

    try {
      const response = await attemptService.markQuestion(
        attemptId,
        currentQuestion.question_id
      );

      if (response.success) {
        // Update local question state
        setCurrentQuestion({
          ...currentQuestion,
          is_marked: response.data.is_marked,
        });

        // Refresh summary to update navigation
        await fetchAttemptSummary();

        toast({
          description: response.data.is_marked
            ? "Question marked"
            : "Question unmarked",
        });
      }
    } catch (error) {
      console.error("Error marking question:", error);
      toast({
        title: "Error",
        description: "Failed to mark question",
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
    await fetchQuestion(index + 1);
  };

  const handleFinish = useCallback(async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      const response = await attemptService.submitAttempt(attemptId);

      if (response.success) {
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
  }, [attemptId, submitting]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showResults && attemptSummary) {
    const progress = attemptSummary.progress;
    const percentage = Math.round(
      (progress.done / progress.total) * 100
    );

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-2xl">
          <Card className="text-center">
            <CardContent className="py-12">
              <div
                className={cn(
                  "mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full",
                  attemptSummary.total_score >= 70
                    ? "bg-success/20"
                    : "bg-destructive/20"
                )}
              >
                {attemptSummary.total_score >= 70 ? (
                  <Check className="h-12 w-12 text-success" />
                ) : (
                  <X className="h-12 w-12 text-destructive" />
                )}
              </div>
              <h1 className="mb-2 text-3xl font-bold">Practice Complete!</h1>
              <p className="mb-8 text-muted-foreground">Here's how you did</p>

              <div className="mb-8 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-3xl font-bold text-primary">
                    {attemptSummary.total_score}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Score</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-3xl font-bold">
                    {progress.done}/{progress.total}
                  </p>
                  <p className="text-sm text-muted-foreground">Answered</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-3xl font-bold">{percentage}%</p>
                  <p className="text-sm text-muted-foreground">Progress</p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard/practice")}
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
              onClick={() => navigate("/dashboard/practice")}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Exit
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
        <aside className="sticky top-16 w-32 border-l bg-card p-4 h-[calc(100vh-4rem)] overflow-y-auto">
          <h3 className="mb-4 font-semibold text-xs text-center">
            Q ({attemptSummary.progress.done}/{attemptSummary.progress.total})
          </h3>
          <div className="grid grid-cols-2 gap-5">
            {questions.map((q, idx) => (
              <button
                key={q.question_id}
                onClick={() => handleNavigateToQuestion(idx)}
                className={cn(
                  "h-12 w-12 rounded flex items-center justify-center text-sm font-semibold transition-all hover:scale-110",
                  idx === currentIndex
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                    : q.done
                    ? "bg-success/20 border-2 border-success text-foreground"
                    : q.marked
                    ? "bg-warning/20 border-2 border-warning text-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                title={`Q${idx + 1}`}
              >
                <span>{idx + 1}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
