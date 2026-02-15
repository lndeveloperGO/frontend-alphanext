import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { promoService, PromoCode, CreatePromoCodeInput, UpdatePromoCodeInput, PromoProduct, PromoPackage } from "@/lib/promoService";
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
import { Plus, Pencil, Trash2, Search, Copy, Loader2, Package as PackageIcon, ShoppingCart, X } from "lucide-react";
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
  const { toast } = useToast();

  // Products and packages for assignment dialog
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([]);

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
        title: "Error",
        description: "Failed to fetch promo codes",
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

  const handleOpenDialog = (promoCode?: PromoCode) => {
    if (promoCode) {
      setEditingPromoCode(promoCode);
      setFormData({
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
        min_purchase: promoCode.min_purchase || 0,
        max_uses: promoCode.max_uses,
        starts_at: promoCode.starts_at,
        ends_at: promoCode.ends_at,
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
    setSelectedProductIds(promoCode.promo_products?.map(p => p.product_id) || []);
    setSelectedPackageIds(promoCode.promo_packages?.map(p => p.package_id) || []);
    await fetchProductsAndPackages();
    setIsAssignmentDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.value || !formData.starts_at || !formData.ends_at) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === "percent" && formData.value > 100) {
      toast({
        title: "Validation Error",
        description: "Percentage value cannot exceed 100.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const input = { ...formData, code: formData.code.toUpperCase() };

      if (editingPromoCode) {
        await promoService.updatePromoCode(editingPromoCode.id, input as UpdatePromoCodeInput);
        toast({ title: "Promo code updated successfully" });
      } else {
        await promoService.createPromoCode(input);
        toast({ title: "Promo code created successfully" });
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
      const products = selectedProductIds.map(id => ({ product_id: id }));
      await promoService.assignProducts(assigningPromoCode.id, products);
      toast({ title: "Products assigned successfully" });
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
      const packages = selectedPackageIds.map(id => ({ package_id: id }));
      await promoService.assignPackages(assigningPromoCode.id, packages);
      toast({ title: "Packages assigned successfully" });
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
      toast({ title: "Promo code deleted successfully" });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      fetchPromoCodes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied to clipboard" });
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const togglePackageSelection = (packageId: number) => {
    setSelectedPackageIds(prev => 
      prev.includes(packageId) 
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const getStatusBadge = (status: PromoCode["status"]) => {
    const variants = {
      active: "default",
      upcoming: "secondary",
      expired: "destructive",
      disabled: "outline",
      quota_exhausted: "destructive",
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.replace("_", " ").toUpperCase()}
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

  return (
    <DashboardLayout type="admin">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Promo Codes</h1>
            <p className="text-muted-foreground">Manage discount promo codes</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Promo Code
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search promo codes..."
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
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : promoCodes.length === 0 ? (
          <EmptyState
            title="No promo codes found"
            description="Get started by creating your first promo code."
            action={{
              label: "Add Promo Code",
              onClick: () => handleOpenDialog()
            }}
          />
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Assignments</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      <Badge variant="outline">{promoCode.type}</Badge>
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
                            {promoCode.promo_products.length} products
                          </Badge>
                        )}
                        {promoCode.promo_packages && promoCode.promo_packages.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <PackageIcon className="h-3 w-3 mr-1" />
                            {promoCode.promo_packages.length} packages
                          </Badge>
                        )}
                        {(!promoCode.promo_products || promoCode.promo_products.length === 0) && 
                         (!promoCode.promo_packages || promoCode.promo_packages.length === 0) && (
                          <span className="text-xs text-muted-foreground">No assignments</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(promoCode.starts_at).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">to {new Date(promoCode.ends_at).toLocaleDateString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(promoCode.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenAssignmentDialog(promoCode)}
                          title="Assign Products/Packages"
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
            <DialogTitle>{editingPromoCode ? "Edit Promo Code" : "Add New Promo Code"}</DialogTitle>
            <DialogDescription>
              {editingPromoCode ? "Update promo code details" : "Create a new discount promo code"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Promo Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SAVE20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "percent" | "fixed") => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
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
              <Label htmlFor="minPurchase">Minimum Purchase (IDR)</Label>
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
              <Label htmlFor="maxUses">Max Uses</Label>
              <Input
                id="maxUses"
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="starts_at">Starts At</Label>
                <Input
                  id="starts_at"
                  type="datetime-local"
                  value={formData.starts_at}
                  onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ends_at">Ends At</Label>
                <Input
                  id="ends_at"
                  type="datetime-local"
                  value={formData.ends_at}
                  onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingPromoCode ? "Save Changes" : "Create Promo Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Assign Products/Packages</DialogTitle>
            <DialogDescription>
              Assign products or packages to promo code: <span className="font-mono font-semibold">{assigningPromoCode?.code}</span>
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Products ({selectedProductIds.length} selected)
              </TabsTrigger>
              <TabsTrigger value="packages" className="flex items-center gap-2">
                <PackageIcon className="h-4 w-4" />
                Packages ({selectedPackageIds.length} selected)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="mt-4">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Select products that this promo code can be applied to. If no products are selected, the promo will fall back to package assignment.
                </div>
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="space-y-2">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedProductIds.includes(product.id) ? "bg-primary/10 border-primary" : ""
                        }`}
                        onClick={() => toggleProductSelection(product.id)}
                      >
                        <Checkbox
                          checked={selectedProductIds.includes(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.type === "bundle" ? "Bundle" : "Single"} - {formatPrice(product.price)}
                          </div>
                        </div>
                        <Badge variant="outline">{product.type}</Badge>
                      </div>
                    ))}
                    {products.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No products available
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <Button 
                  onClick={handleAssignProducts} 
                  disabled={assigningProducts}
                  className="w-full"
                >
                  {assigningProducts && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Products Assignment
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="packages" className="mt-4">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Select packages that this promo code can be applied to. This is used as fallback when no product assignment exists.
                </div>
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="space-y-2">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedPackageIds.includes(pkg.id) ? "bg-primary/10 border-primary" : ""
                        }`}
                        onClick={() => togglePackageSelection(pkg.id)}
                      >
                        <Checkbox
                          checked={selectedPackageIds.includes(pkg.id)}
                          onCheckedChange={() => togglePackageSelection(pkg.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{pkg.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {pkg.type} - {pkg.questions_count} questions
                          </div>
                        </div>
                        <Badge variant="outline">{pkg.type}</Badge>
                      </div>
                    ))}
                    {packages.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No packages available
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <Button 
                  onClick={handleAssignPackages} 
                  disabled={assigningPackages}
                  className="w-full"
                >
                  {assigningPackages && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Packages Assignment
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

