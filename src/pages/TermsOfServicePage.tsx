import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { getAppName } from "@/lib/env";

const appName = getAppName();

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-background p-6 md:p-12 lg:p-24">
            <div className="mx-auto max-w-4xl">
                <Link to="/register">
                    <Button variant="ghost" className="mb-8 gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        Kembali ke Pendaftaran
                    </Button>
                </Link>

                <h1 className="mb-8 text-4xl font-bold">Ketentuan Layanan</h1>

                <div className="space-y-6 text-muted-foreground">
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">1. Penerimaan Ketentuan</h2>
                        <p>
                            Dengan mendaftar dan menggunakan layanan {appName}, Anda setuju untuk terikat oleh Ketentuan Layanan ini. Jika Anda tidak setuju dengan ketentuan ini, Anda tidak diperbolehkan menggunakan layanan kami.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">2. Pengunaan Layanan</h2>
                        <p>
                            Layanan kami disediakan untuk tujuan pembelajaran dan pengembangan diri. Anda setuju untuk menggunakan layanan ini hanya untuk tujuan yang sah dan sesuai dengan hukum yang berlaku di Republik Indonesia.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">3. Akun Pengguna</h2>
                        <p>
                            Anda bertanggung jawab untuk menjaga kerahasiaan informasi akun dan kata sandi Anda. Anda bertanggung jawab penuh atas semua aktivitas yang terjadi di bawah akun Anda.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">4. Hak Kekayaan Intelektual</h2>
                        <p>
                            Semua materi pembelajaran, desain, logo, dan konten lainnya dalam platform {appName} adalah milik kami atau pemberi lisensi kami dan dilindungi oleh hukum hak cipta.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">5. Perubahan Ketentuan</h2>
                        <p>
                            Kami berhak untuk mengubah Ketentuan Layanan ini kapan saja. Perubahan akan berlaku segera setelah dipublikasikan di platform kami.
                        </p>
                    </section>

                    <p className="pt-8 text-sm italic">
                        Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>
        </div>
    );
}
