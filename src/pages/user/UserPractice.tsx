import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Brain, Calendar, ArrowRight, Loader2, Package, AlertCircle, History, Clock, CheckCircle2, XCircle, PlayCircle, FileText } from "lucide-react";
import { userService } from "@/lib/userService";
import { attemptService, AttemptHistory } from "@/lib/attemptService";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

interface PackageItem {
  package_id: number;
  name: string;
  type: string;
  starts_at: string | null;
  ends_at: string | null;
  status: "active" | "expired";
}

export default function UserPractice() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingAttempt, setStartingAttempt] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");

  // History tab states
  const [attempts, setAttempts] = useState<AttemptHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("packages");

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      fetchAttemptHistory();
    }
  }, [activeTab]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getStatisticsDashboard();
      const list = response.data?.active_packages ?? [];
      // Filter: hanya tampilkan latihan dan tryout, tanpa akbar
      const filteredList = list.filter((pkg) => pkg.type !== "akbar");
      setPackages(filteredList);
    } catch (err) {
      console.error("Error fetching packages:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat paket");
      toast({
        title: "Error",
        description: "Gagal memuat daftar paket. Coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string): string => {
    if (type === "tryout") return "Tryout";
    if (type === "akbar") return "Tryout Akbar";
    return "Latihan";
  };

  const getFilteredPackages = (): PackageItem[] => {
    if (selectedType === "all") return packages;
    return packages.filter((pkg) => pkg.type === selectedType);
  };

  const activePackages = getFilteredPackages().filter((pkg) => pkg.status === "active");

  const formatEndsAt = (dateString: string | null): string => {
    if (!dateString) return "Tanpa batas";
    try {
      return format(parseISO(dateString), "d MMM yyyy", { locale: id });
    } catch {
      return dateString;
    }
  };

  const fetchAttemptHistory = async () => {
    try {
      setLoadingHistory(true);
      setHistoryError(null);
      const response = await attemptService.getUserAttempts();
      setAttempts(response.data.data || []);
    } catch (err) {
      console.error("Error fetching attempt history:", err);
      setHistoryError(err instanceof Error ? err.message : "Gagal memuat riwayat");
      toast({
        title: "Error",
        description: "Gagal memuat riwayat pengerjaan. Coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const startPractice = async (packageId: number) => {
    try {
      setStartingAttempt(packageId);
      const response = await attemptService.startAttempt(packageId);
      if (response.success) {
        navigate(`/practice?attemptId=${response.data.attempt_id}`);
      }
    } catch (err) {
      console.error("Error starting attempt:", err);
      toast({
        title: "Gagal memulai",
        description: err instanceof Error ? err.message : "Sesi tidak dapat dimulai",
        variant: "destructive",
      });
    } finally {
      setStartingAttempt(null);
    }
  };

  const continueAttempt = (attemptId: number) => {
    navigate(`/practice?attemptId=${attemptId}`);
  };

  const getStatusBadge = (status: AttemptHistory["status"]) => {
    switch (status) {
      case "in_progress":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Clock className="mr-1 h-3 w-3" />
            Sedang Dikerjakan
          </Badge>
        );
      case "submitted":
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Selesai
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Kadaluarsa
          </Badge>
        );
    }
  };

  const getFilteredAttempts = (): AttemptHistory[] => {
    if (statusFilter === "all") return attempts;
    return attempts.filter((attempt) => attempt.status === statusFilter);
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return "-";
    try {
      return format(parseISO(dateString), "d MMM yyyy, HH:mm", { locale: id });
    } catch {
      return dateString;
    }
  };

  const filteredList = getFilteredPackages();

  return (
    <DashboardLayout type="user">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard Tryout & Latihan</h1>
          <p className="text-muted-foreground">
            Pilih paket untuk mulai tryout atau latihan. Untuk Tryout Akbar, silakan kunjungi menu Tryout Akbar.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Paket Aktif
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Riwayat Pengerjaan
            </TabsTrigger>
          </TabsList>

          {/* Tab: Paket Aktif */}
          <TabsContent value="packages" className="space-y-6 mt-6">

            {/* Error State */}
            {error && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchPackages}>
                    Coba lagi
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Filter by Type */}
            {!loading && packages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("all")}
                >
                  Semua
                </Button>
                <Button
                  variant={selectedType === "latihan" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("latihan")}
                >
                  Latihan
                </Button>
                <Button
                  variant={selectedType === "tryout" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("tryout")}
                >
                  Tryout
                </Button>
              </div>
            )}

            {/* Quick Start - hanya paket aktif */}
            {!loading && activePackages.length > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Brain className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Mulai Cepat</h3>
                      <p className="text-sm text-muted-foreground">
                        Langsung mulai dengan paket pertama yang masih aktif
                      </p>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => startPractice(activePackages[0].package_id)}
                    disabled={startingAttempt !== null}
                  >
                    {startingAttempt === activePackages[0].package_id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memulai...
                      </>
                    ) : (
                      <>
                        Mulai Sekarang
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Memuat paket...</p>
              </div>
            )}

            {/* Packages Grid */}
            {!loading && filteredList.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Paket Saya</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredList.map((pkg) => {
                    const canStart = pkg.status === "active" && startingAttempt === null;
                    return (
                      <Card
                        key={pkg.package_id}
                        className={`transition-all ${canStart
                            ? "cursor-pointer hover:border-primary/50 hover:shadow-md"
                            : "cursor-not-allowed opacity-75"
                          }`}
                        onClick={() => canStart && startPractice(pkg.package_id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {getTypeLabel(pkg.type)}
                            </Badge>
                            <Badge
                              className={
                                pkg.status === "active"
                                  ? "bg-green-600 hover:bg-green-600"
                                  : "bg-red-600 hover:bg-red-600"
                              }
                            >
                              {pkg.status === "active" ? "Aktif" : "Kadaluarsa"}
                            </Badge>
                          </div>
                          <CardTitle className="mt-2 text-base">{pkg.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {pkg.ends_at && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 shrink-0" />
                              <span>Berakhir pada {formatEndsAt(pkg.ends_at)}</span>
                            </div>
                          )}
                          {startingAttempt === pkg.package_id && (
                            <div className="flex items-center gap-2 text-sm text-primary">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Memulai...
                            </div>
                          )}
                          {canStart && startingAttempt !== pkg.package_id && (
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                startPractice(pkg.package_id);
                              }}
                            >
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Mulai
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredList.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-1 font-semibold">
                    {packages.length === 0
                      ? "Belum ada paket aktif"
                      : `Tidak ada paket ${selectedType === "all" ? "" : getTypeLabel(selectedType).toLowerCase()}`}
                  </h3>
                  <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                    {packages.length === 0
                      ? "Beli paket di My Packages untuk mulai tryout dan latihan."
                      : "Coba pilih filter lain atau beli paket baru."}
                  </p>
                  {packages.length === 0 && (
                    <Button asChild variant="default">
                      <Link to="/dashboard/packages">Lihat Paket</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Riwayat Pengerjaan */}
          <TabsContent value="history" className="space-y-6 mt-6">
            {/* Error State */}
            {historyError && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{historyError}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchAttemptHistory}>
                    Coba lagi
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Filter by Status */}
            {!loadingHistory && attempts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  Semua
                </Button>
                <Button
                  variant={statusFilter === "in_progress" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("in_progress")}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Sedang Dikerjakan
                </Button>
                <Button
                  variant={statusFilter === "submitted" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("submitted")}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Selesai
                </Button>
                <Button
                  variant={statusFilter === "expired" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("expired")}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Kadaluarsa
                </Button>
              </div>
            )}

            {/* Loading */}
            {loadingHistory && (
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Memuat riwayat...</p>
              </div>
            )}

            {/* History Table */}
            {!loadingHistory && getFilteredAttempts().length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Riwayat Pengerjaan</CardTitle>
                  <CardDescription>
                    Lihat semua riwayat pengerjaan tryout dan latihan Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Paket</TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Skor</TableHead>
                          <TableHead>Dimulai</TableHead>
                          <TableHead>Selesai</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredAttempts().map((attempt) => (
                          <TableRow key={attempt.id}>
                            <TableCell className="font-medium">
                              {attempt.package.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {getTypeLabel(attempt.package.type)}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(attempt.status)}</TableCell>
                            <TableCell>
                              {attempt.status === "submitted" ? (
                                <span className="font-semibold text-primary">
                                  {attempt.total_score}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDateTime(attempt.started_at)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {attempt.status === "submitted" || attempt.status === "expired"
                                ? formatDateTime(attempt.submitted_at)
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {attempt.status === "in_progress" && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => continueAttempt(attempt.id)}
                                >
                                  <PlayCircle className="mr-2 h-4 w-4" />
                                  Lanjutkan
                                </Button>
                              )}
                              {attempt.status === "submitted" && attempt.has_answer_key && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-primary text-primary hover:bg-primary/5"
                                  onClick={() => navigate(`/dashboard/tryout/review/${attempt.id}`)}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Pembahasan
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!loadingHistory && getFilteredAttempts().length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <History className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-1 font-semibold">
                    {attempts.length === 0
                      ? "Belum ada riwayat pengerjaan"
                      : "Tidak ada riwayat dengan status ini"}
                  </h3>
                  <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                    {attempts.length === 0
                      ? "Mulai mengerjakan tryout atau latihan untuk melihat riwayat di sini."
                      : "Coba pilih filter status lain."}
                  </p>
                  {attempts.length === 0 && (
                    <Button onClick={() => setActiveTab("packages")}>
                      Lihat Paket Aktif
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
