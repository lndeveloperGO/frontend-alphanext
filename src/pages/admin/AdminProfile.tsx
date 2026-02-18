import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/lib/authService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Lock, Calendar, Phone, School, Eye, EyeOff, Check, EyeIcon } from "lucide-react";
import { format } from "date-fns";

export default function AdminProfile() {
  const { user, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    school_origin: user?.school_origin || "",
    birth_date: user?.birth_date || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const result = await authService.getMe();
      if (result.success && result.data) {
        setUser(result.data);
        setFormData((prev) => ({
          ...prev,
          name: result.data.name || "",
          email: result.data.email || "",
          phone: result.data.phone || "",
          school_origin: result.data.school_origin || "",
          birth_date: result.data.birth_date || "",
        }));
      } else {
        setErrorMessage(result.error || "Gagal memuat data pengguna");
      }
      setIsLoading(false);
    };

    if (user?.id) {
      fetchUserData();
    }
  }, [setUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    const result = await authService.updateProfile({
      name: formData.name,
      email: formData.email,
    });

    if (result.success) {
      setUser(result.data);
      setSuccessMessage("Profil berhasil diperbarui!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setErrorMessage(result.error || "Gagal memperbarui profil");
    }
    setIsSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("Kata sandi baru tidak cocok");
      return;
    }

    if (formData.newPassword.length < 6) {
      setErrorMessage("Kata sandi minimal harus 6 karakter");
      return;
    }

    setIsSaving(true);

    const result = await authService.changePassword({
      current_password: formData.currentPassword,
      password: formData.newPassword,
      password_confirmation: formData.confirmPassword,
    });

    if (result.success) {
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      setSuccessMessage("Kata sandi berhasil diubah!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setErrorMessage(result.error || "Gagal mengubah kata sandi");
    }
    setIsSaving(false);
  };

  const createdAtDate = user?.createdAt
    ? format(new Date(user.createdAt), "MMMM dd, yyyy")
    : "N/A";

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  if (isLoading) {
    return (
      <DashboardLayout type="admin">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Memuat profil...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout type="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Profil Saya</h1>
          <p className="text-muted-foreground">
            Kelola informasi akun dan pengaturan keamanan Anda
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {errorMessage && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Profil</CardTitle>
            <CardDescription>Detail dasar akun Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-semibold text-sm">{user?.name}</p>
                  <Badge variant="outline" className="mt-2">
                    {user?.role === "admin" ? "Administrator" : "Siswa"}
                  </Badge>
                </div>
              </div>

              {/* Info Section */}
              <Separator orientation="vertical" className="hidden md:block h-32" />

              <div className="flex-1 space-y-4">
                {/* Name */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                    <p className="font-semibold">{user?.name}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Alamat Email</p>
                    <p className="font-semibold">{user?.email}</p>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Anggota Sejak</p>
                    <p className="font-semibold">{createdAtDate}</p>
                  </div>
                </div>

                {/* Phone (Hidden) */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Phone className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Nomor Telepon</p>
                    <p className="font-semibold">{user?.phone || "-"}</p>
                  </div>
                </div>

                {/* School Origin (Hidden) */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <School className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Asal Sekolah</p>
                    <p className="font-semibold">{user?.school_origin || "-"}</p>
                  </div>
                </div>

                {/* Birth Date (Hidden) */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Tanggal Lahir</p>
                    <p className="font-semibold">{user?.birth_date ? format(new Date(user.birth_date), "dd MMMM yyyy") : "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profil</CardTitle>
            <CardDescription>Perbarui informasi akun Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap Anda"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Alamat Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Masukkan alamat email Anda"
                  />
                </div>

                {/* Phone (Hidden - disabled) */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Nomor telepon"
                    disabled
                    className="bg-muted"
                  />
                </div>

                {/* School Origin (Hidden - disabled) */}
                <div className="space-y-2">
                  <Label htmlFor="school_origin">Asal Sekolah</Label>
                  <Input
                    id="school_origin"
                    name="school_origin"
                    type="text"
                    value={formData.school_origin}
                    onChange={handleInputChange}
                    placeholder="Asal sekolah"
                    disabled
                    className="bg-muted"
                  />
                </div>

                {/* Birth Date (Hidden - disabled) */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="birth_date">Tanggal Lahir</Label>
                  <Input
                    id="birth_date"
                    name="birth_date"
                    type="text"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    placeholder="Tanggal lahir"
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Form */}
        <Card>
          <CardHeader>
            <CardTitle>Keamanan</CardTitle>
            <CardDescription>Kelola kata sandi dan pengaturan keamanan Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Kata Sandi Saat Ini</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Masukkan kata sandi saat ini"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Kata Sandi Baru</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Masukkan kata sandi baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Konfirmasi kata sandi baru Anda"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
                {isSaving ? "Memperbarui..." : "Ubah Kata Sandi"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
