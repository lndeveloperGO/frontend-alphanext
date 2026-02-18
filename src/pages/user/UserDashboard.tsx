import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { useAuthStore } from "@/stores/authStore";
import { Package, FileQuestion, ClipboardList, Trophy, Clock, TrendingUp, Play, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { userService } from "@/lib/userService";
import { attemptService } from "@/lib/attemptService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

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
    starts_at: string | null;
    ends_at: string | null;
    status: "active" | "expired";
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

function formatEndsAt(isoDate: string | null): string {
  if (!isoDate) return "Tanpa batas";
  try {
    return format(parseISO(isoDate), "d MMM yyyy", { locale: id });
  } catch {
    return isoDate;
  }
}

export default function UserDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingPackageId, setStartingPackageId] = useState<number | null>(null);

  const handleStartAttempt = async (packageId: number) => {
    try {
      setStartingPackageId(packageId);
      const response = await attemptService.startAttempt(packageId);
      if (response.success) {
        navigate(`/practice?attemptId=${response.data.attempt_id}`);
      }
    } catch (err) {
      toast({
        title: "Gagal memulai",
        description: err instanceof Error ? err.message : "Tidak dapat memulai attempt",
        variant: "destructive",
      });
    } finally {
      setStartingPackageId(null);
    }
  };

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
          <h1 className="text-2xl font-bold">Selamat datang kembali, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">Pantau kemajuan Anda dan teruslah belajar.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Memuat dashboard...</p>
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
                title="Paket Aktif"
                value={data.summary.active_packages}
                icon={Package}
              />
              <StatCard
                title="Latihan Selesai"
                value={data.summary.completed_practices}
                icon={FileQuestion}
              />
              <StatCard
                title="Tryout Selesai"
                value={data.summary.completed_tryouts}
                icon={ClipboardList}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Skor Rata-rata"
                value={`${data.summary.average_score_percent}%`}
                icon={TrendingUp}
                variant="gradient"
              />
              <StatCard
                title="Peringkat Saat Ini"
                value={`#${data.summary.current_rank}`}
                icon={Trophy}
                variant="primary"
              />
              <StatCard
                title="Waktu Belajar"
                value={`${Math.round(data.summary.study_time_minutes / 60)}j`}
                subtitle={`total ${data.summary.study_time_minutes} menit`}
                icon={Clock}
              />
            </div>

            {/* Progress Section */}
            <Card>
              <CardHeader>
                <CardTitle>Kemajuan Belajar</CardTitle>
                <CardDescription>Perjalanan belajar Anda secara keseluruhan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>Pertanyaan Latihan</span>
                      <span className="text-muted-foreground">
                        {data.learning_progress.practice_questions_percent}%
                      </span>
                    </div>
                    <Progress value={data.learning_progress.practice_questions_percent} className="h-2" />
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>Penyelesaian Tryout</span>
                      <span className="text-muted-foreground">
                        {data.learning_progress.tryout_completion_percent}%
                      </span>
                    </div>
                    <Progress value={data.learning_progress.tryout_completion_percent} className="h-2" />
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>Materi yang Dipelajari</span>
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
              {/* Paket Saya / Masa Aktif */}
              <Card>
                <CardHeader>
                  <CardTitle>Paket Saya</CardTitle>
                  <CardDescription>Daftar paket dan masa aktif akses Anda</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.active_packages.length > 0 ? (
                      data.active_packages.map((pkg) => (
                        <div
                          key={pkg.package_id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{pkg.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {pkg.ends_at
                                ? `Berakhir pada ${formatEndsAt(pkg.ends_at)}`
                                : "Tanpa batas waktu"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={pkg.status === "active" ? "default" : "destructive"}
                              className={
                                pkg.status === "active"
                                  ? "bg-green-600 hover:bg-green-600"
                                  : "bg-red-600 hover:bg-red-600"
                              }
                            >
                              {pkg.status === "active" ? "Aktif" : "Kadaluarsa"}
                            </Badge>
                            <Button
                              size="sm"
                              disabled={pkg.status !== "active" || startingPackageId !== null}
                              onClick={() => handleStartAttempt(pkg.package_id)}
                            >
                              {startingPackageId === pkg.package_id ? (
                                <>
                                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                  Memulai...
                                </>
                              ) : (
                                <>
                                  <Play className="mr-1 h-4 w-4" />
                                  Mulai
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Belum ada paket aktif</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Practice */}
              <Card>
                <CardHeader>
                  <CardTitle>Aktivitas Terbaru</CardTitle>
                  <CardDescription>Riwayat latihan Anda</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.recent_activity.length > 0 ? (
                      data.recent_activity.slice(0, 5).map((activity) => (
                        <div key={activity.attempt_id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{activity.package_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.correct_count}/{activity.total_questions} benar
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
                      <p className="text-sm text-muted-foreground">Tidak ada aktivitas terbaru</p>
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
