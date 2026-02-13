import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { materialService, Material, MaterialPart } from "@/lib/materialService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  BookOpen,
  Video,
  Play,
  Lock,
  Loader2,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isYouTube, isMP4, getYouTubeVideoId } from "@/lib/utils";

export default function MaterialDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadMaterial(id);
    }
  }, [id]);

  const loadMaterial = async (materialId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await materialService.getMaterial(materialId);
      setMaterial(data);
    } catch (error: any) {
      if (error.message?.includes("Access denied")) {
        setError("This material requires a premium subscription. Please upgrade your plan to access it.");
      } else {
        setError("Failed to load material");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePartSelect = (index: number) => {
    setCurrentPartIndex(index);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <DashboardLayout type="user">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading material...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !material) {
    return (
      <DashboardLayout type="user">
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/materials")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Materials
          </Button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Material not found"}</AlertDescription>
          </Alert>

          {error?.includes("premium") && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Premium Content</h3>
                  <p className="text-muted-foreground mb-4">
                    This material is available with a premium subscription.
                  </p>
                  <Button onClick={() => navigate("/dashboard/packages")}>
                    View Packages
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    );
  }

  const currentPart = material.parts?.[currentPartIndex];

  return (
    <DashboardLayout type="user">
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/materials")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Materials
        </Button>

        {/* Material Header */}
        <div className="space-y-4">
          <div className="flex items-start gap-6">
            <img
              src={material.cover_url}
              alt={material.title}
              className="h-32 w-24 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={material.type === "video" ? "default" : "secondary"}>
                  {material.type === "video" ? (
                    <Video className="mr-1 h-3 w-3" />
                  ) : (
                    <BookOpen className="mr-1 h-3 w-3" />
                  )}
                  {material.type}
                </Badge>
                <Badge variant="outline">{material.category}</Badge>
                {!material.is_free && (
                  <Badge variant="outline" className="text-amber-600">
                    <Lock className="mr-1 h-3 w-3" />
                    Premium
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{material.title}</h1>
              <p className="text-muted-foreground text-lg">{material.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                {material.type === "video" ? (
                  <span>{material.duration} minutes total</span>
                ) : (
                  <span>{material.pages} pages</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Content */}
        {material.type === "video" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{currentPart?.title || "Video Player"}</CardTitle>
                    {currentPart && (
                      <Badge variant="outline" className="text-xs">
                        {isYouTube(currentPart.video_url) ? "YouTube" : isMP4(currentPart.video_url) ? "MP4" : "Unsupported"}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {currentPart ? (
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      {isYouTube(currentPart.video_url) ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${getYouTubeVideoId(currentPart.video_url)}?modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
                          title={currentPart.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : isMP4(currentPart.video_url) ? (
                        <video
                          src={currentPart.video_url}
                          controls
                          className="w-full h-full"
                          poster={material.cover_url}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700">
                          <div className="text-center text-white">
                            <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">{currentPart.title}</p>
                            <p className="text-sm opacity-75 mb-4">
                              Unsupported video format
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">No video parts available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Playlist */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Video Parts</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {material.parts?.map((part, index) => (
                  <Card
                    key={part.id}
                    className={`cursor-pointer transition-colors ${
                      index === currentPartIndex
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => handlePartSelect(index)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {index === currentPartIndex ? (
                            <Play className="h-4 w-4 text-primary" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1 text-sm">
                            {part.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(part.duration_seconds)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {material.parts && material.parts.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Total duration: {formatDuration(
                    material.parts.reduce((total, part) => total + part.duration_seconds, 0)
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Ebook Viewer */
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Read Ebook</h3>
                <p className="text-muted-foreground mb-6">
                  Click the button below to open the ebook in a new tab
                </p>
                <Button
                  size="lg"
                  onClick={() => window.open(material.ebook_url, '_blank')}
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Read Ebook
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  {material.pages} pages • PDF format
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
