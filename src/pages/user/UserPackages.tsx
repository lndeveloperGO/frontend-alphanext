import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Package, Loader2, AlertCircle, Play } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { userService, PackageItem, PromoItem } from "@/lib/userService";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { attemptService } from "@/lib/attemptService";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface ActivePackage {
  package_id: number;
  name: string;
  type: string;
  category_id: number;
  starts_at: string | null;
  ends_at: string | null;
  status: "active" | "expired";
  is_free: boolean;
}

function formatEndsAt(isoDate: string | null): string {
  if (!isoDate) return "Tanpa batas";
  try {
    return format(parseISO(isoDate), "d MMM yyyy", { locale: id });
  } catch {
    return isoDate;
  }
}

export default function UserPackages() {
  const [bundles, setBundles] = useState<PackageItem[]>([]);
  const [regular, setRegular] = useState<PackageItem[]>([]);
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [activePackages, setActivePackages] = useState<ActivePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingPackageId, setStartingPackageId] = useState<number | null>(null);

  const navigate = useNavigate();
  const { setSelectedPackage } = useCheckoutStore();
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

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
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch dashboard data (bundles, regular packages, promos)
        const dashboardResponse = await userService.getDashboard();
        if (dashboardResponse.success) {
          setBundles(dashboardResponse.data.bundles.filter(b => b.is_active));
          setRegular(dashboardResponse.data.regular.filter(r => r.is_active));
          setPromos(dashboardResponse.data.promos.filter(p => p.status === 'active'));
        }

        // Fetch user's active packages from statistics dashboard
        const statsResponse = await userService.getStatisticsDashboard();
        if (statsResponse.success) {
          setActivePackages(statsResponse.data.active_packages);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectPackage = (product: PackageItem) => {
    setSelectedPackage(product);
    navigate("/dashboard/checkout");
  };

  return (
    <DashboardLayout type="user">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">My Packages</h1>
          <p className="text-muted-foreground">View your purchased packages and explore more</p>
        </div>

        {/* Active Subscriptions - User's Purchased Packages */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Active Subscriptions</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading your packages...</span>
            </div>
          ) : activePackages.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activePackages.map((pkg) => {
                const isActive = pkg.status === "active";
                return (
                  <Card key={pkg.package_id} className="relative overflow-hidden">
                    <div className={`absolute right-0 top-0 rounded-bl-lg px-3 py-1 text-xs font-medium text-primary-foreground ${
                      isActive ? "bg-green-600" : "bg-red-600"
                    }`}>
                      {isActive ? "Active" : "Expired"}
                    </div>
                    <CardHeader>
                      <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                        <img 
                          src={`https://picsum.photos/1024/1024?random=${pkg.package_id}`} 
                          alt={pkg.name} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <CardTitle className="mt-4">{pkg.name}</CardTitle>
                      <CardDescription>
                        <Badge variant="outline" className="mt-2">
                          {pkg.type}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {pkg.starts_at && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mulai</span>
                            <span>{formatEndsAt(pkg.starts_at)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {pkg.ends_at ? "Berakhir" : "Masa Aktif"}
                          </span>
                          <span>{formatEndsAt(pkg.ends_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge 
                            variant={isActive ? "default" : "destructive"}
                            className={isActive ? "bg-green-600 hover:bg-green-600" : ""}
                          >
                            {isActive ? "Aktif" : "Kadaluarsa"}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        className="mt-4 w-full" 
                        variant={isActive ? "default" : "outline"}
                        disabled={!isActive || startingPackageId !== null}
                        onClick={() => handleStartAttempt(pkg.package_id)}
                      >
                        {startingPackageId === pkg.package_id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Memulai...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            {isActive ? "Mulai Latihan" : "Tidak Tersedia"}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Belum Ada Paket Aktif</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Anda belum memiliki paket berlangganan. Pilih paket di bawah untuk memulai.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading packages...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Bundle Packages */}
        {!loading && !error && bundles.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold">Paket Bundling (Hemat)</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bundles.map((bundle) => (
                <Card key={bundle.id} className="relative overflow-hidden">
                  <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    {bundle.is_active ? 'Available' : 'Inactive'}
                  </div>
                  <CardHeader>
                    <div className="flex h-1/3 w-1/3 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                      <img src={`https://picsum.photos/1024/1024?random=${bundle.id}`} alt="package" className="h-full w-full object-cover" />
                    </div>
                    <CardTitle className="mt-2">{bundle.name}</CardTitle>
                    <CardDescription>{bundle.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">{formatPrice(bundle.price)}</span>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Isi Paket:</h4>
                      <ul className="space-y-1">
                        {bundle.packages
                          ?.sort((a, b) => a.pivot.sort_order - b.pivot.sort_order)
                          .map((pkg) => (
                            <li key={pkg.id} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              {pkg.name}
                            </li>
                          ))}
                      </ul>
                    </div>
                    <Button className="mt-4 w-full" variant="outline" onClick={() => handleSelectPackage(bundle)}>
                      Pilih Paket
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Regular Packages */}
        {!loading && !error && regular.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold">Paket Reguler</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {regular.map((reg) => (
                <Card key={reg.id} className="relative overflow-hidden">
                  <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    {reg.is_active ? 'Available' : 'Inactive'}
                  </div>
                  <CardHeader>
                    <div className="flex h-1/3 w-1/3 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                      <img src={`https://picsum.photos/1024/1024?random=${reg.id}`} alt="package" className="h-full w-full object-cover" />
                    </div>
                    <CardTitle className="mt-4">{reg.package?.name}</CardTitle>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">{formatPrice(reg.price)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="mt-4 w-full" variant="outline" onClick={() => handleSelectPackage(reg)}>
                      Pilih Paket
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
