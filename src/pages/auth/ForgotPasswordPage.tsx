import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/authService";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAppName } from "@/lib/env";

const appName = getAppName();

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await authService.forgotPassword(email);

        if (result.success) {
            setIsSubmitted(true);
            toast({
                title: "Link terkirim!",
                description: result.message || "Link reset password telah dikirim ke email Anda.",
            });
        } else {
            toast({
                title: "Gagal mengirim link",
                description: result.error || "Gagal mengirim link reset password. Pastikan email Anda benar.",
                variant: "destructive",
            });
        }

        setIsLoading(false);
    };

    if (isSubmitted) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <MailCheck className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Cek Email Anda</h2>
                    <p className="text-muted-foreground">
                        Kami telah mengirimkan link reset password ke <strong>{email}</strong>.
                        Silakan cek kotak masuk (atau folder spam) Anda.
                    </p>
                    <div className="mt-8">
                        <Link to="/login">
                            <Button variant="outline" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Login
                            </Button>
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
                    <Link to="/login" className="mb-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Login
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Lupa Password?</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Masukkan email Anda dan kami akan mengirimkan link untuk mengatur ulang password Anda.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
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
                                className="h-12"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Kirim Link Reset Password
                    </Button>
                </form>
            </div>
        </div>
    );
}
