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
import { Plus, Pencil, Trash2, Settings, Loader2 } from "lucide-react";
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
    duration_seconds: number;
    is_active: boolean;
  }>({
    name: "",
    type: "latihan",
    category_id: 0,
    duration_seconds: 0,
    is_active: true,
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
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load data",
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
        duration_seconds: 0,
        is_active: true,
      });
    } else if (mode === "edit" && pkg) {
      setSelectedPackage(pkg);
      setFormData({
        name: pkg.name,
        type: pkg.type,
        category_id: pkg.category_id,
        duration_seconds: pkg.duration_seconds,
        is_active: pkg.is_active,
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
      duration_seconds: 0,
      is_active: true,
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Package name is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.category_id === 0) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (formData.duration_seconds === 0) {
      toast({
        title: "Error",
        description: "Duration must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      if (dialogMode === "create") {
        await packageService.createPackage(formData as CreatePackageInput);
        toast({
          title: "Success",
          description: "Package created successfully",
        });
      } else if (dialogMode === "edit" && selectedPackage) {
        await packageService.updatePackage(
          selectedPackage.id,
          formData as UpdatePackageInput
        );
        toast({
          title: "Success",
          description: "Package updated successfully",
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
        title: "Success",
        description: "Package deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedPackage(null);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete package",
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
            <h1 className="text-2xl font-bold">Packages</h1>
            <p className="text-muted-foreground">Manage practice packages</p>
          </div>
          <Button onClick={() => handleOpenDialog("create")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Package
          </Button>
        </div>

        {/* Packages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Package List</CardTitle>
            <CardDescription>
              Total packages: {packages.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : packages.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No packages found. Create one to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-32 text-right">Actions</TableHead>
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
                        <TableCell>{getCategoryName(pkg.category_id)}</TableCell>
                        <TableCell>{formatDuration(pkg.duration_seconds)}</TableCell>
                        <TableCell>
                          <Badge variant={pkg.is_active ? "default" : "secondary"}>
                            {pkg.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/admin/packages/${pkg.id}/questions`
                                )
                              }
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
              {dialogMode === "create" ? "Create Package" : "Edit Package"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Add a new package"
                : "Update package information"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                placeholder="e.g., Mathematics Practice Set"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Package Type</Label>
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
              <Label htmlFor="category_id">Category</Label>
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
              <Label htmlFor="duration_seconds">Duration (seconds)</Label>
              <Input
                id="duration_seconds"
                type="number"
                placeholder="e.g., 3600 (1 hour)"
                value={formData.duration_seconds}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_seconds: parseInt(e.target.value) || 0,
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
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Package</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this package? This action cannot
            be undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
