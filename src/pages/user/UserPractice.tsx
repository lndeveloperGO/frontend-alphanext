import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, ArrowRight, Loader2 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";
import { attemptService } from "@/lib/attemptService";
import { useToast } from "@/hooks/use-toast";

interface Package {
  id: number;
  name: string;
  type: string;
  category_id: number;
  duration_seconds: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  questions_count: number;
  category: {
    id: number;
    name: string;
  };
}

export default function UserPractice() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingAttempt, setStartingAttempt] = useState<number | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/catalog/packages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch packages");
      }

      const result = await response.json();
      // API returns paginated data with structure: { success, data: { data: [...] } }
      const packagesData = result.data?.data || [];
      setPackages(packagesData);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast({
        title: "Error",
        description: "Failed to load packages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categoryColors: Record<string, string> = {
    "Demo Category": "bg-indigo-100 text-indigo-700",
    "Matematika": "bg-blue-100 text-blue-700",
    "Sains": "bg-green-100 text-green-700",
    "Geografi": "bg-yellow-100 text-yellow-700",
    "Sejarah": "bg-purple-100 text-purple-700",
    "Sastra": "bg-pink-100 text-pink-700",
  };

  const getCategoryColor = (categoryName: string): string => {
    return categoryColors[categoryName] || "bg-gray-100 text-gray-700";
  };

  const getTypeLabel = (type: string): string => {
    return type === "tryout" ? "Tryout" : "Practice";
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} min`;
  };

  const startPractice = async (packageId: number) => {
    try {
      setStartingAttempt(packageId);
      const response = await attemptService.startAttempt(packageId);
      
      if (response.success) {
        navigate(`/practice?attemptId=${response.data.attempt_id}`);
      }
    } catch (error) {
      console.error("Error starting attempt:", error);
      toast({
        title: "Error",
        description: "Failed to start practice session",
        variant: "destructive",
      });
    } finally {
      setStartingAttempt(null);
    }
  };

  return (
    <DashboardLayout type="user">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Practice Questions</h1>
          <p className="text-muted-foreground">Choose a package to start practicing</p>
        </div>

        {/* Quick Start */}
        {packages.length > 0 && (
          <Card className="gradient-primary text-primary-foreground">
            <CardContent className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary-foreground/20 p-3">
                  <Brain className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Quick Practice</h3>
                  <p className="text-primary-foreground/80">
                    Start with the first available package
                  </p>
                </div>
              </div>
              <Button
                variant="hero-outline"
                size="lg"
                onClick={() => startPractice(packages[0].id)}
                disabled={startingAttempt !== null}
              >
                {startingAttempt === packages[0].id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Start Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Packages Grid */}
        {!loading && packages.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`transition-all ${
                  startingAttempt === null
                    ? "hover-lift cursor-pointer hover:shadow-lg"
                    : "cursor-not-allowed opacity-50"
                }`}
                onClick={() => startingAttempt === null && startPractice(pkg.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={getCategoryColor(pkg.category.name)}>
                      {pkg.category.name}
                    </Badge>
                    {pkg.is_active ? (
                      <Badge className="bg-success/10 text-success">Active</Badge>
                    ) : (
                      <Badge className="bg-destructive/10 text-destructive">Inactive</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-2">{pkg.name}</CardTitle>
                  <CardDescription>
                    {pkg.questions_count} {pkg.questions_count === 1 ? "question" : "questions"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(pkg.duration_seconds)}</span>
                    </div>
                    {startingAttempt === pkg.id && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    <p>Type: {getTypeLabel(pkg.type)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && packages.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No packages available yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
