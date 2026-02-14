# Railway Deployment Guide

## Persiapan

Pastikan Anda sudah:
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login ke Railway: `railway login`

## Langkah Deploy

### 1. Inisialisasi Project
```bash
railway init
```
Pilih "Empty Project" karena kita sudah punya Dockerfile.

### 2. Setup Environment Variables
Di Railway Dashboard, masukkan variabel environment:

```
VITE_APP_NAME=AlphaNext
VITE_API_BASE_URL=<URL_BACKEND_ANDA>
VITE_APP_TAGLINE=AlphaNext Learning Platform
```

**Catatan Penting**: Environment variables akan di-inject **saat container running** (bukan saat build). Setiap kali ubah env di Railway:
1. Railway akan otomatis restart container
2. Script `generate-env.sh` akan generate `env-config.js` dengan nilai baru
3. Refresh browser untuk lihat perubahan

**Untuk development** (API pakai tunnel):
- Gunakan tunnel URL (ngrok/cloudflared)
- Contoh: `VITE_API_BASE_URL=https://abc123.ngrok.io`

**Untuk production**:
- Ganti dengan URL production API Anda

### 3. Deploy
```bash
railway up
```

### 4. Buka URL
```bash
railway open
```

## Cara Update Deployment

### Update Kode:
```bash
railway up
```

### Update Environment Variables:
1. Ubah di Railway Dashboard
2. Railway akan auto-restart container
3. Env config akan di-regenerate otomatis

## Cara Kerja Environment Injection

1. **Build time**: Vite build static files (tanpa embed API URL)
2. **Container start**: `generate-env.sh` membaca Railway env vars
3. **Runtime**: Browser load `env-config.js` yang berisi API URL
4. **App init**: App menggunakan nilai dari `window.__env__`

## Troubleshooting

### Build Gagal
- Pastikan `npm install` berhasil
- Cek log: `railway logs`

### API Tidak Terhubung
- Buka browser DevTools → Network tab
- Cek apakah `env-config.js` ter-load dengan benar
- Cek nilai `VITE_API_BASE_URL` di Railway dashboard
- Refresh halaman setelah ubah env

### Port Error
- Pastikan Dockerfile EXPOSE 8080
- Railway akan otomatis detect PORT dari nginx

## Struktur File

```
alphanext_fe/
├── Dockerfile            # Multi-stage build + runtime env injection
├── nginx.conf            # Nginx configuration
├── railway.json          # Railway config
├── generate-env.sh       # Script untuk generate env-config.js saat runtime
├── .dockerignore         # Exclude files dari Docker build
└── .env.example          # Template environment variables
```

## Notes

- App ini menggunakan static build dengan nginx
- Semua route akan di-handle oleh React Router (SPA)
- Static assets di-cache untuk performance
- Health check tersedia di `/health`
- Environment variables support runtime injection (ubah di Railway dashboard tanpa rebuild)

