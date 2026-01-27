import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { questions } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, ArrowRight } from "lucide-react";

export default function UserPractice() {
  const navigate = useNavigate();
  
  // Group questions by category
  const categories = questions.reduce((acc, q) => {
    if (!acc[q.category]) {
      acc[q.category] = [];
    }
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, typeof questions>);

  const categoryColors: Record<string, string> = {
    Mathematics: "bg-blue-100 text-blue-700",
    Science: "bg-green-100 text-green-700",
    Geography: "bg-yellow-100 text-yellow-700",
    History: "bg-purple-100 text-purple-700",
    Literature: "bg-pink-100 text-pink-700",
  };

  const startPractice = (category: string) => {
    navigate(`/practice?category=${encodeURIComponent(category)}`);
  };

  return (
    <DashboardLayout type="user">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Practice Questions</h1>
          <p className="text-muted-foreground">Choose a category to start practicing</p>
        </div>

        {/* Quick Start */}
        <Card className="gradient-primary text-primary-foreground">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary-foreground/20 p-3">
                <Brain className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Quick Practice</h3>
                <p className="text-primary-foreground/80">
                  Start a random practice session with mixed questions
                </p>
              </div>
            </div>
            <Button
              variant="hero-outline"
              size="lg"
              onClick={() => navigate("/practice?category=all")}
            >
              Start Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(categories).map(([category, categoryQuestions]) => {
            const easyCount = categoryQuestions.filter(q => q.difficulty === "easy").length;
            const mediumCount = categoryQuestions.filter(q => q.difficulty === "medium").length;
            const hardCount = categoryQuestions.filter(q => q.difficulty === "hard").length;

            return (
              <Card key={category} className="hover-lift cursor-pointer" onClick={() => startPractice(category)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={categoryColors[category] || "bg-gray-100 text-gray-700"}>
                      {category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {categoryQuestions.length} questions
                    </span>
                  </div>
                  <CardTitle className="mt-2">{category}</CardTitle>
                  <CardDescription>
                    Practice {category.toLowerCase()} questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 text-xs">
                    {easyCount > 0 && (
                      <span className="rounded-full bg-success/10 px-2 py-1 text-success">
                        {easyCount} Easy
                      </span>
                    )}
                    {mediumCount > 0 && (
                      <span className="rounded-full bg-warning/10 px-2 py-1 text-warning">
                        {mediumCount} Medium
                      </span>
                    )}
                    {hardCount > 0 && (
                      <span className="rounded-full bg-destructive/10 px-2 py-1 text-destructive">
                        {hardCount} Hard
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>~{categoryQuestions.length * 2} min</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
