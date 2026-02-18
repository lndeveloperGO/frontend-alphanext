import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/authService";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [token, setToken] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const t = searchParams.get("token");
        const e = searchParams.get("email");

        if (!t || !e) {
            toast({
                title: "Link tidak valid",
                description: "Link reset password tidak valid atau sudah kadaluarsa.",
                variant: "destructive",
            });
            // Optional: redirect to forgot password if params are missing
            // navigate("/forgot-password");
        } else {
            setToken(t);
            setEmail(e);
        }
    }, [searchParams, toast, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== passwordConfirmation) {
            toast({
                title: "Password tidak cocok",
                description: "Konfirmasi password harus sama dengan password baru.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        const result = await authService.resetPassword({
            token,
            email,
            password,
            password_confirmation: passwordConfirmation,
        });

        if (result.success) {
            setIsSuccess(true);
            toast({
                title: "Password berhasil diperbarui!",
                description: result.message || "Silakan login kembali dengan password baru Anda.",
            });

            // Auto redirect after 3 seconds
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } else {
            toast({
                title: "Gagal reset password",
                description: result.error || "Terjadi kesalahan saat memperbarui password.",
                variant: "destructive",
            });
        }

        setIsLoading(false);
    };

    if (isSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Password Diperbarui!</h2>
                    <p className="text-muted-foreground">
                        Password Anda telah berhasil diubah. Anda akan dialihkan ke halaman login sebentar lagi.
                    </p>
                    <div className="mt-8">
                        <Link to="/login">
                            <Button className="w-full">Ke Halaman Login Sekarang</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-center">Setel Ulang Password</h2>
                    <p className="mt-2 text-sm text-muted-foreground text-center">
                        Masukkan password baru Anda di bawah ini.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                disabled
                                className="bg-muted cursor-not-allowed h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password Baru</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password minimal 6 karakter"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 pr-10"
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
                            <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                            <Input
                                id="password_confirmation"
                                type={showPassword ? "text" : "password"}
                                placeholder="Ulangi password baru"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                required
                                className="h-12"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Password Baru
                    </Button>
                </form>
            </div>
        </div>
    );
}
