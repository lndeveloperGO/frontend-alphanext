import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { userService } from "@/lib/userService";
import { attemptService } from "@/lib/attemptService";
import { useToast } from "@/hooks/use-toast";

interface Package {
  package_id: number;
  name: string;
  type: string;
  category_id: number;
  is_free: boolean;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
}

export default function UserPractice() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingAttempt, setStartingAttempt] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserPackages();
      setPackages(response.data);
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

  const getTypeLabel = (type: string): string => {
    return type === "tryout" ? "Tryout" : "Latihan";
  };

  const getFilteredPackages = (): Package[] => {
    if (selectedType === "all") {
      return packages;
    }
    return packages.filter((pkg) => pkg.type === selectedType);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "No expiry date";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

        {/* Filter by Type */}
        {!loading && packages.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              onClick={() => setSelectedType("all")}
            >
              All
            </Button>
            <Button
              variant={selectedType === "latihan" ? "default" : "outline"}
              onClick={() => setSelectedType("latihan")}
            >
              Practice
            </Button>
            <Button
              variant={selectedType === "tryout" ? "default" : "outline"}
              onClick={() => setSelectedType("tryout")}
            >
              Tryout
            </Button>
          </div>
        )}

        {/* Quick Start */}
        {getFilteredPackages().length > 0 && (
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
                onClick={() => startPractice(getFilteredPackages()[0].package_id)}
                disabled={startingAttempt !== null}
              >
                {startingAttempt === getFilteredPackages()[0].package_id ? (
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
        {!loading && getFilteredPackages().length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getFilteredPackages().map((pkg) => (
              <Card
                key={pkg.package_id}
                className={`transition-all ${
                  startingAttempt === null
                    ? "hover-lift cursor-pointer hover:shadow-lg"
                    : "cursor-not-allowed opacity-50"
                }`}
                onClick={() => startingAttempt === null && startPractice(pkg.package_id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className={pkg.is_free ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                        {pkg.is_free ? "Free" : "Paid"}
                      </Badge>
                    </div>
                    {pkg.status === "active" ? (
                      <Badge className="bg-success/10 text-success">Active</Badge>
                    ) : (
                      <Badge className="bg-destructive/10 text-destructive">{pkg.status}</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-2">{pkg.name}</CardTitle>
                  <CardDescription>
                    Type: {getTypeLabel(pkg.type)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pkg.ends_at && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Expires: {formatDate(pkg.ends_at)}</span>
                      </div>
                    )}
                    {startingAttempt === pkg.package_id && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm">Starting...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && getFilteredPackages().length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {packages.length === 0
                  ? "No packages available yet"
                  : `No ${selectedType === "all" ? "" : selectedType} packages available`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
