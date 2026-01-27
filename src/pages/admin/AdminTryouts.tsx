import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tryout, questions } from "@/data/mockData";
import { getApiBaseUrl } from "@/lib/env";
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

// API Response Interface
interface ApiTryout {
  id: number;
  name: string;
  type: string;
  category_id: number;
  duration_seconds: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export default function AdminTryouts() {
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    type: "",
    isActive: true,
    questionIds: [] as string[],
  });

  // Fetch tryouts from API
  useEffect(() => {
    const fetchTryouts = async () => {
      try {
        setIsLoading(true);
        const baseUrl = getApiBaseUrl();
        const response = await fetch(`${baseUrl}/packages`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tryouts: ${response.statusText}`);
        }
        
        const apiData: ApiTryout[] = await response.json();
        
        // Transform API data to Tryout format
        const transformedTryouts: Tryout[] = apiData.map((item) => ({
          id: String(item.id),
          name: item.name,
          description: `${item.type} package`,
          questionIds: questions.slice(0, 5).map(q => q.id), // Default to first 5 questions
          duration: Math.round(item.duration_seconds / 60), // Convert seconds to minutes
          type: item.type,
          currentParticipants: 0,
          isActive: item.is_active === 1,
          createdAt: new Date(item.created_at).toISOString().split("T")[0],
        }));
        
        setTryouts(transformedTryouts);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching tryouts:", errorMessage);
        // Fallback to empty array on error
        setTryouts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTryouts();
  }, []);

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
        isActive: tryout.isActive,
        questionIds: tryout.questionIds,
      });
    } else {
      setEditingTryout(null);
      setFormData({
        name: "",
        description: "",
        duration: 60,
        type: "",
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

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              Error loading tryouts: {error}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">Loading tryouts...</p>
          </div>
        ) : filteredTryouts.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">No tryouts found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tryout</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                {/* <TableHead>Participants</TableHead> */}
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
                      {/* <p className="text-sm text-muted-foreground line-clamp-1">
                        {tryout.description}
                      </p> */}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {tryout.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{tryout.duration} min</TableCell>
                  {/* <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {tryout.currentParticipants}
                      </span>
                    </div>
                  </TableCell> */}
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
        )}
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
                <Input
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g., tryout, practice, bundle"
                  disabled={editingTryout ? true : false}
                />
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
