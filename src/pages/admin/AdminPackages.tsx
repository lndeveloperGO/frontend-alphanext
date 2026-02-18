import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Settings, Loader2, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  packageService,
  Package,
  CreatePackageInput,
  UpdatePackageInput,
  PackageType,
} from "@/lib/packageService";
import { categoryService, Category } from "@/lib/categoryService";

type DialogMode = "create" | "edit" | null;

export default function AdminPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    type: PackageType;
    category_id: number;
    duration_minutes: number;
    is_active: boolean;
    is_free: boolean;
  }>({
    name: "",
    type: "latihan",
    category_id: 0,
    duration_minutes: 0,
    is_active: true,
    is_free: false,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load packages and categories
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [packagesData, categoriesData] = await Promise.all([
        packageService.getPackages(),
        categoryService.getCategories(),
      ]);
      setPackages(packagesData);
      setCategories(categoriesData);
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

  const handleOpenDialog = (mode: DialogMode, pkg?: Package) => {
    setDialogMode(mode);
    if (mode === "create") {
      setFormData({
        name: "",
        type: "latihan",
        category_id: categories.length > 0 ? categories[0].id : 0,
        duration_minutes: 0,
        is_active: true,
        is_free: false,
      });
    } else if (mode === "edit" && pkg) {
      setSelectedPackage(pkg);
      setFormData({
        name: pkg.name,
        type: pkg.type,
        category_id: pkg.category_id,
        duration_minutes: Math.floor(pkg.duration_seconds / 60),
        is_active: pkg.is_active,
        is_free: pkg.is_free,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogMode(null);
    setSelectedPackage(null);
    setFormData({
      name: "",
      type: "latihan",
      category_id: categories.length > 0 ? categories[0].id : 0,
      duration_minutes: 0,
      is_active: true,
      is_free: false,
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Kesalahan",
        description: "Nama paket wajib diisi",
        variant: "destructive",
      });
      return;
    }

    if (formData.category_id === 0) {
      toast({
        title: "Kesalahan",
        description: "Silakan pilih kategori",
        variant: "destructive",
      });
      return;
    }

    if (formData.duration_minutes === 0) {
      toast({
        title: "Kesalahan",
        description: "Durasi harus lebih besar dari 0",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Convert minutes to seconds for API
      const packageData = {
        ...formData,
        duration_seconds: formData.duration_minutes * 60,
      };

      if (dialogMode === "create") {
        await packageService.createPackage(packageData as CreatePackageInput);
        toast({
          title: "Berhasil",
          description: "Paket berhasil dibuat",
        });
      } else if (dialogMode === "edit" && selectedPackage) {
        await packageService.updatePackage(
          selectedPackage.id,
          packageData as UpdatePackageInput
        );
        toast({
          title: "Berhasil",
          description: "Paket berhasil diperbarui",
        });
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      toast({
        title: "Kesalahan",
        description:
          error instanceof Error ? error.message : "Operasi gagal",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (pkg: Package) => {
    setSelectedPackage(pkg);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPackage) return;

    try {
      setSubmitting(true);
      await packageService.deletePackage(selectedPackage.id);
      toast({
        title: "Berhasil",
        description: "Paket berhasil dihapus",
      });
      setDeleteDialogOpen(false);
      setSelectedPackage(null);
      loadData();
    } catch (error) {
      toast({
        title: "Kesalahan",
        description:
          error instanceof Error ? error.message : "Gagal menghapus paket",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTypeColor = (type: PackageType) => {
    const colors: Record<PackageType, string> = {
      latihan: "bg-blue-100 text-blue-800",
      tryout: "bg-purple-100 text-purple-800",
      akbar: "bg-red-100 text-red-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || "-";
  };

  return (
    <DashboardLayout type="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Paket</h1>
            <p className="text-muted-foreground">Kelola paket latihan</p>
          </div>
          <Button onClick={() => handleOpenDialog("create")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Paket
          </Button>
        </div>

        {/* Packages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Paket</CardTitle>
            <CardDescription>
              Total paket: {packages.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : packages.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Paket tidak ditemukan. Buat satu untuk memulai.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Durasi</TableHead>
                      <TableHead>Pertanyaan</TableHead>
                      <TableHead>Materi</TableHead>
                      <TableHead>Akses</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-32 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-medium">{pkg.id}</TableCell>
                        <TableCell>{pkg.name}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(pkg.type)}>
                            {pkg.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{pkg.category?.name || getCategoryName(pkg.category_id)}</TableCell>
                        <TableCell>{formatDuration(pkg.duration_seconds)}</TableCell>
                        <TableCell className="text-center">{pkg.questions_count}</TableCell>
                        <TableCell className="text-center">{pkg.material_count || 0}</TableCell>
                        <TableCell>
                          <Badge variant={pkg.is_free ? "secondary" : "outline"}>
                            {pkg.is_free ? "Gratis" : "Berbayar"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={pkg.is_active ? "default" : "secondary"}>
                            {pkg.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/admin/packages/${pkg.id}/materials`
                                )
                              }
                              title="Kelola Materi"
                            >
                              <BookOpen className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/admin/packages/${pkg.id}/questions`
                                )
                              }
                              title="Kelola Pertanyaan"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog("edit", pkg)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(pkg)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Buat Paket" : "Edit Paket"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Tambah paket baru"
                : "Perbarui informasi paket"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Paket</Label>
              <Input
                id="name"
                placeholder="misal: Set Latihan Matematika"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipe Paket</Label>
              <Select
                value={formData.type}
                onValueChange={(value: PackageType) =>
                  setFormData({ ...formData, type: value })
                }
                disabled={submitting}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latihan">Latihan</SelectItem>
                  <SelectItem value="tryout">Tryout</SelectItem>
                  <SelectItem value="akbar">Tryout Akbar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Kategori</Label>
              <Select
                value={formData.category_id.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: parseInt(value) })
                }
                disabled={submitting}
              >
                <SelectTrigger id="category_id">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Durasi (menit)</Label>
              <Input
                id="duration_minutes"
                type="number"
                placeholder="misal: 60 (1 jam)"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_minutes: parseInt(e.target.value) || 0,
                  })
                }
                disabled={submitting}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
                disabled={submitting}
              />
              <Label htmlFor="is_active">Aktif</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_free"
                checked={formData.is_free}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_free: checked })
                }
                disabled={submitting}
              />
              <Label htmlFor="is_free">Paket Gratis</Label>
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
          <AlertDialogTitle>Hapus Paket</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus paket ini? Tindakan ini tidak dapat
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
