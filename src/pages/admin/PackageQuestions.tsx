import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Loader2, Trash2, Save, ArrowLeft, GripVertical, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { packageService, PackageQuestionDetail, PackageQuestion } from "@/lib/packageService";
import { categoryService, Category } from "@/lib/categoryService";
import { questionService, Question } from "@/lib/questionService";

export default function PackageQuestions() {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<PackageQuestionDetail[]>([]);
  const [packageInfo, setPackageInfo] = useState<any>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categoryQuestions, setCategoryQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<number>>(new Set());

  const numericPackageId = packageId ? parseInt(packageId) : 0;

  useEffect(() => {
    loadData();
  }, [packageId]);

  const loadData = async () => {
    if (!numericPackageId) return;

    try {
      setLoading(true);
      const [pkgData, questionsData] = await Promise.all([
        packageService.getPackage(numericPackageId),
        packageService.getPackageQuestions(numericPackageId),
      ]);
      setPackageInfo(pkgData.data);
      setQuestions(questionsData);
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

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id);
        await loadCategoryQuestions(data[0].id);
      } else if (data.length > 0 && selectedCategory) {
        await loadCategoryQuestions(selectedCategory);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadCategoryQuestions = async (categoryId: number) => {
    try {
      setQuestionsLoading(true);
      const data = await questionService.getQuestionsByCategory(categoryId);
      // Filter out questions that are already in the package
      const existingQuestionIds = new Set(questions.map(q => q.question_id));
      const filteredQuestions = data.filter(q => !existingQuestionIds.has(q.id));
      setCategoryQuestions(filteredQuestions);
      setSelectedQuestionIds(new Set());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategory(categoryId);
    loadCategoryQuestions(categoryId);
  };

  const handleQuestionToggle = (questionId: number) => {
    const newSelected = new Set(selectedQuestionIds);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestionIds(newSelected);
  };

  const handleAddQuestions = () => {
    if (selectedQuestionIds.size === 0) {
      toast({
        title: "Peringatan",
        description: "Silakan pilih setidaknya satu pertanyaan",
      });
      return;
    }

    const newQuestions = categoryQuestions.filter(q => selectedQuestionIds.has(q.id));
    const newQuestionsList: PackageQuestionDetail[] = newQuestions.map(q => ({
      id: Math.random(),
      question_id: q.id,
      question: q.question,
      category_id: q.category_id,
      type: q.type,
      difficulty: q.difficulty,
    }));

    setQuestions([...questions, ...newQuestionsList]);
    setOpenDialog(false);
    setSelectedQuestionIds(new Set());
    toast({
      title: "Berhasil",
      description: `Berhasil menambahkan ${newQuestions.length} pertanyaan ke paket`,
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setDragImage(
      e.currentTarget as HTMLElement,
      0,
      0
    );
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverItem(index);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverItem(null);

    if (draggedItem === null || draggedItem === index) {
      setDraggedItem(null);
      return;
    }

    const newQuestions = [...questions];
    const draggedQuestion = newQuestions[draggedItem];
    newQuestions.splice(draggedItem, 1);
    newQuestions.splice(index, 0, draggedQuestion);
    setQuestions(newQuestions);
    setDraggedItem(null);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    toast({
      title: "Berhasil",
      description: "Pertanyaan dihapus dari paket",
    });
  };

  const handleSave = async () => {
    if (!numericPackageId) return;

    try {
      setSaving(true);

      const items: PackageQuestion[] = questions.map((q, index) => ({
        question_id: q.question_id,
        order_no: index + 1,
      }));

      await packageService.syncPackageQuestions(numericPackageId, items);
      toast({
        title: "Berhasil",
        description: "Pertanyaan paket berhasil diperbarui",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} mnt`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}j ${mins}m`;
  };

  const truncateText = (text: string | undefined, maxLength: number = 80) => {
    if (!text) return "No question text";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <DashboardLayout type="admin">
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/packages")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Paket
          </Button>
        </div>

        {/* Package Info */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : packageInfo ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{packageInfo.name}</CardTitle>
                <CardDescription>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div>
                      <span className="text-sm font-semibold">Tipe: </span>
                      <Badge className="ml-1">{packageInfo.type}</Badge>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">Durasi: </span>
                      <span className="ml-1">
                        {formatDuration(packageInfo.duration_seconds)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">Status: </span>
                      <Badge
                        className="ml-1"
                        variant={packageInfo.is_active ? "default" : "secondary"}
                      >
                        {packageInfo.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Questions List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pertanyaan dalam Paket</CardTitle>
                  <CardDescription>
                    Total: {questions.length} pertanyaan (Seret untuk mengurutkan ulang)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => loadCategories()}
                        variant="outline"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Pertanyaan
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Tambah Pertanyaan ke Paket</DialogTitle>
                        <DialogDescription>
                          Pilih kategori dan pilih pertanyaan untuk ditambahkan ke paket ini
                        </DialogDescription>
                      </DialogHeader>

                      {categoriesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : categories.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                          Kategori tidak tersedia
                        </div>
                      ) : (
                        <Tabs
                          value={selectedCategory?.toString() || categories[0]?.id.toString() || ""}
                          onValueChange={(value) =>
                            handleCategoryChange(parseInt(value))
                          }
                        >
                          <TabsList className="flex w-full h-auto flex-wrap justify-start overflow-y-visible overflow-x-auto">
                            {categories.map((category) => (
                              <TabsTrigger
                                key={category.id}
                                value={category.id.toString()}
                                className="text-xs sm:text-sm"
                              >
                                {category.name}
                              </TabsTrigger>
                            ))}
                          </TabsList>

                          {categories.map((category) => (
                            <TabsContent
                              key={category.id}
                              value={category.id.toString()}
                              className="space-y-4"
                            >
                              {questionsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                              ) : categoryQuestions.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                  Pertanyaan tidak tersedia di kategori ini
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {categoryQuestions.map((question) => (
                                    <div
                                      key={question.id}
                                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                                      onClick={() =>
                                        handleQuestionToggle(question.id)
                                      }
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedQuestionIds.has(
                                          question.id
                                        )}
                                        onChange={() =>
                                          handleQuestionToggle(question.id)
                                        }
                                        className="mt-1"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-foreground">
                                          Q#{question.id}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {truncateText(question.question, 150)}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                          <Badge variant="outline" className="text-xs">
                                            {question.type}
                                          </Badge>
                                          <Badge variant="outline" className="text-xs">
                                            {question.difficulty}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </TabsContent>
                          ))}
                        </Tabs>
                      )}

                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setOpenDialog(false)}
                        >
                          Batal
                        </Button>
                        <Button
                          onClick={handleAddQuestions}
                          disabled={selectedQuestionIds.size === 0}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Tambah {selectedQuestionIds.size > 0 ? selectedQuestionIds.size : ""}{" "}
                          Pertanyaan
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Menyimpan..." : "Simpan Urutan"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Belum ada pertanyaan dalam paket ini.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {questions.map((item, index) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`
                          flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-move group
                          ${draggedItem === index
                            ? "opacity-50 bg-muted border-primary/50 shadow-lg"
                            : dragOverItem === index
                              ? "bg-primary/5 border-primary shadow-md ring-2 ring-primary/20"
                              : "bg-background border-border hover:border-primary/50 hover:shadow-sm"
                          }
                        `}
                      >
                        {/* Drag Handle */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors flex-shrink-0">
                          <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>

                        {/* Order Number */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>

                        {/* Question Content */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground">
                            Q#{item.question_id}
                          </p>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {truncateText(item.question, 100)}
                          </p>
                        </div>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQuestion(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
