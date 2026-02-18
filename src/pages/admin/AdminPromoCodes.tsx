import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { promoService, PromoCode, CreatePromoCodeInput, UpdatePromoCodeInput, PromoCodeAssignmentProduct, PromoCodeAssignmentPackage } from "@/lib/promoService";
import { productService, Product } from "@/lib/productService";
import { packageService, Package } from "@/lib/packageService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Copy, Loader2, Package as PackageIcon, ShoppingCart, X, Check } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function AdminPromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [assigningPromoCode, setAssigningPromoCode] = useState<PromoCode | null>(null);
  const [saving, setSaving] = useState(false);
  const [assigningProducts, setAssigningProducts] = useState(false);
  const [assigningPackages, setAssigningPackages] = useState(false);
  const [unassigningProductId, setUnassigningProductId] = useState<number | null>(null);
  const [unassigningPackageId, setUnassigningPackageId] = useState<number | null>(null);
  const { toast } = useToast();

  // Products and packages for assignment dialog
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([]);

  // Assigned products and packages from API (for display in the modal)
  const [assignedProducts, setAssignedProducts] = useState<PromoCodeAssignmentProduct[]>([]);
  const [assignedPackages, setAssignedPackages] = useState<PromoCodeAssignmentPackage[]>([]);

  const [formData, setFormData] = useState<CreatePromoCodeInput>({
    code: "",
    type: "percent",
    value: 0,
    min_purchase: 0,
    max_uses: 0,
    starts_at: "",
    ends_at: "",
    is_active: true,
  });

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (isActiveFilter !== null) params.is_active = isActiveFilter;

      const response = await promoService.getPromoCodes(params);
      setPromoCodes(response.data.data);
    } catch (error) {
      toast({
        title: "Kesalahan",
        description: "Gagal mengambil kode promo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, [searchQuery, isActiveFilter]);

  // Fetch products and packages for assignment dialog
  const fetchProductsAndPackages = async () => {
    try {
      const [productsRes, packagesRes] = await Promise.all([
        productService.getProducts(),
        packageService.getPackages(),
      ]);
      setProducts(productsRes);
      setPackages(packagesRes);
    } catch (error) {
      console.error("Failed to fetch products/packages:", error);
    }
  };

  // Helper function to convert ISO datetime to datetime-local format
  const formatDateTimeLocal = (isoString: string): string => {
    if (!isoString) return "";
    // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleOpenDialog = (promoCode?: PromoCode) => {
    if (promoCode) {
      setEditingPromoCode(promoCode);
      setFormData({
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
        min_purchase: promoCode.min_purchase || 0,
        max_uses: promoCode.max_uses,
        starts_at: formatDateTimeLocal(promoCode.starts_at),
        ends_at: formatDateTimeLocal(promoCode.ends_at),
        is_active: promoCode.is_active,
      });
    } else {
      setEditingPromoCode(null);
      setFormData({
        code: "",
        type: "percent",
        value: 0,
        min_purchase: 0,
        max_uses: 0,
        starts_at: "",
        ends_at: "",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleOpenAssignmentDialog = async (promoCode: PromoCode) => {
    setAssigningPromoCode(promoCode);

    // Fetch assigned products and packages using the new endpoint
    try {
      const assignmentsResponse = await promoService.getPromoCodeAssignments(promoCode.id);
      const assignments = assignmentsResponse.data;

      // Store assigned products and packages for display
      setAssignedProducts(assignments.products);
      setAssignedPackages(assignments.packages);

      // Get assigned product IDs and package IDs for selection state
      setSelectedProductIds(assignments.products.map(p => p.id));
      setSelectedPackageIds(assignments.packages.map(p => p.id));
      setSelectedProductIds((assignments.products || []).map(p => p.id));
      setSelectedPackageIds((assignments.packages || []).map(p => p.id));
    } catch (error) {
      toast({
        title: "Kesalahan",
        description: "Gagal mengambil penugasan kode promo",
        variant: "destructive",
      });
    }

    // Also fetch all products and packages for the selection list
    await fetchProductsAndPackages();
  };

  const handleSave = async () => {
    if (!formData.code || !formData.value || !formData.starts_at || !formData.ends_at) {
      toast({
        title: "Kesalahan Validasi",
        description: "Silakan isi semua bidang yang wajib diisi.",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === "percent" && formData.value > 100) {
      toast({
        title: "Kesalahan Validasi",
        description: "Nilai persentase tidak boleh melebihi 100.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const input = {
        ...formData,
        code: formData.code.toUpperCase(),
        min_purchase: formData.min_purchase || 0,
        max_uses: formData.max_uses || 0,
      };

      if (editingPromoCode) {
        await promoService.updatePromoCode(editingPromoCode.id, input as UpdatePromoCodeInput);
        toast({ title: "Kode promo berhasil diperbarui" });
      } else {
        await promoService.createPromoCode(input);
        toast({ title: "Kode promo berhasil dibuat" });
      }

      setIsDialogOpen(false);
      fetchPromoCodes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAssignProducts = async () => {
    if (!assigningPromoCode) return;

    try {
      setAssigningProducts(true);
      const productsToAssign = selectedProductIds.map(id => ({ product_id: id }));
      await promoService.assignProducts(assigningPromoCode.id, productsToAssign);
      toast({ title: "Produk berhasil ditugaskan" });

      // Refresh assignments after saving
      const assignmentsResponse = await promoService.getPromoCodeAssignments(assigningPromoCode.id);
      const assignments = assignmentsResponse.data;
      setAssignedProducts(assignments.products || []);
      setSelectedProductIds((assignments.products || []).map(p => p.id));

      // Refresh main promo codes list to update the counters in the table
      fetchPromoCodes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAssigningProducts(false);
    }
  };

  const handleAssignPackages = async () => {
    if (!assigningPromoCode) return;

    try {
      setAssigningPackages(true);
      const packagesToAssign = selectedPackageIds.map(id => ({ package_id: id }));
      await promoService.assignPackages(assigningPromoCode.id, packagesToAssign);
      toast({ title: "Paket berhasil ditugaskan" });

      // Refresh assignments after saving
      const assignmentsResponse = await promoService.getPromoCodeAssignments(assigningPromoCode.id);
      const assignments = assignmentsResponse.data;
      setAssignedPackages(assignments.packages || []);
      setSelectedPackageIds((assignments.packages || []).map(p => p.id));

      // Refresh main promo codes list to update the counters in the table
      fetchPromoCodes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAssigningPackages(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await promoService.deletePromoCode(deletingId);
      toast({ title: "Kode promo berhasil dihapus" });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      fetchPromoCodes();
    } catch (error: any) {
      toast({
        title: "Kesalahan",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Kode berhasil disalin ke papan klip" });
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const togglePackageSelection = (packageId: number) => {
    setSelectedPackageIds((prev) =>
      prev.includes(packageId)
        ? prev.filter((id) => id !== packageId)
        : [...prev, packageId]
    );
  };

  // Handle unassign/remove a product from the assigned list
  const handleUnassignProduct = async (productId: number) => {
    if (!assigningPromoCode) return;

    try {
      setUnassigningProductId(productId);
      await promoService.unassignProduct(assigningPromoCode.id, productId);

      toast({
        title: "Produk berhasil dilepas",
        description: "Produk telah dihapus dari kode promo ini."
      });

      // Refresh assignments from API
      const assignmentsResponse = await promoService.getPromoCodeAssignments(assigningPromoCode.id);
      const assignments = assignmentsResponse.data;
      setAssignedProducts(assignments.products || []);
      setSelectedProductIds((assignments.products || []).map(p => p.id));

      // Refresh main promo codes list
      fetchPromoCodes();
    } catch (error: any) {
      toast({
        title: "Kesalahan",
        description: error.message || "Gagal melepas produk",
        variant: "destructive",
      });
    } finally {
      setUnassigningProductId(null);
    }
  };

  // Handle unassign/remove a package from the assigned list
  const handleUnassignPackage = async (packageId: number) => {
    if (!assigningPromoCode) return;

    try {
      setUnassigningPackageId(packageId);
      await promoService.unassignPackage(assigningPromoCode.id, packageId);

      toast({
        title: "Paket berhasil dilepas",
        description: "Paket telah dihapus dari kode promo ini."
      });

      // Refresh assignments from API
      const assignmentsResponse = await promoService.getPromoCodeAssignments(assigningPromoCode.id);
      const assignments = assignmentsResponse.data;
      setAssignedPackages(assignments.packages || []);
      setSelectedPackageIds((assignments.packages || []).map(p => p.id));

      // Refresh main promo codes list
      fetchPromoCodes();
    } catch (error: any) {
      toast({
        title: "Kesalahan",
        description: error.message || "Gagal melepas paket",
        variant: "destructive",
      });
    } finally {
      setUnassigningPackageId(null);
    }
  };

  const getStatusBadge = (promoCode: PromoCode) => {
    const status = promoCode.status as string;
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      active: "default",
      upcoming: "outline",
      expired: "destructive",
      disabled: "secondary",
      quota_exhausted: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status === "active" ? "AKTIF" :
          status === "upcoming" ? "MENDATANG" :
            status === "expired" ? "KEDALUWARSA" :
              status === "disabled" ? "NONAKTIF" :
                status === "quota_exhausted" ? "KUOTA HABIS" : (status ? status.toUpperCase() : "")}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get unassigned products (available to assign)
  const getUnassignedProducts = () => {
    return products.filter(p => !selectedProductIds.includes(p.id));
  };

  // Get unassigned packages (available to assign)
  const getUnassignedPackages = () => {
    return packages.filter(p => !selectedPackageIds.includes(p.id));
  };

  return (
    <DashboardLayout type="admin">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Kode Promo</h1>
            <p className="text-muted-foreground">Kelola kode promo diskon</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kode Promo
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari kode promo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={isActiveFilter === null ? "all" : isActiveFilter.toString()}
            onValueChange={(value) => setIsActiveFilter(value === "all" ? null : value === "true")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="true">Aktif</SelectItem>
              <SelectItem value="false">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : promoCodes.length === 0 ? (
          <EmptyState
            title="Kode promo tidak ditemukan"
            description="Mulai dengan membuat kode promo pertama Anda."
            action={{
              label: "Tambah Kode Promo",
              onClick: () => handleOpenDialog()
            }}
          />
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Nilai</TableHead>
                  <TableHead>Penggunaan</TableHead>
                  <TableHead>Penugasan</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((promoCode) => (
                  <TableRow key={promoCode.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                          {promoCode.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyCode(promoCode.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{promoCode.type === "percent" ? "Persen" : "Tetap"}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {promoCode.type === "percent" ? `${promoCode.value}%` : formatPrice(promoCode.value)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {promoCode.used_count} / {promoCode.max_uses}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {promoCode.promo_products && promoCode.promo_products.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            {promoCode.promo_products.length} produk
                          </Badge>
                        )}
                        {promoCode.promo_packages && promoCode.promo_packages.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <PackageIcon className="h-3 w-3 mr-1" />
                            {promoCode.promo_packages.length} paket
                          </Badge>
                        )}
                        {(!promoCode.promo_products || promoCode.promo_products.length === 0) &&
                          (!promoCode.promo_packages || promoCode.promo_packages.length === 0) && (
                            <span className="text-xs text-muted-foreground">Tidak ada penugasan</span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(promoCode.starts_at).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">sampai {new Date(promoCode.ends_at).toLocaleDateString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(promoCode)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenAssignmentDialog(promoCode)}
                          title="Tugaskan Produk/Paket"
                        >
                          <PackageIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(promoCode)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingId(promoCode.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPromoCode ? "Edit Kode Promo" : "Tambah Kode Promo Baru"}</DialogTitle>
            <DialogDescription>
              {editingPromoCode ? "Perbarui detail kode promo" : "Buat kode promo diskon baru"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kode Promo</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="misal: HEMAT20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipe</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "percent" | "fixed") => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Persen</SelectItem>
                    <SelectItem value="fixed">Tetap (IDR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Nilai</Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  max={formData.type === "percent" ? 100 : undefined}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minPurchase">Pembelian Minimal (IDR)</Label>
              <Input
                id="minPurchase"
                type="number"
                min="0"
                value={formData.min_purchase}
                onChange={(e) => setFormData({ ...formData, min_purchase: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUses">Maks Penggunaan</Label>
              <Input
                id="maxUses"
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="starts_at">Mulai Pada</Label>
                <Input
                  id="starts_at"
                  type="datetime-local"
                  value={formData.starts_at}
                  onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ends_at">Berakhir Pada</Label>
                <Input
                  id="ends_at"
                  type="datetime-local"
                  value={formData.ends_at}
                  onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Aktif</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingPromoCode ? "Simpan Perubahan" : "Buat Kode Promo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog with improved UX */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Tugaskan Produk/Paket</DialogTitle>
            <DialogDescription>
              Tugaskan produk atau paket ke kode promo: <span className="font-mono font-semibold">{assigningPromoCode?.code}</span>
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="products" className="w-full flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Produk ({selectedProductIds.length} dipilih)
              </TabsTrigger>
              <TabsTrigger value="packages" className="flex items-center gap-2">
                <PackageIcon className="h-4 w-4" />
                Paket ({selectedPackageIds.length} dipilih)
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products" className="mt-4 flex-1 flex flex-col overflow-hidden min-h-0">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                  {/* Selected Products Table (Both Assigned and New Selections) */}
                  {selectedProductIds.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                        Produk Terpilih ({selectedProductIds.length})
                      </h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedProductIds.map((productId) => {
                            const product = products.find(p => p.id === productId);
                            const isAlreadyAssigned = assignedProducts.some(ap => ap.id === productId);

                            if (!product) return null;

                            return (
                              <TableRow key={productId} className={isAlreadyAssigned ? "bg-green-50/50" : "bg-yellow-50/50"}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>
                                  {isAlreadyAssigned ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                      Assigned
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                                      Pending Save
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isAlreadyAssigned ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => handleUnassignProduct(productId)}
                                      disabled={unassigningProductId === productId}
                                      title="Hapus penugasan (Akan segera disimpan)"
                                    >
                                      {unassigningProductId === productId ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                      onClick={() => toggleProductSelection(productId)}
                                      title="Hapus pilihan"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Available Products Selection */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">
                      Tambah Produk
                      {getUnassignedProducts().length > 0 && ` (${getUnassignedProducts().length} tersedia)`}
                    </h4>
                    {getUnassignedProducts().length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                        {products.length === 0 ? "Produk tidak ditemukan" : "Semua produk yang tersedia telah dipilih"}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[250px] overflow-y-auto border rounded-lg p-2">
                        {getUnassignedProducts().map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleProductSelection(product.id)}
                          >
                            <Checkbox
                              checked={false} // Always false in this list because selected ones move up
                              onCheckedChange={() => toggleProductSelection(product.id)}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {product.type === "bundle" ? "Bundle" : "Single"} - {formatPrice(product.price)}
                              </div>
                            </div>
                            <Badge variant="outline">{product.type}</Badge>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 ml-auto">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
              <div className="pt-4 border-t mt-4 flex justify-end gap-2">
                {/* Only show save button if there are pending changes */}
                <Button
                  onClick={handleAssignProducts}
                  disabled={assigningProducts || selectedProductIds.filter(id => !assignedProducts.some(ap => ap.id === id)).length === 0}
                  className="w-full sm:w-auto"
                >
                  {assigningProducts && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes ({selectedProductIds.filter(id => !assignedProducts.some(ap => ap.id === id)).length} pending)
                </Button>
              </div>
            </TabsContent>

            {/* Packages Tab */}
            <TabsContent value="packages" className="mt-4 flex-1 flex flex-col overflow-hidden min-h-0">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                  {/* Selected Packages Table (Both Assigned and New Selections) */}
                  {selectedPackageIds.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <PackageIcon className="h-4 w-4 text-primary" />
                        Selected Packages ({selectedPackageIds.length})
                      </h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedPackageIds.map((packageId) => {
                            const pkg = packages.find(p => p.id === packageId);
                            const isAlreadyAssigned = assignedPackages.some(ap => ap.id === packageId);

                            if (!pkg) return null;

                            return (
                              <TableRow key={packageId} className={isAlreadyAssigned ? "bg-green-50/50" : "bg-yellow-50/50"}>
                                <TableCell className="font-medium">{pkg.name}</TableCell>
                                <TableCell>
                                  {isAlreadyAssigned ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                      Assigned
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                                      Pending Save
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isAlreadyAssigned ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => handleUnassignPackage(packageId)}
                                      disabled={unassigningPackageId === packageId}
                                      title="Remove assignment (Will save immediately)"
                                    >
                                      {unassigningPackageId === packageId ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                      onClick={() => togglePackageSelection(packageId)}
                                      title="Remove selection"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Available Packages Selection */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">
                      Add Packages
                      {getUnassignedPackages().length > 0 && ` (${getUnassignedPackages().length} available)`}
                    </h4>
                    {getUnassignedPackages().length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                        {packages.length === 0 ? "No packages found" : "All available packages selected"}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[250px] overflow-y-auto border rounded-lg p-2">
                        {getUnassignedPackages().map((pkg) => (
                          <div
                            key={pkg.id}
                            className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => togglePackageSelection(pkg.id)}
                          >
                            <Checkbox
                              checked={false} // Always false in this list because selected ones move up
                              onCheckedChange={() => togglePackageSelection(pkg.id)}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{pkg.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {pkg.type} - {pkg.questions_count} questions
                              </div>
                            </div>
                            <Badge variant="outline">{pkg.type}</Badge>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 ml-auto">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
              <div className="pt-4 border-t mt-4 flex justify-end gap-2">
                {/* Only show save button if there are pending changes */}
                <Button
                  onClick={handleAssignPackages}
                  disabled={assigningPackages || selectedPackageIds.filter(id => !assignedPackages.some(ap => ap.id === id)).length === 0}
                  className="w-full sm:w-auto"
                >
                  {assigningPackages && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes ({selectedPackageIds.filter(id => !assignedPackages.some(ap => ap.id === id)).length} pending)
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promo Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this promo code? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
