import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { materialService, Material } from "@/lib/materialService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, BookOpen, Video, Lock, Grid, List, Loader2, Play } from "lucide-react";

export default function UserMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "ebook" | "video">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const { toast } = useToast();

  const loadMaterials = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
        setMaterials([]);
      }

      const params = {
        search: searchQuery || undefined,
        type: typeFilter === "all" ? undefined : typeFilter,
        page: reset ? 1 : page,
        limit: 20,
      };

      const response = await materialService.getMaterials(params);
      const newMaterials = response.data || [];

      if (reset) {
        setMaterials(newMaterials);
      } else {
        setMaterials(prev => [...prev, ...newMaterials]);
      }

      setHasMore(newMaterials.length === 20);
      if (!reset) setPage(prev => prev + 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load materials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials(true);
  }, [searchQuery, typeFilter]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMaterials();
    }
  };

  const handleMaterialClick = async (material: Material) => {
    try {
      // Check access by trying to fetch the detail
      await materialService.getMaterial(material.id);
      navigate(`/dashboard/materials/${material.id}`);
    } catch (error: any) {
      if (error.message?.includes("Access denied")) {
        toast({
          title: "Access Denied",
          description: "This material requires a premium subscription",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to access material",
          variant: "destructive",
        });
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const MaterialCard = ({ material }: { material: Material }) => (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg"
      onClick={() => handleMaterialClick(material)}
    >
      <div className="relative aspect-video overflow-hidden rounded-t-lg">
        <img
          src={material.cover_url}
          alt={material.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {material.type === "video" && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 rounded-full p-3">
              <Play className="h-6 w-6 text-black" />
            </div>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant={material.type === "video" ? "default" : "secondary"}>
            {material.type === "video" ? (
              <Video className="mr-1 h-3 w-3" />
            ) : (
              <BookOpen className="mr-1 h-3 w-3" />
            )}
            {material.type}
          </Badge>
        </div>
        {!material.is_free && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-black/50 text-white border-white/20">
              <Lock className="mr-1 h-3 w-3" />
              Premium
            </Badge>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-lg">{material.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {material.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{material.category}</Badge>
          <span className="text-sm text-muted-foreground">
            {material.type === "video"
              ? `${material.duration} min`
              : `${material.pages} pages`}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  const MaterialListItem = ({ material }: { material: Material }) => (
    <Card
      className="group cursor-pointer transition-all hover:shadow-md"
      onClick={() => handleMaterialClick(material)}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg">
            <img
              src={material.cover_url}
              alt={material.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute top-1 left-1">
              <Badge variant={material.type === "video" ? "default" : "secondary"} className="text-xs">
                {material.type === "video" ? (
                  <Video className="mr-1 h-2 w-2" />
                ) : (
                  <BookOpen className="mr-1 h-2 w-2" />
                )}
                {material.type}
              </Badge>
            </div>
            {!material.is_free && (
              <div className="absolute top-1 right-1">
                <Badge variant="outline" className="bg-black/50 text-white border-white/20 text-xs">
                  <Lock className="mr-1 h-2 w-2" />
                  Premium
                </Badge>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold line-clamp-1">{material.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {material.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">{material.category}</Badge>
              <span className="text-xs text-muted-foreground">
                {material.type === "video"
                  ? `${material.duration} min`
                  : `${material.pages} pages`}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout type="user">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Learning Materials</h1>
            <p className="text-muted-foreground">Access ebooks and video tutorials</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={(value: "all" | "ebook" | "video") => setTypeFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ebook">Ebooks</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Materials Grid/List */}
        {loading && materials.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading materials...</span>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No materials found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className={
              viewMode === "grid"
                ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-4"
            }>
              {materials.map((material) =>
                viewMode === "grid" ? (
                  <MaterialCard key={material.id} material={material} />
                ) : (
                  <MaterialListItem key={material.id} material={material} />
                )
              )}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center py-6">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
