import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { purchases, packages } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Package, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { userService, PackageItem, PromoItem } from "@/lib/userService";
import { useCheckoutStore } from "@/stores/checkoutStore";

export default function UserPackages() {
  const [bundles, setBundles] = useState<PackageItem[]>([]);
  const [regular, setRegular] = useState<PackageItem[]>([]);
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { setSelectedPackage } = useCheckoutStore();

  const userPurchases = purchases.filter(p => p.userId === "2");
  const availablePackages = packages.filter(p => p.isActive);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await userService.getDashboard();
        if (response.success) {
          setBundles(response.data.bundles.filter(b => b.is_active));
          setRegular(response.data.regular.filter(r => r.is_active));
          console.log(response.data.regular.filter(r => r.is_active));
          setPromos(response.data.promos.filter(p => p.status === 'active'));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
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

        {/* Purchased Packages */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Active Subscriptions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userPurchases.map((purchase) => {
              const pkg = packages.find(p => p.id === purchase.packageId);
              return (
                <Card key={purchase.id} className="relative overflow-hidden">
                  <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Active
                  </div>
                  <CardHeader>
                     <div className="flex h-1/3 w-1/3 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                      <img src={`https://picsum.photos/1024/1024?random=${purchase.id}`} alt="package" className="h-full w-full object-cover" />
                    </div>
                    <CardTitle className="mt-4">{purchase.packageName}</CardTitle>
                    <CardDescription>{pkg?.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purchase Date</span>
                        <span>{purchase.purchaseDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expiry Date</span>
                        <span>{purchase.expiryDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Questions</span>
                        <span>{pkg?.questionCount}</span>
                      </div>
                    </div>
                    <Button className="mt-4 w-full" variant="outline">
                      Start Practice
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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

        {/* Promo Codes */}
        {/* {!loading && !error && promos.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold">Kode Promo Tersedia</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {promos.map((promo) => (
                <Card key={promo.id}>
                  <CardHeader>
                    <Badge variant="secondary">Tersedia</Badge>
                    <CardTitle className="mt-2 font-mono">{promo.code}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Kode promo ini dapat digunakan saat checkout.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )} */}

        {/* Available Packages (Fallback) */}
        {!loading && !error && bundles.length === 0 && regular.length === 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold">Available Packages</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availablePackages.map((pkg) => {
                const isPurchased = userPurchases.some(p => p.packageId === pkg.id);
                return (
                  <Card key={pkg.id} className={isPurchased ? "opacity-60" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{pkg.type}</Badge>
                        {isPurchased && (
                          <Badge variant="default">Owned</Badge>
                        )}
                      </div>
                      <CardTitle className="mt-2">{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <span className="text-3xl font-bold">{formatPrice(pkg.price)}</span>
                        <span className="text-muted-foreground">/{pkg.duration} days</span>
                      </div>
                      <ul className="mb-4 space-y-2">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" disabled={isPurchased}>
                        {isPurchased ? "Already Owned" : "Purchase"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
