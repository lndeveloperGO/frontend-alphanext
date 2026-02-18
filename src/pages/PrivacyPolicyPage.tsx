import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { getAppName } from "@/lib/env";

const appName = getAppName();

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background p-6 md:p-12 lg:p-24">
            <div className="mx-auto max-w-4xl">
                <Link to="/register">
                    <Button variant="ghost" className="mb-8 gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        Kembali ke Pendaftaran
                    </Button>
                </Link>

                <h1 className="mb-8 text-4xl font-bold">Kebijakan Privasi</h1>

                <div className="space-y-6 text-muted-foreground">
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">1. Informasi yang Kami Kumpulkan</h2>
                        <p>
                            Kami mengumpulkan informasi yang Anda berikan saat mendaftar, termasuk nama, alamat email, nomor telepon, asal sekolah, dan tanggal lahir. Kami juga mengumpulkan data penggunaan platform untuk meningkatkan layanan kami.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">2. Cara Kami Menggunakan Informasi Anda</h2>
                        <p>
                            Informasi Anda digunakan untuk menyediakan layanan, memproses transaksi, mengirimkan pembaruan penting, dan memberikan pengalaman pembelajaran yang dipersonalisasi di {appName}.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">3. Keamanan Data</h2>
                        <p>
                            Kami menerapkan standar keamanan teknis dan organisasi untuk melindungi data pribadi Anda dari akses yang tidak sah, pengungkapan, atau kerusakan.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">4. Berbagi Informasi</h2>
                        <p>
                            Kami tidak akan menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami hanya akan berbagi informasi jika diwajibkan oleh hukum atau dengan persetujuan Anda.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">5. Hak Anda</h2>
                        <p>
                            Anda memiliki hak untuk mengakses, memperbarui, atau menghapus informasi pribadi Anda yang kami simpan. Anda dapat melakukannya melalui pengaturan akun Anda.
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
