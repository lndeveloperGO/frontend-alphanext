import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { tryouts as initialTryouts, Tryout, questions } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Users } from "lucide-react";

export default function AdminTryouts() {
  const [tryouts, setTryouts] = useState<Tryout[]>(initialTryouts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTryout, setEditingTryout] = useState<Tryout | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 60,
    type: "regular" as "regular" | "mass",
    startTime: "",
    endTime: "",
    maxParticipants: 0,
    isActive: true,
    questionIds: [] as string[],
  });

  const filteredTryouts = tryouts.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (tryout?: Tryout) => {
    if (tryout) {
      setEditingTryout(tryout);
      setFormData({
        name: tryout.name,
        description: tryout.description,
        duration: tryout.duration,
        type: tryout.type,
        startTime: tryout.startTime || "",
        endTime: tryout.endTime || "",
        maxParticipants: tryout.maxParticipants || 0,
        isActive: tryout.isActive,
        questionIds: tryout.questionIds,
      });
    } else {
      setEditingTryout(null);
      setFormData({
        name: "",
        description: "",
        duration: 60,
        type: "regular",
        startTime: "",
        endTime: "",
        maxParticipants: 0,
        isActive: true,
        questionIds: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const tryoutData = {
      name: formData.name,
      description: formData.description,
      duration: formData.duration,
      type: formData.type,
      isActive: formData.isActive,
      questionIds: formData.questionIds.length ? formData.questionIds : questions.slice(0, 5).map(q => q.id),
      ...(formData.type === "mass" && {
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxParticipants: formData.maxParticipants,
      }),
    };

    if (editingTryout) {
      setTryouts(tryouts.map((t) =>
        t.id === editingTryout.id
          ? { ...t, ...tryoutData }
          : t
      ));
      toast({ title: "Tryout updated successfully" });
    } else {
      const newTryout: Tryout = {
        id: String(tryouts.length + 1),
        ...tryoutData,
        currentParticipants: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setTryouts([...tryouts, newTryout]);
      toast({ title: "Tryout created successfully" });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      setTryouts(tryouts.filter((t) => t.id !== deletingId));
      toast({ title: "Tryout deleted successfully" });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout type="admin">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tryout Management</h1>
            <p className="text-muted-foreground">Manage tryouts and mass tryout events</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tryout
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tryouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tryout</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTryouts.map((tryout) => (
                <TableRow key={tryout.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{tryout.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {tryout.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tryout.type === "mass" ? "default" : "outline"}>
                      {tryout.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{tryout.duration} min</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {tryout.currentParticipants}
                        {tryout.maxParticipants && ` / ${tryout.maxParticipants}`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tryout.isActive ? "default" : "secondary"}>
                      {tryout.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(tryout)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingId(tryout.id);
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
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTryout ? "Edit Tryout" : "Add New Tryout"}</DialogTitle>
            <DialogDescription>
              {editingTryout ? "Update tryout details" : "Create a new tryout or mass tryout event"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tryout Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter tryout name"
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
                  onValueChange={(value: "regular" | "mass") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="mass">Mass Tryout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            {formData.type === "mass" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingTryout ? "Save Changes" : "Create Tryout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tryout</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tryout? This action cannot be undone.
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
