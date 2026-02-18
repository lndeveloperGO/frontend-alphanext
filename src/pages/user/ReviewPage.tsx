import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    Loader2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    Trophy,
    Calendar,
    Layers,
    HelpCircle,
    Lightbulb
} from "lucide-react";
import { attemptService, ReviewData } from "@/lib/attemptService";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function ReviewPage() {
    const { attemptId } = useParams<{ attemptId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [review, setReview] = useState<ReviewData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (attemptId) {
            fetchReview();
        }
    }, [attemptId]);

    const fetchReview = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await attemptService.getReview(parseInt(attemptId!));
            if (response.success) {
                setReview(response.data);
            }
        } catch (err) {
            console.error("Error fetching review:", err);
            setError(err instanceof Error ? err.message : "Gagal memuat pembahasan");
            toast({
                title: "Gagal memuat",
                description: err instanceof Error ? err.message : "Terjadi kesalahan saat mengambil data pembahasan.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString: string | null): string => {
        if (!dateString) return "-";
        try {
            return format(parseISO(dateString), "d MMMM yyyy, HH:mm", { locale: id });
        } catch {
            return dateString;
        }
    };

    if (loading) {
        return (
            <DashboardLayout type="user">
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground animate-pulse">Menyiapkan pembahasan untuk Anda...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !review) {
        return (
            <DashboardLayout type="user">
                <div className="max-w-2xl mx-auto py-10">
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardContent className="flex flex-col items-center gap-6 py-10 text-center">
                            <div className="rounded-full bg-destructive/10 p-4">
                                <AlertCircle className="h-12 w-12 text-destructive" />
                            </div>
                            <div>
                                <CardTitle className="mb-2 text-2xl font-bold text-destructive">Akses Ditolak / Gagal Memuat</CardTitle>
                                <p className="text-muted-foreground">
                                    {error || "Data pembahasan tidak tersedia."}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="outline" onClick={() => navigate("/dashboard/tryouts")}>
                                    Kembali ke Riwayat
                                </Button>
                                <Button onClick={fetchReview}>
                                    Coba Lagi
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout type="user">
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full shadow-sm"
                            onClick={() => navigate("/dashboard/tryouts")}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{review.package_name}</h1>
                            <nav className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Link to="/dashboard/tryouts" className="hover:text-primary transition-colors">Riwayat</Link>
                                <span>/</span>
                                <span className="font-medium text-foreground">Pembahasan</span>
                            </nav>
                        </div>
                    </div>
                    <Button variant="default" className="shadow-md" onClick={() => window.print()}>
                        <FileText className="mr-2 h-4 w-4" />
                        Cetak Pembahasan
                    </Button>
                </div>

                {/* Summary Card */}
                <Card className="overflow-hidden border-2 shadow-lg glass-card border-primary/10">
                    <div className="bg-primary/5 px-6 py-3 border-b border-primary/10">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Ringkasan Hasil</span>
                    </div>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/30 border border-border/50">
                                <Trophy className="h-8 w-8 text-primary mb-2 opacity-80" />
                                <span className="text-3xl font-bold">{review.total_score}</span>
                                <span className="text-xs font-medium text-muted-foreground uppercase mt-1">Total Skor</span>
                            </div>

                            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/30 border border-border/50">
                                <Calendar className="h-8 w-8 text-primary mb-2 opacity-80" />
                                <span className="text-sm font-bold text-center">{formatDateTime(review.submitted_at)}</span>
                                <span className="text-xs font-medium text-muted-foreground uppercase mt-1">Tanggal Selesai</span>
                            </div>

                            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/30 border border-border/50">
                                <Layers className="h-8 w-8 text-primary mb-2 opacity-80" />
                                <span className="text-3xl font-bold">{review.results.length}</span>
                                <span className="text-xs font-medium text-muted-foreground uppercase mt-1">Total Soal</span>
                            </div>

                            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/30 border border-border/50">
                                <CheckCircle2 className="h-8 w-8 text-success mb-2 opacity-80" />
                                <span className="text-3xl font-bold text-success">
                                    {review.results.filter(r => r.user_answer.is_correct).length}
                                </span>
                                <span className="text-xs font-medium text-muted-foreground uppercase mt-1">Jawaban Benar</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Questions List */}
                <div className="space-y-12">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            Detail Pembahasan Soal
                        </h2>
                        <div className="h-px flex-1 bg-border/60" />
                    </div>

                    {review.results.map((result, index) => {
                        const isCorrect = result.user_answer.is_correct;
                        const userAnswered = result.user_answer.selected_option_id !== null;

                        return (
                            <div key={result.question_id} className="group scroll-mt-20">
                                <div className="flex items-start gap-4 mb-2">
                                    <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center font-bold border-2 bg-background shadow-sm">
                                        {result.no}
                                    </Badge>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            {userAnswered ? (
                                                isCorrect ? (
                                                    <Badge className="bg-success text-white">✓ Benar (+{result.user_answer.score_awarded})</Badge>
                                                ) : (
                                                    <Badge variant="destructive">✗ Salah (+{result.user_answer.score_awarded})</Badge>
                                                )
                                            ) : (
                                                <Badge variant="secondary">! Kosong</Badge>
                                            )}
                                        </div>

                                        <Card className={cn(
                                            "border-2 transition-all duration-300",
                                            isCorrect ? "border-success/20 hover:border-success/40 shadow-sm" : "border-destructive/20 hover:border-destructive/40 shadow-sm"
                                        )}>
                                            <CardContent className="p-6">
                                                {/* Question Content */}
                                                <div className="mb-6">
                                                    {result.image_url && (
                                                        <div className="mb-4 overflow-hidden rounded-xl border bg-muted/20">
                                                            <img
                                                                src={result.image_url}
                                                                alt={`Soal ${result.no}`}
                                                                className="h-auto max-h-[400px] w-full object-contain mx-auto"
                                                            />
                                                        </div>
                                                    )}
                                                    <p className="text-lg font-medium leading-relaxed text-foreground/90">
                                                        {result.question_text}
                                                    </p>
                                                </div>

                                                {/* Options */}
                                                <div className="grid gap-3 mb-8">
                                                    {result.options.map((option) => {
                                                        const isSelected = result.user_answer.selected_option_id === option.id;
                                                        const isCorrectOption = option.is_correct;

                                                        return (
                                                            <div
                                                                key={option.id}
                                                                className={cn(
                                                                    "flex items-start gap-4 p-4 rounded-xl border-2 transition-colors",
                                                                    isCorrectOption
                                                                        ? "border-success bg-success/5 shadow-sm"
                                                                        : isSelected && !isCorrectOption
                                                                            ? "border-destructive bg-destructive/5"
                                                                            : "border-border bg-background"
                                                                )}
                                                            >
                                                                <span className={cn(
                                                                    "flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full text-xs font-bold",
                                                                    isCorrectOption
                                                                        ? "bg-success text-white"
                                                                        : isSelected && !isCorrectOption
                                                                            ? "bg-destructive text-white"
                                                                            : "bg-muted text-muted-foreground"
                                                                )}>
                                                                    {String.fromCharCode(64 + result.options.indexOf(option) + 1)}
                                                                </span>
                                                                <div className="flex-1 text-sm md:text-base">
                                                                    {option.text}
                                                                </div>
                                                                {isCorrectOption && (
                                                                    <Badge className="bg-success text-white ml-auto text-[10px] py-0">Kunci</Badge>
                                                                )}
                                                                {isSelected && !isCorrectOption && (
                                                                    <Badge variant="destructive" className="ml-auto text-[10px] py-0">Pilihan Anda</Badge>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Explanation Section */}
                                                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden group/expl">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/expl:opacity-20 transition-opacity">
                                                        <Lightbulb className="h-12 w-12 text-primary" />
                                                    </div>
                                                    <h4 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-3">
                                                        <AlertCircle className="h-4 w-4" />
                                                        Pembahasan
                                                    </h4>
                                                    <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                                                        {result.explanation || "Tidak ada penjelasan untuk soal ini."}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Navigation */}
                <div className="flex justify-center pt-8 border-t">
                    <Button
                        variant="outline"
                        size="lg"
                        className="group px-8"
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        Kembali ke Atas
                        <ChevronLeft className="ml-2 h-4 w-4 rotate-90 transition-transform group-hover:-translate-y-1" />
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
