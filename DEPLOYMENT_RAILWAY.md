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

**Catatan Penting**: Karena API masih dalam development (pakai tunnel):
- Untuk testing lokal: Gunakan tunnel URL dari backend (misalnya ngrok, cloudflared, atau Railway tunnel)
- Untuk production: Ganti dengan URL production backend Anda

### 3. Deploy
```bash
railway up
```

### 4. Buka URL
```bash
railway open
```

## Cara Update Deployment

Setiap kali ada perubahan code:
```bash
railway up
```

## Troubleshooting

### Build Gagal
- Pastikan `bun install` berhasil
- Cek log: `railway logs`

### API Tidak Terhubung
- Pastikan `VITE_API_BASE_URL` sudah benar di Railway dashboard
- Untuk development, gunakan tunnel URL (ngrok/cloudflared)

### Port Error
- Pastikan Dockerfile EXPOSE 8080
- Railway akan otomatis mendeteksi PORT dari nginx

## Struktur File

```
alphanext_fe/
├── Dockerfile          # Multi-stage build (builder + nginx)
├── nginx.conf          # Nginx configuration
├── railway.json        # Railway config
├── .dockerignore       # Exclude files dari Docker build
└── .env.example        # Template environment variables
```

## Notes

- App ini menggunakan static build dengan nginx
- Semua route akan di-handle oleh React Router (SPA)
- Static assets di-cache untuk performance
- Health check tersedia di `/health`

