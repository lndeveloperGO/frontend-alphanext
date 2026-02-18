import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAppName, getAppTagline } from "@/lib/env";

const appName = getAppName();
const appTagline = getAppTagline();

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast({
        title: "Selamat datang kembali!",
        description: "Anda telah berhasil masuk.",
      });

      // Check role and redirect
      const user = useAuthStore.getState().user;
      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } else {
      toast({
        title: "Gagal masuk",
        description: result.error || "Email atau password salah",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
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
              Selamat Datang di {appName}
            </h2>
            <p className="mt-2 text-muted-foreground">
              Masuk untuk melanjutkan belajar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Alamat Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-input" />
                Ingat saya
              </label>
              <Link to="/forgot-password" university-id="" className="text-sm font-medium text-primary hover:underline">
                Lupa password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Masuk
            </Button>
          </form>

          {/* <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">
                  Akun Demo
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
              <p className="font-medium">Admin: admin@edulearn.com / admin123</p>
              <p className="font-medium">User: user@edulearn.com / user123</p>
            </div>
          </div> */}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum memiliki akun?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              daftar sekarang!
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div
        className="relative hidden w-0 flex-1 lg:block"
        style={{
          backgroundImage: "url('https://cdn-prd.tongkolspace.com/hipwee/wp-content/uploads/2020/12/hipwee-Depositphotos_317220796_l-2015.jpg')",
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
    </div>
  );
}
