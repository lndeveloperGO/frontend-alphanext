import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { Eye, EyeOff, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAppName, getAppTagline } from "@/lib/env";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AdvancedDatePicker } from "@/components/shadcn-studio/calendar/AdvancedDatePicker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const appName = getAppName();
const appTagline = getAppTagline();

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolOrigin, setSchoolOrigin] = useState("");
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [birthDateOpen, setBirthDateOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Password tidak cocok",
        description: "Pastikan konfirmasi password sama dengan password Anda.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password terlalu pendek",
        description: "Password harus minimal 6 karakter.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const birthDateString = birthDate ? format(birthDate, "yyyy-MM-dd") : undefined;

    const result = await register(name, email, password, phone, schoolOrigin, birthDateString);

    if (result.success) {
      toast({
        title: "Akun berhasil dibuat",
        description: "Silakan masuk dengan email dan password Anda.",
      });
      navigate("/login", { replace: true });
    } else {
      toast({
        title: "Pendaftaran gagal",
        description: result.error || "Terjadi kesalahan. Coba lagi.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Image */}
      <div
        className="relative hidden w-0 flex-1 lg:block"
        style={{
          backgroundImage: "url('https://cdn.antaranews.com/cache/1200x800/2021/08/10/shutterstock_1389777500.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30">
          <div className="flex h-full flex-col items-center justify-center p-12 text-primary-foreground">
            <div className="max-w-md text-center">
              <h2 className="mb-4 text-3xl font-bold">Belajar dimulai dari hari ini</h2>
              <p className="text-lg text-primary-foreground/80">
                akses ribuan kursus online dan tingkatkan keterampilanmu dengan {appName}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <img
                  src="/logoAlphanext.jpg"
                  alt={appName}
                  className=" rounded-xl"
                />
              </div>
              <span className="text-2xl font-bold">{appName}</span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold tracking-tight">
              Daftar akun baru mu sekarang!
            </h2>
            <p className="mt-2 text-muted-foreground">
              Mulai perjalanan belajarmu dengan {appName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name and Email Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-10"
                />
              </div>
            </div>

            {/* Phone and School Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  autoComplete="tel"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school_origin">Asal Sekolah</Label>
                <Input
                  id="school_origin"
                  type="text"
                  placeholder="SMA 1 Bandung"
                  value={schoolOrigin}
                  onChange={(e) => setSchoolOrigin(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
            </div>

            {/* Birth Date Row */}
            <div className="space-y-2">
              <Label>Tanggal Lahir</Label>
              <Popover open={birthDateOpen} onOpenChange={setBirthDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 shadow-sm",
                      !birthDate && "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-600 rounded-lg">
                        <CalendarIcon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm">
                        {birthDate ? format(birthDate, "dd MMMM yyyy") : "Pilih tanggal lahir"}
                      </span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0 overflow-hidden min-w-[320px]">

                    {/* Advanced Date Picker */}
                    <AdvancedDatePicker
                      selected={birthDate}
                      onSelect={(date) => {
                        setBirthDate(date);
                        setBirthDateOpen(false);
                      }}
                      fromYear={1950}
                      toYear={new Date().getFullYear()}
                    />

                    {/* Footer */}
                    <div className="px-4 pb-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setBirthDate(undefined);
                          setBirthDateOpen(false);
                        }}
                        className="flex-1 rounded-lg"
                      >
                        Hapus
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setBirthDateOpen(false)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg"
                      >
                        Konfirmasi
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Password Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="konfirmasi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="h-10"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="mt-1 rounded border-input" required />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                Saya setuju dengan{" "}
                <Link to="/terms-of-service" className="text-primary hover:underline">Ketentuan Layanan</Link>
                {" "}dan{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline">Kebijakan Privasi</Link>
              </label>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat Akun
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
