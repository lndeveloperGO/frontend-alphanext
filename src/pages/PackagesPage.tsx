import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { packageService } from "@/lib/packageService";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShareButton } from "@/components/common/ShareButton";
import { SEO } from "@/components/common/SEO";
import { CheckCircle2, Filter } from "lucide-react";

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

export default function PackagesPage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await packageService.getPublicProducts();

        // Combine bundles and regular products
        const allProducts = [
          ...response.data.bundles.map((b) => ({
            id: b.id,
            name: b.name,
            price: b.price,
            type: b.type,
            is_active: b.is_active,
            packages: b.packages,
          })),
          ...response.data.regular.map((r) => ({
            id: r.id,
            name: r.name,
            price: r.price,
            type: r.type,
            is_active: r.is_active,
            package: r.package,
          })),
        ];

        setProducts(allProducts);
        setFilteredProducts(allProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle filtering
  useEffect(() => {
    let filtered = products;

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((p) => p.type === selectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedType, searchQuery]);

  // Get unique types
  const types = ["all", ...new Set(products.map((p) => p.type))];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Paket Pembelajaran"
        description="Pilih berbagai paket tryout dan materi pembelajaran terbaik untuk persiapan ujian masuk PTN dan sekolah kedinasan."
      />
      <Navbar />

      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12">
            <h1 className="mb-4 text-4xl font-bold">Paket Pembelajaran</h1>
            <p className="text-lg text-muted-foreground">
              Pilih paket pembelajaran yang sesuai dengan kebutuhan belajarmu
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Cari Paket</label>
              <input
                type="text"
                placeholder="Cari paket pembelajaran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">Jenis Paket</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type === "all"
                      ? "Semua Paket"
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <p className="text-muted-foreground">Loading packages...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const packageInfo = product.packages?.[0] || product.package;
                const typeLabel = packageInfo?.type || product.type;
                const linkTo = user ? "/user/packages" : "/register";

                return (
                  <div
                    key={product.id}
                    className="flex flex-col rounded-2xl border-2 border-border bg-card p-6 transition-all duration-300 hover:border-primary hover:shadow-lg"
                  >
                    <div className="mb-6 flex-1">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex flex-1 flex-col">
                          <h3 className="text-xl font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {typeLabel}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {product.is_active && (
                            <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                              Aktif
                            </span>
                          )}
                          <ShareButton
                            title={`Paket ${product.name} - AlphaNext`}
                            text={`Cek paket belajar ${product.name} di AlphaNext!`}
                            url={`${window.location.origin}/packages?id=${product.id}`}
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <span className="text-4xl font-bold">
                          Rp {product.price.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                          <span className="text-sm">
                            {product.packages
                              ? `${product.packages.length} paket included`
                              : "Single package"}
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
                    </div>

                    <Button className="mt-6 w-full" asChild>
                      <Link to={linkTo}>
                        {user ? "Beli Sekarang" : "Daftar & Beli"}
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || selectedType !== "all"
                  ? "Tidak ada paket yang sesuai dengan filter"
                  : "Tidak ada paket tersedia saat ini"}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
