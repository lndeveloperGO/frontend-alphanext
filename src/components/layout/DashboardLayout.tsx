import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/authStore";
import { getAppName, getThemePrimary } from "@/lib/env";
import { authService } from "@/lib/authService";
const appName = getAppName();
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  FileQuestion,
  Package,
  Ticket,
  BookOpen,
  ClipboardList,
  Trophy,
  LogOut,
  Menu,
  X,
  User,
  Tag,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const adminNavItems: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Categories", href: "/admin/categories", icon: Tag },
  { title: "Promo Codes", href: "/admin/promo-codes", icon: Ticket },
  { title: "Packages", href: "/admin/packages", icon: Package },
  { title: "Questions", href: "/admin/questions", icon: FileQuestion },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Vouchers", href: "/admin/vouchers", icon: Ticket },
  { title: "Materials", href: "/admin/materials", icon: BookOpen },
  { title: "Rankings", href: "/admin/rankings", icon: Trophy },
  { title: "My Profile", href: "/admin/profile", icon: User },
];

const userNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Packages", href: "/dashboard/packages", icon: Package },
  // { title: "Practice", href: "/dashboard/practice", icon: FileQuestion },
  { title: "Tryouts", href: "/dashboard/tryouts", icon: ClipboardList },
  { title: "Materials", href: "/dashboard/materials", icon: BookOpen },
  { title: "My Profile", href: "/dashboard/profile", icon: User },
  // { title: "Test Page", href: "/dashboard/test", icon: FileQuestion },
  // { title: "History", href: "/dashboard/history", icon: BookOpen },
  // { title: "Rankings", href: "/dashboard/rankings", icon: Trophy },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  type: "admin" | "user";
}

export function DashboardLayout({ children, type }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, token } = useAuthStore();

  const navItems = type === "admin" ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    const result = await authService.logout();
    if (result.success) {
      logout();
      navigate("/");
    } else {
      console.error("Logout failed:", result.error);
      // Fallback: logout locally even if API call fails
      logout();
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <img
              src="/logoAlphanext.jpg"
              alt={appName}
              className="h-9 w-9 rounded-xl"
            />
          </div>
          <span className="font-bold text-primary">{appName}</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
            isCollapsed ? "w-[70px]" : "w-64",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <img
                    src="/logoAlphanext.jpg"
                    alt={appName}
                    className="h-9 w-9 rounded-xl"
                  />
                </div>
                {!isCollapsed && (
                  <span className="font-bold text-sidebar-foreground">{appName}</span>
                )}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  );
                })}
              </nav>
            </ScrollArea>

            {/* User Profile */}
            <div className="border-t border-sidebar-border p-4">
              <div className={cn(
                "flex items-center gap-3",
                isCollapsed && "justify-center"
              )}>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-sidebar-foreground">
                      {user?.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                )}
                {!isCollapsed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="shrink-0"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="mt-2 w-full"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 transition-all duration-300",
            isCollapsed ? "lg:ml-[70px]" : "lg:ml-64"
          )}
        >
          <div className="min-h-screen p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
