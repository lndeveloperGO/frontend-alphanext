import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { useAuthStore } from "@/stores/authStore";
import { Package, FileQuestion, ClipboardList, Trophy, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { userService } from "@/lib/userService";
import { useEffect, useState } from "react";

interface DashboardData {
  summary: {
    active_packages: number;
    in_progress_attempts: number;
    completed_practices: number;
    completed_tryouts: number;
    average_score_percent: number;
    current_rank: number;
    study_time_minutes: number;
  };
  learning_progress: {
    practice_questions_percent: number;
    tryout_completion_percent: number;
    materials_studied_percent: number;
  };
  active_packages: Array<{
    package_id: number;
    name: string;
    type: string;
    expires_at: string | null;
    status: string;
  }>;
  recent_activity: Array<{
    attempt_id: number;
    package_id: number;
    package_name: string;
    package_type: string;
    score_percent: number;
    correct_count: number;
    total_questions: number;
    submitted_at: string;
  }>;
}

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await userService.getStatisticsDashboard();
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout type="user">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">Track your progress and continue learning.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="text-destructive">{error}</p>
          </div>
        ) : data ? (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Active Packages"
                value={data.summary.active_packages}
                icon={Package}
              />
              <StatCard
                title="Completed Practices"
                value={data.summary.completed_practices}
                icon={FileQuestion}
              />
              <StatCard
                title="Completed Tryouts"
                value={data.summary.completed_tryouts}
                icon={ClipboardList}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Average Score"
                value={`${data.summary.average_score_percent}%`}
                icon={TrendingUp}
                variant="gradient"
              />
              <StatCard
                title="Current Rank"
                value={`#${data.summary.current_rank}`}
                icon={Trophy}
                variant="primary"
              />
              <StatCard
                title="Study Time"
                value={`${Math.round(data.summary.study_time_minutes / 60)}h`}
                subtitle={`${data.summary.study_time_minutes} minutes total`}
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
                      <span className="text-muted-foreground">
                        {data.learning_progress.practice_questions_percent}%
                      </span>
                    </div>
                    <Progress value={data.learning_progress.practice_questions_percent} className="h-2" />
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>Tryout Completion</span>
                      <span className="text-muted-foreground">
                        {data.learning_progress.tryout_completion_percent}%
                      </span>
                    </div>
                    <Progress value={data.learning_progress.tryout_completion_percent} className="h-2" />
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>Materials Studied</span>
                      <span className="text-muted-foreground">
                        {data.learning_progress.materials_studied_percent}%
                      </span>
                    </div>
                    <Progress value={data.learning_progress.materials_studied_percent} className="h-2" />
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
                    {data.active_packages.length > 0 ? (
                      data.active_packages.map((pkg) => (
                        <div key={pkg.package_id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{pkg.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {pkg.expires_at ? `Expires: ${pkg.expires_at}` : "No expiry date"}
                            </p>
                          </div>
                          <Badge variant={pkg.status === "active" ? "default" : "secondary"}>
                            {pkg.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No active packages</p>
                    )}
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
                    {data.recent_activity.length > 0 ? (
                      data.recent_activity.slice(0, 5).map((activity) => (
                        <div key={activity.attempt_id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{activity.package_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.correct_count}/{activity.total_questions} correct
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">{activity.score_percent}%</p>
                            <Badge variant="outline" className="text-xs">
                              {activity.package_type}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
