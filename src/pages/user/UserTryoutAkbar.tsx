import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, ArrowRight, Loader2, Package, AlertCircle, Star, Zap } from "lucide-react";
import { userService } from "@/lib/userService";
import { attemptService } from "@/lib/attemptService";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

interface PackageItem {
  package_id: number;
  name: string;
  type: string;
  starts_at: string | null;
  ends_at: string | null;
  status: "active" | "expired";
}

export default function UserTryoutAkbar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingAttempt, setStartingAttempt] = useState<number | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getStatisticsDashboard();
      const list = response.data?.active_packages ?? [];
      // Filter hanya paket dengan type "akbar"
      const akbarPackages = list.filter((pkg) => pkg.type === "akbar");
      setPackages(akbarPackages);
    } catch (err) {
      console.error("Error fetching packages:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat paket");
      toast({
        title: "Error",
        description: "Gagal memuat daftar Tryout Akbar. Coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const activePackages = packages.filter((pkg) => pkg.status === "active");

  const formatEndsAt = (dateString: string | null): string => {
    if (!dateString) return "Tanpa batas";
    try {
      return format(parseISO(dateString), "d MMM yyyy", { locale: id });
    } catch {
      return dateString;
    }
  };

  const startPractice = async (packageId: number) => {
    try {
      setStartingAttempt(packageId);
      const response = await attemptService.startAttempt(packageId);
      if (response.success) {
        // LOCKDOWN MODE: Buka di tab baru
        const lockdownUrl = `/lockdown-practice?attemptId=${response.data.attempt_id}`;
        window.open(lockdownUrl, '_blank', 'fullscreen=yes');
        
        toast({
          title: "Tryout Dimulai",
          description: "Tryout Akbar dibuka di tab baru dengan mode keamanan",
        });
      }
    } catch (err) {
      toast({
        title: "Gagal memulai",
        description: err instanceof Error ? err.message : "Tidak dapat memulai attempt",
        variant: "destructive",
      });
    } finally {
      setStartingAttempt(null);
    }
  };


  return (
    <DashboardLayout type="user">
      <div className="space-y-6">
        {/* Header with Premium Design */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-8 text-white">
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Tryout Akbar</h1>
            </div>
            <p className="max-w-2xl text-lg opacity-90">
              Uji kemampuan Anda dengan tryout skala besar. Bersaing dengan ribuan peserta lainnya dan raih peringkat terbaik!
            </p>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
            <Star className="absolute right-10 top-10 h-20 w-20 animate-pulse" />
            <Star className="absolute right-32 top-32 h-16 w-16 animate-pulse delay-75" />
            <Zap className="absolute right-20 bottom-10 h-24 w-24 animate-pulse delay-150" />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
              <Button variant="outline" size="sm" onClick={fetchPackages}>
                Coba lagi
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Start - hanya paket aktif */}
        {!loading && activePackages.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Mulai Tryout Akbar</h3>
                  <p className="text-sm text-muted-foreground">
                    Langsung mulai dengan tryout akbar pertama yang masih aktif
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => startPractice(activePackages[0].package_id)}
                disabled={startingAttempt !== null}
              >
                {startingAttempt === activePackages[0].package_id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memulai...
                  </>
                ) : (
                  <>
                    Mulai Sekarang
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Memuat Tryout Akbar...</p>
          </div>
        )}

        {/* Packages Grid */}
        {!loading && packages.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Daftar Tryout Akbar</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => {
                const canStart = pkg.status === "active" && startingAttempt === null;
                return (
                  <Card
                    key={pkg.package_id}
                    className={`relative overflow-hidden transition-all ${
                      canStart
                        ? "cursor-pointer hover:border-primary/50 hover:shadow-md"
                        : "cursor-not-allowed opacity-75"
                    }`}
                    onClick={() => canStart && startPractice(pkg.package_id)}
                  >
                    {/* Premium Badge */}
                    <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1">
                      <Trophy className="h-4 w-4 text-primary-foreground" />
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="secondary">
                          Tryout Akbar
                        </Badge>
                        <Badge
                          className={
                            pkg.status === "active"
                              ? "bg-green-600 hover:bg-green-600"
                              : "bg-red-600 hover:bg-red-600"
                          }
                        >
                          {pkg.status === "active" ? "Aktif" : "Kadaluarsa"}
                        </Badge>
                      </div>
                      <CardTitle className="mt-2 text-base">{pkg.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {pkg.ends_at && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>Berakhir pada {formatEndsAt(pkg.ends_at)}</span>
                        </div>
                      )}
                      {startingAttempt === pkg.package_id && (
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Memulai...
                        </div>
                      )}
                      {canStart && startingAttempt !== pkg.package_id && (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            startPractice(pkg.package_id);
                          }}
                        >
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Mulai Tryout
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && packages.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Trophy className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-1 text-xl font-semibold">Belum Ada Tryout Akbar</h3>
              <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                Anda belum memiliki paket Tryout Akbar. Beli paket di My Packages untuk mengikuti tryout skala besar.
              </p>
              <Button asChild variant="default">
                <Link to="/dashboard/packages">
                  <Package className="mr-2 h-4 w-4" />
                  Lihat Paket
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        {!loading && packages.length > 0 && (
          <Card className="border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <AlertCircle className="h-5 w-5" />
                Tentang Tryout Akbar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p>• Tryout Akbar adalah ujian simulasi skala besar dengan ribuan peserta</p>
              <p>• Hasil Anda akan dibandingkan dengan peserta lain secara real-time</p>
              <p>• Peringkat dan skor akan ditampilkan di halaman Rankings</p>
              <p>• Pastikan koneksi internet stabil sebelum memulai</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
