import { useState, useEffect } from "react";
import { MaterialPart, CreateMaterialPartInput, UpdateMaterialPartInput } from "@/lib/materialService";
import { useMaterialStore } from "@/stores/materialStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, GripVertical, Play } from "lucide-react";

interface ManageVideoPartsProps {
  materialId: number;
  materialTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageVideoParts({ materialId, materialTitle, isOpen, onClose }: ManageVideoPartsProps) {
  const {
    parts,
    isLoadingParts,
    isCreatingPart,
    isUpdatingPart,
    isDeletingPart,
    loadParts,
    createPart,
    updatePart,
    deletePart,
    error,
    clearError,
  } = useMaterialStore();

  const [isPartDialogOpen, setIsPartDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<MaterialPart | null>(null);
  const [deletingPartId, setDeletingPartId] = useState<number | null>(null);
  const { toast } = useToast();

  const [partFormData, setPartFormData] = useState({
    title: "",
    video_url: "",
    duration_seconds: 0,
    sort_order: 1,
    is_active: true,
  });

  useEffect(() => {
    if (isOpen && materialId) {
      loadParts(materialId.toString());
    }
  }, [isOpen, materialId, loadParts]);

  const handleOpenPartDialog = (part?: MaterialPart) => {
    if (part) {
      setEditingPart(part);
      setPartFormData({
        title: part.title,
        video_url: part.video_url,
        duration_seconds: part.duration_seconds,
        sort_order: part.sort_order,
        is_active: part.is_active,
      });
    } else {
      setEditingPart(null);
      const nextSortOrder = parts.length > 0 ? Math.max(...parts.map(p => p.sort_order)) + 1 : 1;
      setPartFormData({
        title: "",
        video_url: "",
        duration_seconds: 0,
        sort_order: nextSortOrder,
        is_active: true,
      });
    }
    setIsPartDialogOpen(true);
  };

  const handleSavePart = async () => {
    if (!partFormData.title || !partFormData.video_url) {
      toast({
        title: "Kesalahan Validasi",
        description: "Silakan isi semua bidang yang wajib diisi.",
        variant: "destructive",
      });
      return;
    }

    let result;
    if (editingPart) {
      result = await updatePart(materialId.toString(), editingPart.id.toString(), partFormData);
    } else {
      result = await createPart(materialId.toString(), partFormData);
    }

    if (result) {
      toast({ title: editingPart ? "Bagian berhasil diperbarui" : "Bagian berhasil dibuat" });
      setIsPartDialogOpen(false);
    } else {
      toast({
        title: "Kesalahan",
        description: error || "Gagal menyimpan bagian",
        variant: "destructive",
      });
      clearError();
    }
  };

  const handleDeletePart = async () => {
    if (!deletingPartId) return;

    await deletePart(materialId.toString(), deletingPartId.toString());
    if (!error) {
      toast({ title: "Bagian berhasil dihapus" });
      setDeletingPartId(null);
    } else {
      toast({
        title: "Kesalahan",
        description: error || "Gagal menghapus bagian",
        variant: "destructive",
      });
      clearError();
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Kelola Bagian Video - {materialTitle}</DialogTitle>
            <DialogDescription>
              Tambah, edit, dan urutkan ulang bagian video untuk materi ini
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              Total bagian: {parts.length} | Total durasi: {formatDuration(parts.reduce((sum, part) => sum + part.duration_seconds, 0))}
            </div>
            <Button onClick={() => handleOpenPartDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Bagian
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Durasi</TableHead>
                    <TableHead>Urutan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingParts ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Memuat bagian...
                      </TableCell>
                    </TableRow>
                  ) : parts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Bagian video tidak ditemukan. Tambahkan bagian pertama Anda untuk memulai.
                      </TableCell>
                    </TableRow>
                  ) : (
                    parts
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((part) => (
                        <TableRow key={part.id}>
                          <TableCell>
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Play className="h-4 w-4 text-primary" />
                              <div>
                                <p className="font-medium">{part.title}</p>
                                <p className="text-sm text-muted-foreground truncate max-w-xs">
                                  {part.video_url}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {formatDuration(part.duration_seconds)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              #{part.sort_order}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={part.is_active ? "default" : "secondary"}>
                              {part.is_active ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenPartDialog(part)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingPartId(part.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Part Create/Edit Dialog */}
      <Dialog open={isPartDialogOpen} onOpenChange={setIsPartDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPart ? "Edit Bagian Video" : "Tambah Bagian Video"}</DialogTitle>
            <DialogDescription>
              {editingPart ? "Perbarui detail bagian" : "Tambah bagian video baru"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="part_title">Judul *</Label>
              <Input
                id="part_title"
                value={partFormData.title}
                onChange={(e) => setPartFormData({ ...partFormData, title: e.target.value })}
                placeholder="Judul bagian"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">Video URL *</Label>
              <Input
                id="video_url"
                value={partFormData.video_url}
                onChange={(e) => setPartFormData({ ...partFormData, video_url: e.target.value })}
                placeholder="https://example.com/video.mp4"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration_seconds">Durasi (detik) *</Label>
                <Input
                  id="duration_seconds"
                  type="number"
                  value={partFormData.duration_seconds}
                  onChange={(e) => setPartFormData({ ...partFormData, duration_seconds: parseInt(e.target.value) || 0 })}
                  placeholder="180"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">Urutan</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={partFormData.sort_order}
                  onChange={(e) => setPartFormData({ ...partFormData, sort_order: parseInt(e.target.value) || 1 })}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="part_is_active"
                checked={partFormData.is_active}
                onCheckedChange={(checked) => setPartFormData({ ...partFormData, is_active: checked })}
              />
              <Label htmlFor="part_is_active">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPartDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSavePart} disabled={isCreatingPart || isUpdatingPart}>
              {isCreatingPart || isUpdatingPart ? "Menyimpan..." : (editingPart ? "Simpan Perubahan" : "Buat Bagian")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingPartId} onOpenChange={() => setDeletingPartId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Bagian Video</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus bagian video ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPartId(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeletePart} disabled={isDeletingPart}>
              {isDeletingPart ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
