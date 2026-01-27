import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { questions as allQuestions } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Clock, ChevronLeft, ChevronRight, Check, X, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PracticeSession() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const category = searchParams.get("category") || "all";

  const questions = category === "all" 
    ? allQuestions 
    : allQuestions.filter(q => q.category === category);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(questions.length * 120); // 2 min per question
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Timer
  useEffect(() => {
    if (isFinished) return;
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
  }, [isFinished]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (optionId: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionId });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = useCallback(() => {
    setIsFinished(true);
    setShowResults(true);
  }, []);

  const calculateScore = () => {
    let totalScore = 0;
    let correctCount = 0;
    questions.forEach((q) => {
      const answer = answers[q.id];
      if (answer) {
        const option = q.options.find((o) => o.id === answer);
        if (option) totalScore += option.score;
        if (answer === q.correctOptionId) correctCount++;
      }
    });
    return { totalScore, correctCount, percentage: Math.round((correctCount / questions.length) * 100) };
  };

  if (showResults) {
    const { totalScore, correctCount, percentage } = calculateScore();
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-2xl">
          <Card className="text-center">
            <CardContent className="py-12">
              <div className={cn(
                "mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full",
                percentage >= 70 ? "bg-success/20" : "bg-destructive/20"
              )}>
                {percentage >= 70 ? (
                  <Check className="h-12 w-12 text-success" />
                ) : (
                  <X className="h-12 w-12 text-destructive" />
                )}
              </div>
              <h1 className="mb-2 text-3xl font-bold">Practice Complete!</h1>
              <p className="mb-8 text-muted-foreground">Here's how you did</p>
              
              <div className="mb-8 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-3xl font-bold text-primary">{totalScore}</p>
                  <p className="text-sm text-muted-foreground">Total Score</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-3xl font-bold">{correctCount}/{questions.length}</p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-3xl font-bold">{percentage}%</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => navigate("/dashboard/practice")}>
                  <Home className="mr-2 h-4 w-4" />
                  Back to Practice
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/practice")}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Exit
            </Button>
            <Badge variant="outline">{category === "all" ? "Mixed" : category}</Badge>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span className={cn("font-mono font-semibold", timeLeft < 60 && "text-destructive")}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      {/* Question */}
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <Badge className={cn(
            currentQuestion.difficulty === "easy" && "bg-success/10 text-success",
            currentQuestion.difficulty === "medium" && "bg-warning/10 text-warning",
            currentQuestion.difficulty === "hard" && "bg-destructive/10 text-destructive"
          )}>
            {currentQuestion.difficulty}
          </Badge>
        </div>

        <Card className="mb-6">
          <CardContent className="py-6">
            <p className="text-lg font-medium">{currentQuestion.text}</p>
          </CardContent>
        </Card>

        <div className="mb-8 space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              className={cn(
                "w-full rounded-lg border-2 p-4 text-left transition-all hover:border-primary",
                answers[currentQuestion.id] === option.id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm font-medium uppercase">
                {option.id}
              </span>
              {option.text}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex gap-1">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  idx === currentIndex ? "w-6 bg-primary" : answers[questions[idx].id] ? "bg-primary/50" : "bg-muted"
                )}
              />
            ))}
          </div>

          {currentIndex === questions.length - 1 ? (
            <Button onClick={handleFinish}>
              Finish
              <Check className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
