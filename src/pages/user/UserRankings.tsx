import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { rankings } from "@/data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

export default function AdminRankings() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
      default:
        return "bg-card";
    }
  };

  return (
    <DashboardLayout type="user">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Rankings & Leaderboard</h1>
          <p className="text-muted-foreground">View top performers across all tryouts</p>
        </div>

        {/* Top 3 Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {rankings.slice(0, 3).map((ranking) => (
            <div
              key={ranking.id}
              className={`rounded-xl border-2 p-6 text-center ${getRankStyle(ranking.rank)}`}
            >
              <div className="mb-4 flex justify-center">
                {getRankIcon(ranking.rank)}
              </div>
              <Avatar className="mx-auto mb-3 h-16 w-16">
                <AvatarImage src={ranking.userAvatar} alt={ranking.userName} />
                <AvatarFallback>{ranking.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">{ranking.userName}</h3>
              <p className="text-sm text-muted-foreground">{ranking.tryoutName}</p>
              <div className="mt-4">
                <p className="text-3xl font-bold text-primary">{ranking.score}</p>
                <p className="text-sm text-muted-foreground">points</p>
              </div>
              <div className="mt-4 flex justify-center gap-4 text-sm">
                <div>
                  <p className="font-medium">{ranking.correctAnswers}/{ranking.totalQuestions}</p>
                  <p className="text-muted-foreground">Correct</p>
                </div>
                <div>
                  <p className="font-medium">{Math.round(ranking.timeSpent / 60)}m</p>
                  <p className="text-muted-foreground">Time</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full Rankings Table */}
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <h3 className="font-semibold">All Rankings</h3>
          </div>
          <div className="divide-y">
            {rankings.map((ranking) => (
              <div
                key={ranking.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold">
                    {ranking.rank <= 3 ? getRankIcon(ranking.rank) : `#${ranking.rank}`}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={ranking.userAvatar} alt={ranking.userName} />
                    <AvatarFallback>{ranking.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{ranking.userName}</p>
                    <p className="text-sm text-muted-foreground">{ranking.tryoutName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-semibold">{ranking.correctAnswers}/{ranking.totalQuestions}</p>
                    <p className="text-xs text-muted-foreground">Correct</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{Math.round(ranking.timeSpent / 60)}m</p>
                    <p className="text-xs text-muted-foreground">Time</p>
                  </div>
                  <Badge variant="default" className="ml-4">
                    {ranking.score} pts
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
