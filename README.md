# Portofolio Abbas (Astro)

Portofolio statis berbasis [Astro](https://astro.build) — tanpa React/Framer Motion di browser. Animasi memakai CSS + skrip ringan (~3 KB).

## Perintah

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output ke folder dist/
npm run preview  # preview build produksi
```

## Struktur

- `src/pages/index.astro` — satu halaman scroll (Tentang → Proyek → Keahlian → Kontak)
- `src/components/ContactPanel.astro` — panel kontak (email + tombol GitHub, WhatsApp, Email)
- `src/data/profile.ts` — **edit semua data di sini** (proyek, pengalaman, foto & link bukti)
- `public/projects/` — simpan foto bukti proyek (contoh: `air-quality.jpg` → `image: '/projects/air-quality.jpg'`)
- `src/assets/udaera.jpg` — foto profil (dioptimasi WebP saat build)
- `public/` — file statis (favicon, og:image)

## Deploy

Upload isi folder `dist/` ke GitHub Pages, Netlify, atau hosting statis lainnya.
