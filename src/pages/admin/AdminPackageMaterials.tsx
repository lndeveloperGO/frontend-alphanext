import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Loader2, Search, BookOpen, Video } from "lucide-react";
import {
  packageService,
  Package,
  PackageMaterial,
  PackageMaterialInput,
} from "@/lib/packageService";
import { materialService, Material } from "@/lib/materialService";

export default function AdminPackageMaterials() {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [packageMaterials, setPackageMaterials] = useState<PackageMaterial[]>([]);
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attachDialogOpen, setAttachDialogOpen] = useState(false);
  const [detachDialogOpen, setDetachDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<PackageMaterial | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<PackageMaterialInput[]>([]);
  const { toast } = useToast();

  // Load data
  useEffect(() => {
    if (packageId) {
      loadData();
    }
  }, [packageId]);

  const loadData = async () => {
    if (!packageId) return;

    try {
      setLoading(true);
      const [packageData, packageMaterialsData, allMaterialsData] = await Promise.all([
        packageService.getPackage(parseInt(packageId)),
        packageService.getPackageMaterials(parseInt(packageId)),
        materialService.getAdminMaterials(),
      ]);

      setPkg(packageData.data);
      setPackageMaterials(packageMaterialsData);
      setAllMaterials(allMaterialsData.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAttachMaterials = async () => {
    if (!packageId || selectedMaterials.length === 0) return;

    try {
      setSubmitting(true);
      await packageService.attachMaterialsToPackage(
        parseInt(packageId),
        selectedMaterials
      );

      toast({
        title: "Berhasil",
        description: "Materi berhasil dilampirkan",
      });

      setAttachDialogOpen(false);
      setSelectedMaterials([]);
      setSearchTerm("");
      loadData();
    } catch (error) {
      toast({
        title: "Kesalahan",
        description:
          error instanceof Error ? error.message : "Gagal melampirkan materi",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetachClick = (material: PackageMaterial) => {
    setSelectedMaterial(material);
    setDetachDialogOpen(true);
  };

  const handleDetachConfirm = async () => {
    if (!packageId || !selectedMaterial) return;

    console.log(selectedMaterial);

    // Ensure we have a valid material ID
    if (!selectedMaterial.material_id || selectedMaterial.material_id === null || selectedMaterial.material_id === undefined) {
      toast({
        title: "Error",
        description: "Invalid material ID",
        variant: "destructive",
      });
      return;
    }

    const materialId = typeof selectedMaterial.material_id === 'string'
      ? parseInt(selectedMaterial.material_id, 10)
      : selectedMaterial.material_id;

    if (isNaN(materialId)) {
      toast({
        title: "Error",
        description: "Invalid material ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      // Use DELETE endpoint to detach the material
      await packageService.detachMaterialFromPackage(
        parseInt(packageId),
        materialId
      );

      toast({
        title: "Berhasil",
        description: "Materi berhasil dilepas",
      });

      setDetachDialogOpen(false);
      setSelectedMaterial(null);
      loadData();
    } catch (error) {
      toast({
        title: "Kesalahan",
        description:
          error instanceof Error ? error.message : "Gagal melepas materi",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableMaterials = () => {
    // Get IDs of already attached materials (as strings for comparison)
    // Handle potential undefined/null values in packageMaterials
    const attachedIds = new Set(
      packageMaterials
        .filter(m => m && m.id !== undefined && m.id !== null)
        .map(m => String(m.id))
    );
    // Get IDs of currently selected materials in this session
    const selectedIds = new Set(
      selectedMaterials
        .filter(m => m && m.material_id !== undefined && m.material_id !== null)
        .map(m => String(m.material_id))
    );

    // Filter out materials that are already attached OR already selected in this session
    // Handle potential undefined/null values in allMaterials
    return allMaterials.filter(material => {
      if (!material || material.id === undefined || material.id === null) {
        return false;
      }
      const materialIdStr = String(material.id);
      return !attachedIds.has(materialIdStr) && !selectedIds.has(materialIdStr);
    });
  };

  const filteredAvailableMaterials = getAvailableMaterials().filter(material =>
    (material.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (material.type?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getMaterialTypeIcon = (type: string) => {
    return type === 'video' ? <Video className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />;
  };

  const getMaterialTypeColor = (type: string) => {
    return type === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <DashboardLayout type="admin">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!pkg) {
    return (
      <DashboardLayout type="admin">
        <div className="py-8 text-center text-muted-foreground">
          Paket tidak ditemukan
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout type="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/packages")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Paket
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Materi Paket</h1>
              <p className="text-muted-foreground">
                Kelola materi untuk: <strong>{pkg.name}</strong>
              </p>
            </div>
          </div>
          <Button onClick={() => setAttachDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Lampirkan Materi
          </Button>
        </div>

        {/* Package Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Paket</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium">Nama</Label>
                <p className="text-sm text-muted-foreground">{pkg.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Tipe</Label>
                <Badge className="mt-1" variant="outline">
                  {pkg.type}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Kategori</Label>
                <p className="text-sm text-muted-foreground">
                  {pkg.category?.name || '-'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Durasi</Label>
                <p className="text-sm text-muted-foreground">
                  {pkg.duration_seconds ? `${Math.floor(pkg.duration_seconds / 60)} menit` : '-'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge className="mt-1" variant={pkg.is_active ? "default" : "secondary"}>
                  {pkg.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Akses</Label>
                <Badge className="mt-1" variant={pkg.is_free ? "secondary" : "outline"}>
                  {pkg.is_free ? "Gratis" : "Premium"}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Pertanyaan</Label>
                <p className="text-sm text-muted-foreground">{pkg.questions_count}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Materi</Label>
                <p className="text-sm text-muted-foreground">{packageMaterials.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attached Materials */}
        <Card>
          <CardHeader>
            <CardTitle>Materi yang Dilampirkan</CardTitle>
            <CardDescription>
              Materi yang saat ini dilampirkan ke paket ini ({packageMaterials.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {packageMaterials.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Belum ada materi yang dilampirkan. Klik "Lampirkan Materi" untuk menambahkan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Urutan</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Gratis</TableHead>
                      <TableHead className="w-24 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packageMaterials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">
                          #{material.sort_order}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getMaterialTypeIcon(material.type)}
                            {material.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getMaterialTypeColor(material.type)}>
                            {material.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={material.is_active ? "default" : "secondary"}>
                            {material.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={material.is_free ? "secondary" : "outline"}>
                            {material.is_free ? "Gratis" : "Premium"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDetachClick(material)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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

      {/* Attach Materials Dialog */}
      <Dialog open={attachDialogOpen} onOpenChange={setAttachDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lampirkan Materi ke Paket</DialogTitle>
            <DialogDescription>
              Pilih materi untuk dilampirkan ke "{pkg.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Cari Materi</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari berdasarkan judul atau tipe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Available Materials */}
            <div className="space-y-2">
              <Label>Materi Tersedia ({filteredAvailableMaterials.length})</Label>
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {filteredAvailableMaterials.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {searchTerm ? "Tidak ada materi yang cocok dengan pencarian Anda" : "Semua materi sudah dilampirkan"}
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {filteredAvailableMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          {getMaterialTypeIcon(material.type)}
                          <div>
                            <p className="font-medium text-sm">{material.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {material.type} • {material.is_free ? 'Gratis' : 'Premium'}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const matId = typeof material.id === 'string' ? parseInt(material.id) : material.id;
                            const existingIndex = selectedMaterials.findIndex(
                              m => m.material_id === matId
                            );
                            if (existingIndex >= 0) {
                              setSelectedMaterials(
                                selectedMaterials.filter(
                                  (_, idx) => idx !== existingIndex
                                )
                              );
                            } else {
                              setSelectedMaterials([
                                ...selectedMaterials,
                                {
                                  material_id: matId,
                                  sort_order: selectedMaterials.length + 1
                                }
                              ]);
                            }
                          }}
                          disabled={submitting}
                        >
                          {selectedMaterials.some(m => m.material_id === (typeof material.id === 'string' ? parseInt(material.id) : material.id)) ? 'Dipilih' : 'Pilih'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Count */}
            {selectedMaterials.length > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  {selectedMaterials.length} materi dipilih
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAttachDialogOpen(false);
                setSelectedMaterials([]);
                setSearchTerm("");
              }}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleAttachMaterials}
              disabled={submitting || selectedMaterials.length === 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Melampirkan...
                </>
              ) : (
                `Lampirkan ${selectedMaterials.length} Materi`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detach Confirmation Dialog */}
      <AlertDialog open={detachDialogOpen} onOpenChange={setDetachDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Lepas Materi</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin melepas "{selectedMaterial?.title}" dari paket ini?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDetachConfirm}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Melepas...
                </>
              ) : (
                "Lepas"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
