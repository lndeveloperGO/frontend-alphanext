import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import {
  questionService,
  Question,
  QuestionOption,
  CreateQuestionInput,
  UpdateQuestionInput,
  CreateOptionInput,
  UpdateOptionInput,
  Category,
} from "@/lib/questionService";
import { categoryService } from "@/lib/categoryService";
import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";

type DialogMode = "create" | "edit" | null;
type OptionMode = "create" | "edit" | null;

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [optionDialogOpen, setOptionDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [optionMode, setOptionMode] = useState<OptionMode>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [formData, setFormData] = useState<{
    category_id: number;
    question: string;
    explanation?: string;
    question_type: "text" | "image";
    image: File | null;
  }>({
    category_id: 0,
    question: "",
    explanation: "",
    question_type: "text",
    image: null
  });

  const [optionFormData, setOptionFormData] = useState<{
    label: string;
    text: string;
    score_value: number;
    image: File | null;
  }>({ label: "", text: "", score_value: 0, image: null });

  const [questionImagePreview, setQuestionImagePreview] = useState<string | null>(null);
  const [optionImagePreview, setOptionImagePreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load questions
  useEffect(() => {
    loadQuestions();
    loadCategories();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await questionService.getQuestions();

      setQuestions(data);
    } catch (error) {
      toast({
        title: "Kesalahan",
        description:
          error instanceof Error ? error.message : "Gagal memuat pertanyaan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const getAuthHeader = () => {
      const token = useAuthStore.getState().token;
      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    };
    try {
      // Sesuaikan dengan endpoint kategori Anda
      const response = await fetch(`${getApiBaseUrl()}/admin/categories`, {
        method: "GET",
        headers: getAuthHeader(),
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data?.data || []);
      }
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  const handleOpenDialog = (mode: DialogMode, question?: Question) => {
    setDialogMode(mode);
    if (mode === "create") {
      setFormData({
        category_id: 0,
        question: "",
        explanation: "",
        question_type: "text",
        image: null
      });
      setQuestionImagePreview(null);
    } else if (mode === "edit" && question) {
      setSelectedQuestion(question);
      setFormData({
        category_id: question.category_id,
        question: question.question,
        explanation: question.explanation || "",
        question_type: question.question_type || "text",
        image: null,
      });
      setQuestionImagePreview(question.image_url || null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogMode(null);
    setSelectedQuestion(null);
    setFormData({
      category_id: 0,
      question: "",
      explanation: "",
      question_type: "text",
      image: null
    });
    setQuestionImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!formData.category_id) {
      toast({
        title: "Kesalahan",
        description: "Silakan pilih kategori",
        variant: "destructive",
      });
      return;
    }

    if (!formData.question.trim()) {
      toast({
        title: "Kesalahan",
        description: "Teks pertanyaan wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const input = { ...formData };

      if (dialogMode === "create") {
        await questionService.createQuestion(input as CreateQuestionInput);
        toast({
          title: "Berhasil",
          description: "Pertanyaan berhasil dibuat",
        });
      } else if (dialogMode === "edit" && selectedQuestion) {
        await questionService.updateQuestion(
          selectedQuestion.id,
          input as UpdateQuestionInput
        );
        toast({
          title: "Berhasil",
          description: "Pertanyaan berhasil diperbarui",
        });
      }

      handleCloseDialog();
      loadQuestions();
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

  const handleDeleteClick = (question: Question) => {
    setSelectedQuestion(question);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedQuestion) return;

    try {
      setSubmitting(true);
      await questionService.deleteQuestion(selectedQuestion.id);
      toast({
        title: "Berhasil",
        description: "Pertanyaan berhasil dihapus",
      });
      setDeleteDialogOpen(false);
      setSelectedQuestion(null);
      loadQuestions();
    } catch (error) {
      toast({
        title: "Kesalahan",
        description:
          error instanceof Error ? error.message : "Gagal menghapus pertanyaan",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Option handlers
  const handleOpenOptionDialog = (mode: OptionMode, option?: QuestionOption) => {
    setOptionMode(mode);
    if (mode === "create") {
      // Auto-generate label berdasarkan jumlah options yang ada
      const nextLabel = selectedQuestion?.options
        ? String.fromCharCode(65 + (selectedQuestion.options.length || 0))
        : "A";
      setOptionFormData({ label: nextLabel, text: "", score_value: 0, image: null });
      setOptionImagePreview(null);
    } else if (mode === "edit" && option) {
      setSelectedOption(option);
      setOptionFormData({
        label: option.label,
        text: option.text,
        score_value: option.score_value,
        image: null,
      });
      setOptionImagePreview(option.image_url || null);
    }
    setOptionDialogOpen(true);
  };

  const handleCloseOptionDialog = () => {
    setOptionDialogOpen(false);
    setOptionMode(null);
    setSelectedOption(null);
    setOptionFormData({ label: "", text: "", score_value: 0, image: null });
    setOptionImagePreview(null);
  };

  const handleSubmitOption = async () => {
    if (!optionFormData.label.trim()) {
      toast({
        title: "Kesalahan",
        description: "Label opsi wajib diisi",
        variant: "destructive",
      });
      return;
    }

    if (!optionFormData.text.trim()) {
      toast({
        title: "Kesalahan",
        description: "Teks opsi wajib diisi",
        variant: "destructive",
      });
      return;
    }

    if (!selectedQuestion) return;

    try {
      setSubmitting(true);

      const input = { ...optionFormData };

      if (optionMode === "create") {
        await questionService.createOption(
          selectedQuestion.id,
          input as CreateOptionInput
        );
        toast({
          title: "Berhasil",
          description: "Opsi berhasil dibuat",
        });
      } else if (optionMode === "edit" && selectedOption?.id) {
        await questionService.updateOption(
          selectedOption.id,
          input as UpdateOptionInput
        );
        toast({
          title: "Berhasil",
          description: "Opsi berhasil diperbarui",
        });
      }

      handleCloseOptionDialog();
      // Re-fetch detail question untuk update options
      const detailQuestion = await questionService.getQuestion(selectedQuestion.id);
      setSelectedQuestion(detailQuestion);
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

  const handleDeleteOption = async (option: QuestionOption) => {
    if (!option.id) return;

    try {
      await questionService.deleteOption(option.id);
      toast({
        title: "Berhasil",
        description: "Opsi berhasil dihapus",
      });
      loadQuestions();
    } catch (error) {
      toast({
        title: "Kesalahan",
        description:
          error instanceof Error ? error.message : "Gagal menghapus opsi",
        variant: "destructive",
      });
    }
  };

  const truncateText = (text: string | undefined, maxLength: number = 100) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const getMaxScore = (options: QuestionOption[]): number => {
    return Math.max(...options.map(o => o.score_value), 0);
  };

  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index); // A, B, C, D, E...
  };

  const handleOpenDetailDialog = async (question: Question) => {
    try {
      setLoading(true);
      const detailQuestion = await questionService.getQuestion(question.id);
      setSelectedQuestion(detailQuestion);
      setDetailDialogOpen(true);
    } catch (error) {
      toast({
        title: "Kesalahan",
        description:
          error instanceof Error ? error.message : "Gagal memuat detail pertanyaan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, target: "question" | "option") => {
    const file = e.target.files?.[0];
    if (file) {
      if (target === "question") {
        setFormData((prev) => ({ ...prev, image: file }));
        setQuestionImagePreview(URL.createObjectURL(file));
      } else {
        setOptionFormData((prev) => ({ ...prev, image: file }));
        setOptionImagePreview(URL.createObjectURL(file));
      }
    }
  };

  return (
    <DashboardLayout type="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pertanyaan</h1>
            <p className="text-muted-foreground">
              Kelola pertanyaan dan opsi jawaban
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/questions/bulk-import")}
            >
              <Upload className="mr-2 h-4 w-4" />
              Impor Massal
            </Button>
            <Button onClick={() => handleOpenDialog("create")}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pertanyaan
            </Button>
          </div>
        </div>

        {/* Questions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pertanyaan</CardTitle>
            <CardDescription>
              Total pertanyaan: {questions.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : questions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Pertanyaan tidak ditemukan. Buat satu untuk memulai.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Pertanyaan</TableHead>
                      <TableHead className="w-20 text-center">Opsi</TableHead>
                      <TableHead className="w-24 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">
                          {question.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {question.image_url && (
                              <div className="h-10 w-10 overflow-hidden rounded-md border flex-shrink-0">
                                <img
                                  src={question.image_url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="line-clamp-1">{truncateText(question.question)}</span>
                              <Badge variant="secondary" className="w-fit text-[10px] h-4 mt-1">
                                {question.question_type || "text"}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {question.options_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDetailDialog(question)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog("edit", question)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(question)}
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

      {/* Question Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Buat Pertanyaan" : "Edit Pertanyaan"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Tambah pertanyaan baru"
                : "Perbarui informasi pertanyaan"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">Kategori</Label>
                <select
                  id="category_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category_id: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={submitting}
                >
                  <option value={0}>-- Pilih Kategori --</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question_type">Tipe Pertanyaan</Label>
                <select
                  id="question_type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.question_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      question_type: e.target.value as "text" | "image",
                    })
                  }
                  disabled={submitting}
                >
                  <option value="text">Hanya Teks</option>
                  <option value="image">Dengan Gambar</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question">Teks Pertanyaan</Label>
              <Textarea
                id="question"
                placeholder="Masukkan teks pertanyaan"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                disabled={submitting}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Gambar Pertanyaan</Label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "question")}
                    disabled={submitting}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Unggah gambar untuk pertanyaan ini. Format yang didukung: JPG, PNG, WebP.
                  </p>
                </div>
                {questionImagePreview && (
                  <div className="h-20 w-32 rounded-md border overflow-hidden bg-muted flex-shrink-0 relative">
                    <img
                      src={questionImagePreview}
                      alt="Pratinjau"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="explanation">Penjelasan (Opsional)</Label>
              <Textarea
                id="explanation"
                placeholder="Masukkan penjelasan atau kunci jawaban"
                value={formData.explanation || ""}
                onChange={(e) =>
                  setFormData({ ...formData, explanation: e.target.value })
                }
                disabled={submitting}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Detail Dialog with Options */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detail Pertanyaan</DialogTitle>
            <DialogDescription>
              Kelola opsi untuk pertanyaan ini
            </DialogDescription>
          </DialogHeader>

          {selectedQuestion && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Detail</TabsTrigger>
                <TabsTrigger value="options">
                  Opsi ({selectedQuestion.options?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Pertanyaan</Label>
                  <p className="text-sm p-3 bg-muted rounded-md whitespace-pre-wrap">
                    {selectedQuestion.question}
                  </p>
                  {selectedQuestion.image_url && (
                    <div className="mt-2 rounded-md border overflow-hidden bg-muted max-w-md mx-auto">
                      <img
                        src={selectedQuestion.image_url}
                        alt="Question"
                        className="w-full h-auto max-h-64 object-contain"
                      />
                    </div>
                  )}
                </div>

                {selectedQuestion.explanation && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Penjelasan</Label>
                    <p className="text-sm p-3 bg-muted rounded-md whitespace-pre-wrap">
                      {selectedQuestion.explanation}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="options" className="space-y-4">
                <div className="space-y-3">
                  {(!selectedQuestion.options || selectedQuestion.options.length === 0) ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Belum ada opsi. Tambah satu untuk memulai.
                    </p>
                  ) : (
                    selectedQuestion.options.map((option) => {
                      const maxScore = Math.max(
                        ...selectedQuestion.options!.map(o => o.score_value),
                        0
                      );
                      const isHighest = option.score_value === maxScore && maxScore > 0;

                      return (
                        <div
                          key={option.id}
                          className={`p-3 rounded-md border ${isHighest ? "border-green-500 bg-green-50" : "bg-muted"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg">
                                  {option.label}.
                                </span>
                                <span className="font-medium">
                                  {option.text}
                                </span>
                              </div>
                              {option.image_url && (
                                <div className="mt-1 mb-1 ml-6 rounded border overflow-hidden bg-white w-fit max-w-[200px]">
                                  <img
                                    src={option.image_url}
                                    alt=""
                                    className="w-full h-auto max-h-32 object-contain"
                                  />
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground ml-6">
                                Score: {option.score_value}
                                {isHighest && (
                                  <Badge className="ml-2" variant="default">
                                    Tertinggi
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenOptionDialog("edit", option)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteOption(option)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <Button
                  onClick={() => handleOpenOptionDialog("create")}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Option Form Dialog */}
      <Dialog open={optionDialogOpen} onOpenChange={setOptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {optionMode === "create" ? "Add Option" : "Edit Option"}
            </DialogTitle>
            <DialogDescription>
              {optionMode === "create"
                ? "Add a new answer option"
                : "Update option information"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label (A, B, C, ...)</Label>
              <Input
                id="label"
                placeholder="e.g., A"
                value={optionFormData.label}
                onChange={(e) =>
                  setOptionFormData({
                    ...optionFormData,
                    label: e.target.value.toUpperCase(),
                  })
                }
                disabled={submitting}
                maxLength={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">Option Text</Label>
              <Textarea
                id="text"
                placeholder="Enter the option text"
                value={optionFormData.text}
                onChange={(e) =>
                  setOptionFormData({
                    ...optionFormData,
                    text: e.target.value,
                  })
                }
                disabled={submitting}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Option Image</Label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "option")}
                    disabled={submitting}
                  />
                </div>
                {optionImagePreview && (
                  <div className="h-16 w-24 rounded-md border overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={optionImagePreview}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="score_value">Score Value</Label>
              <Input
                id="score_value"
                type="number"
                placeholder="e.g., 5"
                value={optionFormData.score_value}
                onChange={(e) =>
                  setOptionFormData({
                    ...optionFormData,
                    score_value: parseInt(e.target.value) || 0,
                  })
                }
                disabled={submitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseOptionDialog}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitOption} disabled={submitting}>
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
          <AlertDialogTitle>Delete Question</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this question? This action cannot
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
