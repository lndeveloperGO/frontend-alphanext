import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { userDashboardStats, purchases, practiceHistory } from "@/data/mockData";
import { useAuthStore } from "@/stores/authStore";
import { Package, FileQuestion, ClipboardList, Trophy, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function UserDashboard() {
  const { user } = useAuthStore();
  const stats = userDashboardStats;
  const userPurchases = purchases.filter(p => p.userId === "2").slice(0, 3);
  const userHistory = practiceHistory.filter(p => p.userId === "2").slice(0, 5);

  return (
    <DashboardLayout type="user">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">Track your progress and continue learning.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Active Packages"
            value={stats.purchasedPackages}
            icon={Package}
          />
          <StatCard
            title="Completed Practices"
            value={stats.completedPractices}
            icon={FileQuestion}
          />
          <StatCard
            title="Completed Tryouts"
            value={stats.completedTryouts}
            icon={ClipboardList}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            icon={TrendingUp}
            variant="gradient"
          />
          <StatCard
            title="Current Rank"
            value={`#${stats.currentRank}`}
            icon={Trophy}
            variant="primary"
          />
          <StatCard
            title="Study Time"
            value={`${Math.round(stats.totalStudyTime / 60)}h`}
            subtitle={`${stats.totalStudyTime} minutes total`}
            icon={Clock}
          />
        </div>

        {/* Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>Your overall learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Practice Questions</span>
                  <span className="text-muted-foreground">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Tryout Completion</span>
                  <span className="text-muted-foreground">60%</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Materials Studied</span>
                  <span className="text-muted-foreground">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Active Packages */}
          <Card>
            <CardHeader>
              <CardTitle>Active Packages</CardTitle>
              <CardDescription>Your current subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{purchase.packageName}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {purchase.expiryDate}
                      </p>
                    </div>
                    <Badge variant={purchase.status === "active" ? "default" : "secondary"}>
                      {purchase.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Practice */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your practice history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userHistory.map((history) => (
                  <div key={history.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{history.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {history.correctAnswers}/{history.totalQuestions} correct
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{history.score}%</p>
                      <Badge variant="outline" className="text-xs">
                        {history.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
