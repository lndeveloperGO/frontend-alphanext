import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Package, ArrowLeft, CreditCard, Tag, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { promoService } from "@/lib/promoService";
import { orderService } from "@/lib/orderService";
import { useAuthStore } from "@/stores/authStore";

export default function UserCheckout() {
  const navigate = useNavigate();
  const { selectedPackage, clearSelection } = useCheckoutStore();

  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [finalAmount, setFinalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    if (!selectedPackage) {
      navigate("/dashboard/packages");
      return;
    }

    const basePrice = selectedPackage.price;
    const discount = promoDiscount;
    setFinalAmount(Math.max(0, basePrice - discount));
  }, [selectedPackage, promoDiscount, navigate]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Masukkan kode promo");
      return;
    }

    setLoading(true);
    setPromoError("");

    try {
      const response = await promoService.validatePromoCode({
        promo_code: promoCode,
        product_id: selectedPackage ? parseInt(selectedPackage.id, 10) : 0,
      });

      if (response.success) {
        setPromoDiscount(response.data.discount);
        setPromoError("");
      }
    } catch (error) {
      setPromoError(error instanceof Error ? error.message : "Kode promo tidak valid");
      setPromoDiscount(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      setOrderError("Paket tidak ditemukan");
      return;
    }

    setIsCreatingOrder(true);
    setOrderError("");

    try {
      const orderInput = {
        product_id: parseInt(selectedPackage.id, 10),
        ...(promoCode.trim() && { promo_code: promoCode }),
      };

      const response = await orderService.createOrder(orderInput);

      if (response.success && response.data) {
        setOrderSuccess(true);
        // Clear cart and wait a moment before navigating
        clearSelection();
        setTimeout(() => {
          navigate("/dashboard/user/orders", {
            state: { orderId: response.data.id, successMessage: "Order berhasil dibuat. Status: Menunggu pembayaran" },
          });
        }, 1000);
      } else {
        setOrderError("Gagal membuat order. Silakan coba lagi.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan saat membuat order";
      setOrderError(message);
      console.error("Order creation error:", error);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (!selectedPackage) {
    return null;
  }

  return (
    <DashboardLayout type="user">
      <div className=" space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/packages")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">Selesaikan pembelian paket Anda</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Package Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Detail Paket</CardTitle>
                    <CardDescription>Paket yang dipilih untuk dibeli</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Nama Paket</span>
                  <span>{selectedPackage.name}</span>
                </div>

                {selectedPackage.type === 'bundle' && selectedPackage.packages && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Isi Paket ({selectedPackage.packages.length} item):
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto bg-muted/30 rounded-md p-3">
                      {selectedPackage.packages
                        .sort((a, b) => a.pivot.sort_order - b.pivot.sort_order)
                        .map((pkg, index) => (
                          <div key={pkg.id} className="flex items-start gap-3 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary mt-0.5">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{pkg.name}</div>
                              {pkg.description && (
                                <div className="text-xs text-muted-foreground mt-0.5">{pkg.description}</div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {selectedPackage.type === 'single' && selectedPackage.package && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="font-medium">{selectedPackage.package.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">{selectedPackage.package.description}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Ringkasan Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Promo Code Section */}
                <div className="space-y-3">
                  <Label htmlFor="promo" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Kode Promo (Opsional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="promo"
                      placeholder="Masukkan kode promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleApplyPromo}
                      disabled={loading}
                      variant="outline"
                    >
                      {loading ? "Memeriksa..." : "Terapkan"}
                    </Button>
                  </div>
                  {promoError && (
                    <Alert variant="destructive">
                      <AlertDescription className="text-sm">{promoError}</AlertDescription>
                    </Alert>
                  )}
                  {promoDiscount > 0 && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Kode promo berhasil diterapkan! Diskon: {formatPrice(promoDiscount)}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Harga Paket</span>
                    <span>{formatPrice(selectedPackage.price)}</span>
                  </div>

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon Promo</span>
                      <span>-{formatPrice(promoDiscount)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Pembayaran</span>
                    <span className="text-primary">{formatPrice(finalAmount)}</span>
                  </div>
                </div>

                {orderError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{orderError}</AlertDescription>
                  </Alert>
                )}

                {orderSuccess && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Order berhasil dibuat! Mengalihkan ke daftar order...
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  className="w-full h-12 text-base font-semibold"
                  onClick={handlePurchase}
                  disabled={finalAmount === 0 || isCreatingOrder || orderSuccess}
                >
                  {isCreatingOrder ? "Memproses..." : <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Bayar Sekarang
                  </>}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
