import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { adminDashboardStats, users, tryouts } from "@/data/mockData";
import { Users, FileQuestion, Package, DollarSign, ClipboardList, BookOpen, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const stats = adminDashboardStats;
  const recentUsers = users.slice(0, 5);
  const activeTryouts = tryouts.filter(t => t.isActive).slice(0, 4);

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
        </div>

        {/* Second Row Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            value="+15%"
            icon={TrendingUp}
            variant="primary"
          />
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
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Tryouts */}
          <Card>
            <CardHeader>
              <CardTitle>Active Tryouts</CardTitle>
              <CardDescription>Currently running tryouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeTryouts.map((tryout) => (
                  <div key={tryout.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{tryout.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {tryout.currentParticipants} participants
                      </p>
                    </div>
                    <Badge variant={tryout.type === "mass" ? "default" : "outline"}>
                      {tryout.type}
                    </Badge>
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
