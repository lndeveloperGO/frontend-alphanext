import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Users, FileQuestion, Package, DollarSign, ClipboardList, BookOpen, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { userService, User } from "@/lib/userService";
import { questionService } from "@/lib/questionService";
import { packageService, Package as PackageType } from "@/lib/packageService";
import { categoryService } from "@/lib/categoryService";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalQuestions: 0,
    totalPackages: 0,
    totalRevenue: 10000000, // mock value
    activeTryouts: 0,
    totalMaterials: 0,
    growth: 15, // mock value
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [activeTryouts, setActiveTryouts] = useState<PackageType[]>([]);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, questions, packages, categories] = await Promise.all([
        userService.getUsers(),
        questionService.getQuestions(),
        packageService.getPackages(),
        categoryService.getCategories(),
      ]);

      const activePackages = packages.filter(p => p.is_active);
      const tryoutPackages = packages.filter(p => p.type === 'tryout' && p.is_active);

      setStats({
        totalUsers: usersRes.summary.total_users,
        activeUsers: usersRes.summary.total_active,
        totalQuestions: questions.length,
        totalPackages: activePackages.length,
        totalRevenue: 10000000, // keep mock
        activeTryouts: tryoutPackages.length,
        totalMaterials: categories.length,
        growth: 15, // keep mock
      });

      setRecentUsers(usersRes.data.data.slice(0, 5));
      setActiveTryouts(tryoutPackages.slice(0, 4));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <DashboardLayout type="admin">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout type="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Users"
                value={stats.totalUsers.toLocaleString()}
                subtitle={`${stats.activeUsers} active`}
                icon={Users}
                trend={{ value: 12, isPositive: true }}
              />
              <StatCard
                title="Total Questions"
                value={stats.totalQuestions.toLocaleString()}
                icon={FileQuestion}
                variant="primary"
              />
              <StatCard
                title="Active Packages"
                value={stats.totalPackages}
                icon={Package}
              />
              <StatCard
                title="Total Revenue"
                value={`Rp ${(stats.totalRevenue / 1000000).toFixed(1)}M`}
                icon={DollarSign}
                trend={{ value: 8, isPositive: true }}
                variant="gradient"
              />
            </>
          )}
        </div>

        {/* Second Row Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Active Tryouts"
                value={stats.activeTryouts}
                icon={ClipboardList}
              />
              <StatCard
                title="Learning Materials"
                value={stats.totalMaterials}
                icon={BookOpen}
              />
              <StatCard
                title="This Month Growth"
                value={`+${stats.growth}%`}
                icon={TrendingUp}
                variant="primary"
              />
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest registered users</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-12" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "active" : "inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Tryouts */}
          <Card>
            <CardHeader>
              <CardTitle>Active Tryouts</CardTitle>
              <CardDescription>Currently running tryout packages</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-5 w-12" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTryouts.map((pkg) => (
                    <div key={pkg.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{pkg.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {pkg.category?.name || 'No category'}
                        </p>
                      </div>
                      <Badge variant="default">
                        {pkg.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
