import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { promoService, PromoCode, CreatePromoCodeInput, UpdatePromoCodeInput } from "@/lib/promoService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Copy, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function AdminPromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreatePromoCodeInput>({
    code: "",
    type: "percent",
    value: 0,
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

  const handleOpenDialog = (promoCode?: PromoCode) => {
    if (promoCode) {
      setEditingPromoCode(promoCode);
      setFormData({
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
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
        max_uses: 0,
        starts_at: "",
        ends_at: "",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
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
            action={
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Promo Code
              </Button>
            }
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
                        {promoCode.type === "percent" ? `${promoCode.value}%` : `Rp ${promoCode.value.toLocaleString()}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      {promoCode.used_count} / {promoCode.max_uses}
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
              <Label htmlFor="maxUses">Max Uses</Label>
              <Input
                id="maxUses"
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 ">
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
