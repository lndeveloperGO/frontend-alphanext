import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, AlertCircle, Loader2 } from "lucide-react";
import {
  fetchPackageRankings,
  fetchUserStatisticsDashboard,
  type PackageRankingResponse,
  type StatisticsDashboardResponse,
  type RankingItem,
  type ActivePackage,
} from "@/lib/rankingService";
import { useAuthStore } from "@/stores/authStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function UserRankings() {
  const [dashboardStats, setDashboardStats] = useState<StatisticsDashboardResponse | null>(null);
  const [packageRankingsMap, setPackageRankingsMap] = useState<Map<number, PackageRankingResponse>>(new Map());
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userProfile = useAuthStore((state) => state.user);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user statistics dashboard
        const stats = await fetchUserStatisticsDashboard();
        setDashboardStats(stats);

        // Filter packages dengan tipe tryout dan akbar
        const tryoutAkbarPackages = stats?.data?.active_packages?.filter(
          (pkg: ActivePackage) => pkg.type === "tryout" || pkg.type === "akbar"
        ) || [];

        if (tryoutAkbarPackages.length > 0) {
          // Set selected package to first one
          setSelectedPackageId(tryoutAkbarPackages[0].package_id);

          // Fetch rankings untuk semua paket
          const rankingsMap = new Map<number, PackageRankingResponse>();

          for (const pkg of tryoutAkbarPackages) {
            try {
              const rankings = await fetchPackageRankings(pkg.package_id);
              if (rankings) {
                rankingsMap.set(pkg.package_id, rankings);
              }
            } catch (err) {
              console.error(`Error fetching rankings for package ${pkg.package_id}:`, err);
            }
          }

          setPackageRankingsMap(rankingsMap);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data peringkat");
        console.error("Error loading rankings:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile) {
      loadData();
    }
  }, [userProfile]);

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

  if (loading) {
    return (
      <DashboardLayout type="user">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Filter packages dengan tipe tryout dan akbar
  const tryoutAkbarPackages = dashboardStats?.data?.active_packages?.filter(
    (pkg: ActivePackage) => pkg.type === "tryout" || pkg.type === "akbar"
  ) || [];

  // Get current selected rankings
  const currentRankings = selectedPackageId
    ? packageRankingsMap.get(selectedPackageId)
    : null;

  const currentPackage = tryoutAkbarPackages.find(
    pkg => pkg.package_id === selectedPackageId
  );

  const rankings = currentRankings?.data?.items || [];
  const myRank = currentRankings?.data?.my_rank;
  const packageName = currentRankings?.data?.package_name;

  if (tryoutAkbarPackages.length === 0) {
    return (
      <DashboardLayout type="user">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Peringkat & Klasemen</h1>
            <p className="text-muted-foreground">
              Lihat performa terbaik di semua tryout dan akbar
            </p>
          </div>
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              Belum ada paket tryout atau akbar yang tersedia.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout type="user">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Peringkat & Klasemen</h1>
          <p className="text-muted-foreground">
            Lihat performa terbaik di semua tryout dan akbar
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tabs for Package Selection */}
        {tryoutAkbarPackages.length > 0 && (
          <Tabs
            value={selectedPackageId?.toString() || ""}
            onValueChange={(value) => setSelectedPackageId(parseInt(value))}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              {tryoutAkbarPackages.map((pkg: ActivePackage) => (
                <TabsTrigger
                  key={pkg.package_id}
                  value={pkg.package_id.toString()}
                  className="truncate text-xs sm:text-sm"
                >
                  {pkg.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {tryoutAkbarPackages.map((pkg: ActivePackage) => (
              <TabsContent
                key={pkg.package_id}
                value={pkg.package_id.toString()}
                className="space-y-6"
              >
                {/* Top 3 Cards */}
                {rankings.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-3">
                    {rankings.slice(0, 3).map((ranking: RankingItem) => (
                      <div
                        key={`${ranking.user.id}-top3`}
                        className={`rounded-xl border-2 p-6 text-center ${getRankStyle(ranking.rank)}`}
                      >
                        <div className="mb-4 flex justify-center">
                          {getRankIcon(ranking.rank)}
                        </div>
                        <Avatar className="mx-auto mb-3 h-16 w-16">
                          <AvatarImage src={ranking.user.avatar} alt={ranking.user.name} />
                          <AvatarFallback>{ranking.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold">{ranking.user.name}</h3>
                        <div className="mt-4">
                          <p className="text-3xl font-bold text-primary">{ranking.score}</p>
                          <p className="text-sm text-muted-foreground">poin</p>
                        </div>
                        {ranking.submitted_at && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {new Date(ranking.submitted_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* My Current Rank */}
                {myRank && userProfile && (
                  <div className="rounded-lg border bg-gradient-to-r from-primary/10 to-primary/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                          <AvatarFallback>{userProfile.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm text-muted-foreground">Peringkat Anda Saat Ini</p>
                          <p className="font-semibold">#{myRank}</p>
                        </div>
                      </div>
                      <Badge variant="default">
                        Lihat Detail
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Full Rankings Table */}
                {rankings.length > 0 ? (
                  <div className="rounded-lg border bg-card">
                    <div className="border-b p-4">
                      <h3 className="font-semibold">Semua Peringkat</h3>
                    </div>
                    <div className="divide-y">
                      {rankings.map((ranking: RankingItem) => (
                        <div
                          key={`${ranking.user.id}-${ranking.rank}`}
                          className="flex flex-col gap-4 p-4 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold">
                              {ranking.rank <= 3 ? getRankIcon(ranking.rank) : `#${ranking.rank}`}
                            </div>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={ranking.user.avatar} alt={ranking.user.name} />
                              <AvatarFallback>{ranking.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{ranking.user.name}</p>
                              {ranking.submitted_at && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(ranking.submitted_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
                            <Badge variant="secondary" className="text-base">
                              {ranking.score} pts
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">Belum ada data peringkat untuk paket ini.</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* Recent Activity - Global */}
        {/* {dashboardStats?.data?.recent_activity && dashboardStats.data.recent_activity.length > 0 && (
          <div className="rounded-lg border bg-card">
            <div className="border-b p-4">
              <h3 className="font-semibold">Recent Activity</h3>
            </div>
            <div className="divide-y">
              {dashboardStats.data.recent_activity.map((activity) => (
                <div key={activity.attempt_id} className="flex flex-col gap-4 p-4 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{activity.package_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{activity.package_type}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
                    <div className="text-center sm:text-right">
                      <p className="font-semibold">{activity.correct_count}/{activity.total_questions}</p>
                      <p className="text-xs text-muted-foreground">Correct</p>
                    </div>
                    <Badge variant="secondary" className="text-base">
                      {activity.score_percent}%
                    </Badge>
                    <p className="text-xs text-muted-foreground w-20 text-right">
                      {new Date(activity.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>
    </DashboardLayout>
  );
}
