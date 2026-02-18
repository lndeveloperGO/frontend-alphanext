import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Pencil, Plus, Trash, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productService, Product, ProductType, ProductPackage, CreateProductInput } from "@/lib/productService";
import { packageService, Package } from "@/lib/packageService";
import { materialService, Material } from "@/lib/materialService";

type DialogMode = "create" | "edit" | null;

interface FormData {
  type: ProductType;
  name: string;
  price: number;
  access_days: number | ""; // Hari, default 30 jika dikosongkan
  is_active: boolean;
  package_id?: number; // For single
  packages?: ProductPackage[]; // For bundle
  selectedMaterialIds: string[]; // Attached materials
}

const emptyFormData: FormData = {
  type: "single",
  name: "",
  price: 0,
  access_days: "",
  is_active: true,
  package_id: undefined,
  packages: [],
  selectedMaterialIds: [],
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [newPackageForBundle, setNewPackageForBundle] = useState<ProductPackage>({
    package_id: 0,
    qty: 1,
    sort_order: 1,
  });
  const { toast } = useToast();

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, packagesData, materialsData] = await Promise.all([
        productService.getProducts(),
        packageService.getPackages(),
        materialService.getAdminMaterials(),
      ]);
      setProducts(productsData);
      setPackages(packagesData);
      setMaterials(materialsData.data || []);
    } catch (error) {
      toast({
        title: "Kesalahan",
        description:
          error instanceof Error ? error.message : "Gagal memuat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode: DialogMode, product?: Product) => {
    setDialogMode(mode);
    if (mode === "create") {
      setFormData(emptyFormData);
    } else if (mode === "edit" && product) {
      setSelectedProduct(product);
      setFormData({
        type: product.type,
        name: product.name,
        price: product.price,
        access_days: product.access_days ?? "",
        is_active: product.is_active,
        package_id: product.package_id,
        packages: product.type === "bundle"
          ? product.packages?.map(pkg => ({
            package_id: pkg.pivot.package_id,
            qty: pkg.pivot.qty,
            sort_order: pkg.pivot.sort_order,
          })) || []
          : [],
        selectedMaterialIds: [], // TODO: Load from product if available
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogMode(null);
    setSelectedProduct(null);
    setFormData(emptyFormData);
    setNewPackageForBundle({
      package_id: 0,
      qty: 1,
      sort_order: 1,
    });
  };

  const handleAddPackageToBundle = () => {
    if (newPackageForBundle.package_id === 0) {
      toast({
        title: "Kesalahan",
        description: "Silakan pilih paket",
        variant: "destructive",
      });
      return;
    }

    const updatedPackages = [...(formData.packages || [])];
    const maxSortOrder = updatedPackages.length > 0
      ? Math.max(...updatedPackages.map(p => p.sort_order))
      : 0;

    updatedPackages.push({
      ...newPackageForBundle,
      sort_order: maxSortOrder + 1,
    });

    setFormData({ ...formData, packages: updatedPackages });
    setNewPackageForBundle({
      package_id: 0,
      qty: 1,
      sort_order: 1,
    });
  };

  const handleRemovePackageFromBundle = (index: number) => {
    const updatedPackages = (formData.packages || []).filter((_, i) => i !== index);
    setFormData({ ...formData, packages: updatedPackages });
  };

  const handleValidateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: "Kesalahan",
        description: "Nama produk wajib diisi",
        variant: "destructive",
      });
      return false;
    }

    if (formData.price <= 0) {
      toast({
        title: "Kesalahan",
        description: "Harga harus lebih besar dari 0",
        variant: "destructive",
      });
      return false;
    }

    if (formData.type === "single") {
      if (!formData.package_id || formData.package_id === 0) {
        toast({
          title: "Kesalahan",
          description: "Silakan pilih paket untuk produk satuan",
          variant: "destructive",
        });
        return false;
      }
    } else {
      if (!formData.packages || formData.packages.length === 0) {
        toast({
          title: "Kesalahan",
          description: "Silakan tambah minimal satu paket ke bundel",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!handleValidateForm()) return;

    try {
      setSubmitting(true);

      const accessDaysValue = formData.access_days === "" ? undefined : Number(formData.access_days);
      const payload: CreateProductInput =
        formData.type === "single"
          ? {
            type: "single",
            name: formData.name,
            package_id: formData.package_id!,
            price: formData.price,
            access_days: accessDaysValue,
            is_active: formData.is_active,
            material_ids: formData.selectedMaterialIds.length > 0 ? formData.selectedMaterialIds : undefined,
          }
          : {
            type: "bundle",
            name: formData.name,
            price: formData.price,
            access_days: accessDaysValue,
            is_active: formData.is_active,
            packages: formData.packages!,
            material_ids: formData.selectedMaterialIds.length > 0 ? formData.selectedMaterialIds : undefined,
          };

      if (dialogMode === "create") {
        await productService.createProduct(payload);
        toast({
          title: "Berhasil",
          description: "Produk berhasil dibuat",
        });
      } else if (dialogMode === "edit" && selectedProduct) {
        await productService.updateProduct(selectedProduct.id, payload);
        toast({
          title: "Berhasil",
          description: "Produk berhasil diperbarui",
        });
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Operation failed",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      setSubmitting(true);
      await productService.deleteProduct(selectedProduct.id);
      toast({
        title: "Berhasil",
        description: "Produk berhasil dihapus",
      });
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      loadData();
    } catch (error) {
      toast({
        title: "Kesalahan",
        description:
          error instanceof Error ? error.message : "Gagal menghapus produk",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getPackageName = (packageId: number) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg ? pkg.name : `Package #${packageId}`;
  };

  return (
    <DashboardLayout type="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Produk & Harga</h1>
            <p className="text-muted-foreground">Kelola harga produk (satuan atau bundel)</p>
          </div>
          <Button onClick={() => handleOpenDialog("create")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Produk</CardTitle>
            <CardDescription>
              Total produk: {products.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Produk tidak ditemukan. Buat satu untuk memulai.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                      <TableHead className="text-center">Masa Aktif</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Detail</TableHead>
                      <TableHead className="w-24 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.id}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          <Badge variant={product.type === "single" ? "default" : "secondary"}>
                            {product.type === "single" ? "Satuan" : "Bundel"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          Rp {product.price.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {product.access_days != null ? `${product.access_days} hari` : "30 hari"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.is_active ? "outline" : "destructive"}>
                            {product.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {product.type === "single" ? (
                            <span>{getPackageName(product.package_id!)}</span>
                          ) : (
                            <span>{product.packages?.length || 0} paket</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog("edit", product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(product)}
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
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Buat Produk" : "Edit Produk"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Tambah produk baru (satuan atau bundel)"
                : "Perbarui informasi produk"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Product Type Selector */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipe Produk</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    type: value as ProductType,
                    package_id: value === "single" ? formData.package_id : undefined,
                    packages: value === "bundle" ? formData.packages : [],
                  })
                }
                disabled={submitting || dialogMode === "edit"}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Produk Satuan</SelectItem>
                  <SelectItem value="bundle">Produk Bundel</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.type === "single"
                  ? "Produk satuan berisi satu paket"
                  : "Produk bundel berisi beberapa paket"}
              </p>
            </div>

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk</Label>
              <Input
                id="name"
                placeholder="misal: Tryout UTBK #1 atau Paket Hemat UTBK"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={submitting}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input
                id="price"
                type="number"
                placeholder="misal: 49000"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
                }
                disabled={submitting}
                min="1"
              />
            </div>

            {/* Access Days */}
            <div className="space-y-2">
              <Label htmlFor="access_days">Masa Aktif (Hari)</Label>
              <Input
                id="access_days"
                type="number"
                placeholder="30"
                value={formData.access_days === "" ? "" : formData.access_days}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormData({
                    ...formData,
                    access_days: v === "" ? "" : Math.max(1, parseInt(v, 10) || 1),
                  });
                }}
                disabled={submitting}
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Default 30 hari jika dikosongkan. Masa akses user setelah order dibayar.
              </p>
            </div>

            {/* Single Product Package Selection */}
            {formData.type === "single" && (
              <div className="space-y-2">
                <Label htmlFor="package">Paket</Label>
                <Select
                  value={formData.package_id?.toString() || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, package_id: parseInt(value) })
                  }
                  disabled={submitting}
                >
                  <SelectTrigger id="package">
                    <SelectValue placeholder="Pilih paket" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id.toString()}>
                        {pkg.name} ({pkg.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Bundle Product Package Management */}
            {formData.type === "bundle" && (
              <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                <div className="space-y-3">
                  <Label>Paket dalam Bundel</Label>

                  {/* Add Package Section */}
                  <div className="space-y-2 p-3 bg-background rounded border">
                    <Label htmlFor="bundle-package" className="text-sm">
                      Tambah Paket
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={newPackageForBundle.package_id?.toString() || ""}
                        onValueChange={(value) =>
                          setNewPackageForBundle({
                            ...newPackageForBundle,
                            package_id: parseInt(value),
                          })
                        }
                        disabled={submitting}
                      >
                        <SelectTrigger id="bundle-package" className="flex-1">
                          <SelectValue placeholder="Pilih paket" />
                        </SelectTrigger>
                        <SelectContent>
                          {packages.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id.toString()}>
                              {pkg.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={newPackageForBundle.qty}
                        onChange={(e) =>
                          setNewPackageForBundle({
                            ...newPackageForBundle,
                            qty: parseInt(e.target.value) || 1,
                          })
                        }
                        disabled={submitting}
                        min="1"
                        className="w-20"
                      />
                      <Button
                        type="button"
                        onClick={handleAddPackageToBundle}
                        disabled={submitting}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Bundle Packages List */}
                  <div className="space-y-2">
                    {formData.packages && formData.packages.length > 0 ? (
                      <div className="space-y-2">
                        {formData.packages.map((pkg, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-background rounded border"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {getPackageName(pkg.package_id)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {pkg.qty} | Order: {pkg.sort_order}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePackageFromBundle(index)}
                              disabled={submitting}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Belum ada paket yang ditambahkan
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Material Selection */}
            {/* <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
              <div className="space-y-3">
                <Label>Attached Materials (Premium Access)</Label>
                <p className="text-xs text-muted-foreground">
                  Select materials that users will get access to when they purchase this product.
                  Materials will automatically be set as premium (is_free=false).
                </p>

               
                <div className="space-y-2 p-3 bg-background rounded border">
                  <Label htmlFor="product-material" className="text-sm">
                    Add Material
                  </Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (!formData.selectedMaterialIds.includes(value)) {
                        setFormData({
                          ...formData,
                          selectedMaterialIds: [...formData.selectedMaterialIds, value],
                        });
                      }
                    }}
                    disabled={submitting}
                  >
                    <SelectTrigger id="product-material">
                      <SelectValue placeholder="Select material to attach..." />
                    </SelectTrigger>
                    <SelectContent>
                      {materials
                        .filter(material => !formData.selectedMaterialIds.includes(material.id.toString()))
                        .map((material) => (
                          <SelectItem key={material.id} value={material.id.toString()}>
                            {material.title} ({material.type})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                
                <div className="space-y-2">
                  {formData.selectedMaterialIds.length > 0 ? (
                    <div className="space-y-2">
                      {formData.selectedMaterialIds.map((materialId) => {
                        const material = materials.find(m => m.id.toString() === materialId);
                        return (
                          <div
                            key={materialId}
                            className="flex items-center justify-between p-2 bg-background rounded border"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {material ? material.title : `Material #${materialId}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {material?.type} • {material?.is_free === 1 ? 'Free' : 'Premium'}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  selectedMaterialIds: formData.selectedMaterialIds.filter(id => id !== materialId),
                                });
                              }}
                              disabled={submitting}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No materials attached yet
                    </p>
                  )}
                </div>
              </div>
            </div> */}

            {/* Is Active Switch */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor="is_active" className="cursor-pointer">
                Aktif
              </Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
                disabled={submitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus "{selectedProduct?.name}"? Tindakan ini tidak dapat
            dibatalkan.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
