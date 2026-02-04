import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getAppName, getThemePrimary, getAppTagline } from "@/lib/env";
import { useHashNavigation } from "@/hooks/use-hash-navigation";
import { packageService } from "@/lib/packageService";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils"

import {
  BookOpen,
  Brain,
  Users,
  Trophy,
  Clock,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Tryout Berbasis Waktu",
    description: "Simulasikan kondisi ujian nyata dengan sesi latihan dan tryout berbasis waktu.",
  },
  {
    icon: BarChart3,
    title: "Analitik Terperinci",
    description: "Lacak kemajuanmu dengan laporan mendalam dan wawasan berbasis data.",
  },
  {
    icon: Trophy,
    title: "Ranking & Leaderboards",
    description: "Bersaing dengan pelajar lain dan lihat peringkatmu di papan peringkat global.",
  },
  {
    icon: BookOpen,
    title: "Materi Lengkap",
    description: "Akses ebook, video tutorial, dan materi belajar untuk pembelajaran komprehensif.",
  },
  {
    icon: Shield,
    title: "Aman & Terpercaya",
    description: "Data kamu dilindungi dengan langkah-langkah keamanan tingkat perusahaan.",
  },
];

const testimonials = [
  {
    name: "Sarah Wijaya",
    role: "Medical Student",
    content: "Sangat Keren dan membantu",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    rating: 5,
  },
  {
    name: "Budi Santoso",
    role: "Engineering Student",
    content: "soalnya detail banget, penjelasannya juga mudah dipahami. recommended deh!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=budi",
    rating: 5,
  },
  {
    name: "Anisa Rahman",
    role: "Law Student",
    content: "Aplikasinya sangat membantu saya dalam mempersiapkan ujian masuk. Soal-soalnya relevan dan penjelasannya jelas.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anisa",
    rating: 5,
  },
];



const appName = getAppName();
const primaryColor = getThemePrimary();
const appTagline = getAppTagline();

interface Product {
  id: number;
  name: string;
  price: number;
  type: string;
  is_active: boolean;
  packages?: Array<{
    id: number;
    name: string;
    type: string;
  }>;
  package?: {
    id: number;
    name: string;
    type: string;
  };
}

export default function LandingPage() {
  useHashNavigation();
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await packageService.getPublicProducts();

        // Combine bundles and regular products
        const allProducts = [
          ...response.data.bundles.map(b => ({
            id: b.id,
            name: b.name,
            price: b.price,
            type: b.type,
            is_active: b.is_active,
            packages: b.packages,
          })),
          ...response.data.regular.map(r => ({
            id: r.id,
            name: r.name,
            price: r.price,
            type: r.type,
            is_active: r.is_active,
            package: r.package,
          })),
        ];

        setProducts(allProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-4 py-20 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              <span>Terpercaya oleh 10.000+ pelajar</span>
            </div>
            <h1 className="animate-slide-up mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {appTagline} {" "}
              <span className="text-gradient">{appName}</span>
            </h1>
            <p className="animate-slide-up stagger-1 mb-8 text-lg text-muted-foreground md:text-xl">
              Persiapkan ujian masuk perguruan tinggi dengan latihan cerdas, analitik mendalam, dan materi komprehensif.
            </p>
            <div className="animate-slide-up stagger-2 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="xl" variant="hero" asChild>
                <Link to="/register">
                  Mulai Uji Coba Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link to="#features">Explore Features</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="animate-slide-up stagger-3 mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "10K+", label: "Pelajar Aktif" },
              { value: "50K+", label: "Pertanyaan" },
              { value: "98%", label: "Kesempatan Masuk PTN & Dinas" },
              { value: "4.9/5", label: "Rating dari Murid" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Semua yang kamu butuhkan untuk <span className="text-primary">Berhasil</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Fitur lengkap yang dirancang untuk membantumu belajar lebih cerdas dan mencapai tujuan akademikmu.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="hover-lift rounded-2xl border bg-card p-6 transition-all"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Mudah, Harga <span className="text-primary">Terjangkau</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Pilih paket yang sesuai dengan kebutuhan belajarmu dan mulai perjalanan sukses akademikmu hari ini.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <p className="text-muted-foreground">Loading packages...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : products.length > 0 ? (
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 3).map((product) => {
                const packageInfo = product.packages?.[0] || product.package;
                const typeLabel = packageInfo?.type || product.type;
                const linkTo = user ? "/dashboard/packages" : "/register";

                return (
                  <div
                    key={product.id}
                    className="relative rounded-2xl border-2 border-border bg-card p-6 transition-all hover-lift"
                  >
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{typeLabel}</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="mb-6 space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <span className="text-sm">
                          {product.packages ? `${product.packages.length} packages included` : "Single package"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <span className="text-sm">Access untuk belajar</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <span className="text-sm">Analitik pembelajaran</span>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      variant="default"
                      asChild
                    >
                      <Link to={linkTo}>
                        {user ? "Lihat Paket" : "Daftar Sekarang"}
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No packages available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonial" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Apa kata <span className="text-primary">Mereka</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              bergabung dengan ribuan pelajar yang telah sukses bersama AlphaNext
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border bg-card p-6 transition-all hover-lift"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-10 w-10 rounded-full bg-muted"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
            


          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-primary py-20"
        style={{
          backgroundImage: "url('/BackropAlphaNext_LandingPage.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
            Siap Memulai Perjalananmu?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
            Bergabung dengan ribuan pelajar yang telah sukses bersama AlphaNext.
            Mulai uji coba gratis hari ini.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="xl" variant="hero-outline" asChild>
              <Link to="/register">
                Mulai Uji Coba Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
