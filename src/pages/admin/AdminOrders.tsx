import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, CheckCircle2, Clock, XCircle, Search, DollarSign, Package, AlertCircle } from "lucide-react";
import { orderService, Order, OrderStatus } from "@/lib/orderService";
import { userService, User } from "@/lib/userService";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Summary stats
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    cancelled: 0,
  });

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const { toast } = useToast();

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

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        status: statusFilter !== "all" ? (statusFilter as OrderStatus) : undefined,
        search: searchQuery || undefined,
        page: currentPage,
      };

      const response = await orderService.getAdminOrders(params);
      setOrders(response.data.data);
      setTotalOrders(response.data.total);
      setTotalPages(response.data.last_page);

      // Calculate summary
      const stats = {
        total: response.data.total,
        pending: response.data.data.filter((o) => o.status === "pending").length,
        paid: response.data.data.filter((o) => o.status === "paid").length,
        cancelled: response.data.data.filter((o) => o.status === "cancelled").length,
      };
      setSummary(stats);
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

  // Fetch user details when dialog opens
  const fetchUserDetail = async (userId: number) => {
    setIsLoadingUser(true);
    try {
      const response = await userService.getUserDetail(userId);
      setSelectedUser(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch user details",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, searchQuery]);

  const handleMarkAsPaid = async () => {
    if (!selectedOrder) return;

    setIsMarkingPaid(true);
    try {
      const response = await orderService.markOrderAsPaid(selectedOrder.id);

      if (response.success) {
        toast({
          title: "Success",
          description: "Order marked as paid and user packages have been granted",
        });

        // Update the order in the list
        setOrders(orders.map((o) => (o.id === selectedOrder.id ? response.data : o)));
        setSelectedOrder(response.data);
        setIsDetailDialogOpen(false);
        fetchOrders(); // Refresh to update counts
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mark order as paid",
        variant: "destructive",
      });
    } finally {
      setIsMarkingPaid(false);
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
    }
  };

  return (
    <DashboardLayout type="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Manajemen Order</h1>
            <p className="text-muted-foreground">Kelola semua order dan pembayaran pengguna</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">Semua order</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-700">
                <Clock className="h-4 w-4" />
                Menunggu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Belum terbayar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                Dibayar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.paid}</div>
              <p className="text-xs text-muted-foreground mt-1">Sudah terbayar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700">
                <XCircle className="h-4 w-4" />
                Dibatalkan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.cancelled}</div>
              <p className="text-xs text-muted-foreground mt-1">Dibatalkan</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Cari Order</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Cari berdasarkan order ID atau user..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={(value: any) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Menunggu Bayar</SelectItem>
                    <SelectItem value="paid">Terbayar</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Order</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Memuat order...</div>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Tidak ada order</div>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Email Pembeli</TableHead>
                      <TableHead>Total / Diskon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Promo</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          <div className="font-medium text-primary cursor-pointer hover:underline" onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailDialogOpen(true);
                            fetchUserDetail(order.user_id);
                          }}>
                            {order.user?.email || `User #${order.user_id}`}
                          </div>
                          {order.user?.name && (
                            <div className="text-sm text-muted-foreground">{order.user.name}</div>
                          )}
                        </TableCell>
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
                        <TableCell>{order.items?.length || 0} item(s)</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailDialogOpen(true);
                              fetchUserDetail(order.user_id);
                            }}
                          >
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} />
                      </PaginationItem>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                      .map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={(open) => {
        setIsDetailDialogOpen(open);
        if (!open) {
          setSelectedUser(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Lihat detail order dan kelola pembayaran
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Informasi Pembeli
                </h3>
                {isLoadingUser ? (
                  <div className="bg-muted p-4 rounded-lg text-muted-foreground">Memuat data pembeli...</div>
                ) : selectedUser ? (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Nama</div>
                      <div className="font-medium">{selectedUser.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium text-primary">{selectedUser.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Role</div>
                      <div className="font-medium capitalize">{selectedUser.role}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="font-medium">
                        {selectedUser.is_active ? (
                          <span className="text-green-600">Aktif</span>
                        ) : (
                          <span className="text-red-600">Tidak Aktif</span>
                        )}
                      </div>
                    </div>
                    {selectedUser.avatar && (
                      <div>
                        <div className="text-sm text-muted-foreground">Avatar</div>
                        <img src={selectedUser.avatar} alt="User Avatar" className="h-10 w-10 rounded-full" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded-lg text-muted-foreground">Data pembeli tidak ditemukan</div>
                )}
              </div>

              {/* Order Status */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Status Order
                </h3>
                <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                  {getStatusIcon(selectedOrder.status)}
                  {getStatusBadge(selectedOrder.status)}
                </div>
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

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Paket dalam Order ({selectedOrder.items.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedOrder.items.map((item, index) => (
                      <div key={item.id} className="bg-muted p-3 rounded-lg">
                        <div className="font-medium">Paket ID: {item.package_id}</div>
                        <div className="text-sm text-muted-foreground">Qty: {item.qty}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Info */}
              {selectedOrder.product && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Produk
                  </h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Nama</div>
                        <div className="font-medium">{selectedOrder.product.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Tipe</div>
                        <div className="font-medium capitalize">{selectedOrder.product.type}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Harga Dasar</div>
                        <div className="font-medium">{formatPrice(selectedOrder.product.price)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">ID Produk</div>
                        <div className="font-medium">#{selectedOrder.product.id}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Payment Info */}
              <div className="space-y-3">
                <h3 className="font-semibold">Informasi Pembayaran</h3>
                <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Merchant Order ID:</span>
                    <span className="font-mono">{selectedOrder.merchant_order_id}</span>
                  </div>
                  {selectedOrder.duitku_reference && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">DuitKu Reference:</span>
                      <span className="font-mono">{selectedOrder.duitku_reference}</span>
                    </div>
                  )}
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

              {/* Mark as Paid Alert */}
              {selectedOrder.status === "pending" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Order masih menunggu pembayaran. Klik "Tandai Terbayar" untuk mengaktifkan paket pengguna.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Tutup
            </Button>
            {selectedOrder?.status === "pending" && (
              <Button
                onClick={handleMarkAsPaid}
                disabled={isMarkingPaid}
                className="bg-green-600 hover:bg-green-700"
              >
                {isMarkingPaid ? "Memproses..." : "Tandai Terbayar & Beri Akses"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
