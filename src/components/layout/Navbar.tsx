import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getAppName, getThemePrimary } from "@/lib/env";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const appName = getAppName();

  const dashboardLink = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logoAlphanext.jpg" 
              alt={appName}
              className="h-9 w-9 rounded-xl"
            />
            <span className="text-xl font-bold text-foreground">{appName}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              to="/#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              to="/#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              to="/#testimonial"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Testimonial
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to={dashboardLink}>Dashboard</Link>
                </Button>
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Mulai Sekarang!</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "absolute left-0 right-0 top-16 border-b bg-card p-4 md:hidden",
          isMobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="flex flex-col gap-4">
          <Link
            to="/#features"
            className="text-sm font-medium text-muted-foreground"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            to="/#pricing"
            className="text-sm font-medium text-muted-foreground"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            to="/#about"
            className="text-sm font-medium text-muted-foreground"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>
          <hr className="border-border" />
          {isAuthenticated ? (
            <>
              <Button variant="ghost" asChild className="justify-start">
                <Link to={dashboardLink} onClick={() => setIsMobileMenuOpen(false)}>
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="justify-start">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
              </Button>
              <Button asChild>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
