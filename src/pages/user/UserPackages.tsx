import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { purchases, packages } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Package } from "lucide-react";

export default function UserPackages() {
  const userPurchases = purchases.filter(p => p.userId === "2");
  const availablePackages = packages.filter(p => p.isActive);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Package className="h-6 w-6 text-primary" />
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

        {/* Available Packages */}
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
      </div>
    </DashboardLayout>
  );
}
