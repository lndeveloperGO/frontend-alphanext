import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, CheckCircle2, Clock, XCircle, ArrowLeft, Package, DollarSign, AlertCircle } from "lucide-react";
import { orderService, Order, OrderStatus } from "@/lib/orderService";
import { useSnap } from "@/hooks/useSnap";

export default function UserOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();
  const { snapPay } = useSnap();

  // Show success message if coming from checkout
  useEffect(() => {
    if (location.state?.successMessage) {
      toast({
        title: "Success",
        description: location.state.successMessage,
      });
    }
  }, [location.state, toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // Fetch user orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getUserOrders();
      setOrders(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePay = async (order: Order) => {
    try {
      let token = order.midtrans_token;

      // If no token, check payment_url
      if (!token && order.payment_url) {
        const urlParts = order.payment_url.split("/");
        token = urlParts[urlParts.length - 1];
      }

      // If still no token, try to get a new one
      if (!token) {
        toast({
          title: "Memproses Pembayaran",
          description: "Sedang mengambil data pembayaran terbaru...",
        });

        const payResponse = await orderService.payOrder(order.id);
        if (payResponse.success && payResponse.data.payment_url) {
          const urlParts = payResponse.data.payment_url.split("/");
          token = urlParts[urlParts.length - 1];
        }
      }

      if (token) {
        snapPay(token, {
          onSuccess: (result: any) => {
            console.log("Payment success", result);
            toast({
              title: "Pembayaran Berhasil",
              description: "Status pesanan akan segera diperbarui",
            });
            fetchOrders(); // Refresh status
          },
          onPending: (result: any) => {
            console.log("Payment pending", result);
            toast({
              title: "Menunggu Pembayaran",
              description: "Silakan selesaikan pembayaran Anda",
            });
          },
          onError: (result: any) => {
            console.error("Payment error", result);
            toast({
              title: "Gagal",
              description: "Pembayaran gagal",
              variant: "destructive",
            });
          },
          onClose: () => {
            console.log("Snap closed");
          }
        });
      } else {
        toast({
          title: "Error",
          description: "Tidak dapat memuat data pembayaran",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Pay error", err);
      toast({
        title: "Error",
        description: "Gagal memproses pembayaran",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "expired":
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "paid":
        return <Badge variant="default">Terbayar</Badge>;
      case "pending":
        return <Badge variant="secondary">Menunggu Bayar</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      case "expired":
        return <Badge variant="outline" className="text-muted-foreground">Kadaluarsa</Badge>;
    }
  };

  const getStatusMessage = (status: OrderStatus) => {
    switch (status) {
      case "paid":
        return "Paket Anda sudah aktif dan siap digunakan!";
      case "pending":
        return "Order ini masih menunggu pembayaran dari admin. Hubungi admin untuk mengonfirmasi pembayaran.";
      case "cancelled":
        return "Order ini telah dibatalkan.";
      case "expired":
        return "Waktu pembayaran untuk order ini telah habis. Silakan buat pesanan baru.";
    }
  };

  return (
    <DashboardLayout type="user">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Pesanan Saya</h1>
            <p className="text-muted-foreground">Lihat dan kelola semua pesanan Anda</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-700">
                <Clock className="h-4 w-4" />
                Menunggu Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {orders.filter((o) => o.status === "pending").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                Aktif / Terbayar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {orders.filter((o) => o.status === "paid").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Memuat pesanan...</div>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold">Tidak ada pesanan</h3>
                <p className="text-muted-foreground mt-2">Anda belum membuat pesanan apapun</p>
                <Button
                  className="mt-4"
                  onClick={() => navigate("/dashboard/packages")}
                >
                  Mulai Berbelanja
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Total / Diskon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Promo</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          <div className="font-semibold">{formatPrice(order.amount)}</div>
                          {order.discount > 0 && (
                            <div className="text-sm text-green-600">Diskon: {formatPrice(order.discount)}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            {getStatusBadge(order.status)}
                          </div>
                        </TableCell>
                        <TableCell>{order.promo_code || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailDialogOpen(true);
                              }}
                            >
                              Detail
                            </Button>
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handlePay(order)}
                                className="bg-primary hover:bg-primary/90"
                              >
                                Bayar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pesanan #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Lihat detail lengkap pesanan Anda
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status with Message */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Status Pesanan
                </h3>
                <div className="bg-muted p-3 rounded-lg flex items-center gap-2 mb-3">
                  {getStatusIcon(selectedOrder.status)}
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {getStatusMessage(selectedOrder.status)}
                  </AlertDescription>
                </Alert>
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Detail Pembayaran
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Harga Dasar</div>
                    <div className="text-lg font-semibold">
                      {formatPrice(selectedOrder.amount + (selectedOrder.discount || 0))}
                    </div>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div>
                      <div className="text-sm text-muted-foreground">Diskon</div>
                      <div className="text-lg font-semibold text-green-600">
                        -{formatPrice(selectedOrder.discount)}
                      </div>
                    </div>
                  )}
                  <div className="col-span-2 border-t pt-3">
                    <div className="text-sm text-muted-foreground">Total Akhir</div>
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(selectedOrder.amount)}
                    </div>
                  </div>
                </div>

                {selectedOrder.promo_code && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-700">
                      Kode Promo: <span className="font-semibold">{selectedOrder.promo_code}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Payment Info */}
              <div className="space-y-3">
                <h3 className="font-semibold">Informasi Pembayaran</h3>
                <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Merchant Order ID:</span>
                    <span className="font-mono text-xs break-all">{selectedOrder.merchant_order_id}</span>
                  </div>
                  {selectedOrder.payment_method && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Metode Pembayaran:</span>
                      <span>{selectedOrder.payment_method}</span>
                    </div>
                  )}
                  {selectedOrder.paid_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dibayar Pada:</span>
                      <span>{formatDate(selectedOrder.paid_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-sm text-muted-foreground space-y-1 border-t pt-4">
                <div>Dibuat: {formatDate(selectedOrder.created_at)}</div>
                {selectedOrder.updated_at && <div>Diperbarui: {formatDate(selectedOrder.updated_at)}</div>}
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Tutup
            </Button>
            {selectedOrder?.status === 'pending' && (
              <Button onClick={() => selectedOrder && handlePay(selectedOrder)}>
                Bayar Sekarang
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
