import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Material } from "@/lib/materialService";
import { useMaterialStore } from "@/stores/materialStore";
import ManageVideoParts from "./ManageVideoParts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, BookOpen, Video, Settings, Lock, Unlock } from "lucide-react";

export default function AdminMaterials() {
  const {
    materials,
    isLoadingMaterials,
    isCreatingMaterial,
    isUpdatingMaterial,
    isDeletingMaterial,
    loadMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    error,
    clearError,
  } = useMaterialStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "ebook" | "video">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPartsDialogOpen, setIsPartsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [managingPartsMaterial, setManagingPartsMaterial] = useState<Material | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "ebook" as "ebook" | "video",
    cover_url: "",
    ebook_url: "",
    is_free: true,
    is_active: true,
    duration: 0,
    pages: 0,
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    const matchesStatus = statusFilter === "all" ||
                         (statusFilter === "active" && m.is_active) ||
                         (statusFilter === "inactive" && !m.is_active);
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenDialog = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        title: material.title,
        description: material.description || "",
        type: material.type,
        cover_url: material.cover_url || "",
        ebook_url: material.ebook_url || "",
        is_free: material.is_free,
        is_active: material.is_active,
        duration: material.duration || 0,
        pages: material.pages || 0,
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        title: "",
        description: "",
        type: "ebook",
        cover_url: "",
        ebook_url: "",
        is_free: true,
        is_active: true,
        duration: 0,
        pages: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.cover_url) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === "ebook" && !formData.ebook_url) {
      toast({
        title: "Validation Error",
        description: "Ebook URL is required for ebook materials.",
        variant: "destructive",
      });
      return;
    }

    const materialData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      cover_url: formData.cover_url,
      ebook_url: formData.type === "ebook" ? formData.ebook_url : undefined,
      is_free: formData.is_free,
      is_active: formData.is_active,
      ...(formData.type === "video" ? { duration: formData.duration } : { pages: formData.pages }),
    };

    let result;
    if (editingMaterial) {
      result = await updateMaterial(editingMaterial.id.toString(), materialData);
    } else {
      result = await createMaterial(materialData);
    }

    if (result) {
      toast({ title: editingMaterial ? "Material updated successfully" : "Material created successfully" });
      setIsDialogOpen(false);
    } else {
      toast({
        title: "Error",
        description: error || "Failed to save material",
        variant: "destructive",
      });
      clearError();
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    await deleteMaterial(deletingId.toString());
    if (!error) {
      toast({ title: "Material deleted successfully" });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    } else {
      toast({
        title: "Error",
        description: error || "Failed to delete material",
        variant: "destructive",
      });
      clearError();
    }
  };

  return (
    <DashboardLayout type="admin">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Learning Materials</h1>
            <p className="text-muted-foreground">Manage ebooks and video tutorials</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Material
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={(value: "all" | "ebook" | "video") => setTypeFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ebook">Ebook</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingMaterials ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading materials...
                  </TableCell>
                </TableRow>
              ) : filteredMaterials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No materials found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          {material.type === "video" ? (
                            <Video className="h-5 w-5 text-primary" />
                          ) : (
                            <BookOpen className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{material.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {material.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={material.type === "video" ? "default" : "secondary"}>
                        {material.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={material.is_active ? "default" : "secondary"}>
                        {material.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <Badge variant={material.is_free ? "default" : "secondary"}>
                        {material.is_free ? "Free" : "Premium"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {material.type === "video"
                        ? `${material.duration || 0} min`
                        : `${material.pages || 0} pages`}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {material.type === "video" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setManagingPartsMaterial(material);
                              setIsPartsDialogOpen(true);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(material)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingId(material.id);
                            setIsDeleteDialogOpen(true);
                          }}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMaterial ? "Edit Material" : "Add New Material"}</DialogTitle>
            <DialogDescription>
              {editingMaterial ? "Update material details" : "Add a new learning material"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Material title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "ebook" | "video") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ebook">Ebook</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cover_url">Cover URL *</Label>
                <Input
                  id="cover_url"
                  value={formData.cover_url}
                  onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
            </div>

            {formData.type === "ebook" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ebook_url">Ebook URL *</Label>
                  <Input
                    id="ebook_url"
                    value={formData.ebook_url}
                    onChange={(e) => setFormData({ ...formData, ebook_url: e.target.value })}
                    placeholder="https://example.com/book.pdf"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pages">Pages</Label>
                  <Input
                    id="pages"
                    type="number"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="is_free"
                checked={formData.is_free}
                onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
              />
              <Label htmlFor="is_free">Free Access</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active (Published)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isCreatingMaterial || isUpdatingMaterial}>
              {isCreatingMaterial || isUpdatingMaterial ? "Saving..." : (editingMaterial ? "Save Changes" : "Create Material")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Material</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this material? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeletingMaterial}>
              {isDeletingMaterial ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Video Parts Dialog */}
      {managingPartsMaterial && (
        <ManageVideoParts
          materialId={managingPartsMaterial.id}
          materialTitle={managingPartsMaterial.title}
          isOpen={isPartsDialogOpen}
          onClose={() => {
            setIsPartsDialogOpen(false);
            setManagingPartsMaterial(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}
