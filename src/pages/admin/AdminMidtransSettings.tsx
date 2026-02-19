import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Save, RefreshCw, AlertCircle } from "lucide-react";
import { midtransService, MidtransSettings } from "@/lib/midtransService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminMidtransSettings() {
    const [settings, setSettings] = useState<MidtransSettings>({
        server_key: "",
        client_key: "",
        is_production: false,
        merchant_name: "AlphaNext",
        expiry_duration: 15,
        expiry_unit: "minutes",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await midtransService.getSettings();
            if (response.success) {
                setSettings(response.data);
            }
        } catch (error) {
            toast({
                title: "Kesalahan",
                description: error instanceof Error ? error.message : "Gagal mengambil data pengaturan",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await midtransService.updateSettings(settings);
            if (response.success) {
                toast({
                    title: "Berhasil",
                    description: "Pengaturan Midtrans berhasil diperbarui",
                });
            }
        } catch (error) {
            toast({
                title: "Kesalahan",
                description: error instanceof Error ? error.message : "Gagal memperbarui pengaturan",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout type="admin">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground text-sm">Memuat pengaturan...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout type="admin">
            <div className="space-y-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Pengaturan Midtrans</h1>
                            <p className="text-muted-foreground">Konfigurasi kunci API dan setelan pembayaran otomatis</p>
                        </div>
                    </div>
                    <Button onClick={fetchSettings} variant="outline" size="sm" disabled={saving}>
                        <RefreshCw className={cn("h-4 w-4 mr-2", saving && "animate-spin")} />
                        Segarkan
                    </Button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>API Credentials</CardTitle>
                            <CardDescription>
                                Masukkan kunci API dari dashboard Midtrans Anda (Settings {">"} Access Keys)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="server_key">Server Key</Label>
                                <Input
                                    id="server_key"
                                    type="password"
                                    placeholder="SB-Mid-server-..."
                                    value={settings.server_key}
                                    onChange={(e) => setSettings({ ...settings, server_key: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="client_key">Client Key</Label>
                                <Input
                                    id="client_key"
                                    placeholder="SB-Mid-client-..."
                                    value={settings.client_key}
                                    onChange={(e) => setSettings({ ...settings, client_key: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Mode Produksi</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Aktifkan jika Anda ingin menggunakan environment Production (LIVE). Matikan untuk Sandbox.
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.is_production}
                                    onCheckedChange={(checked) => setSettings({ ...settings, is_production: checked })}
                                />
                            </div>

                            {!settings.is_production && (
                                <Alert className="bg-yellow-50 border-yellow-200">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    <AlertTitle className="text-yellow-800">Mode Sandbox</AlertTitle>
                                    <AlertDescription className="text-yellow-700">
                                        Sistem saat ini menggunakan mode simulasi (Sandbox). Pembayaran tidak akan menggunakan uang sungguhan.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pengaturan Pesanan</CardTitle>
                            <CardDescription>
                                Konfigurasi tampilan dan batas waktu pembayaran
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="merchant_name">Nama Merchant</Label>
                                <Input
                                    id="merchant_name"
                                    placeholder="AlphaNext"
                                    value={settings.merchant_name}
                                    onChange={(e) => setSettings({ ...settings, merchant_name: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Muncul di halaman checkout Midtrans</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="expiry_duration">Durasi Kadaluarsa</Label>
                                    <Input
                                        id="expiry_duration"
                                        type="number"
                                        min="1"
                                        value={settings.expiry_duration}
                                        onChange={(e) => setSettings({ ...settings, expiry_duration: parseInt(e.target.value) || 1 })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="expiry_unit">Satuan Waktu</Label>
                                    <Select
                                        value={settings.expiry_unit}
                                        onValueChange={(value: any) => setSettings({ ...settings, expiry_unit: value })}
                                    >
                                        <SelectTrigger id="expiry_unit">
                                            <SelectValue placeholder="Pilih satuan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="minutes">Menit</SelectItem>
                                            <SelectItem value="hours">Jam</SelectItem>
                                            <SelectItem value="days">Hari</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Batas waktu bagi pengguna untuk menyelesaikan pembayaran sebelum order otomatis dibatalkan.</p>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" size="lg" disabled={saving}>
                            {saving ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

// Support function for cn
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
