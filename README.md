# ShoeWash API — REST API Cuci Sepatu (Express + Supabase + Vercel)

API sederhana untuk mengelola **daftar barang cuci sepatu** dengan operasi **CRUD** dan **filter status** (`GET /items?status=Selesai`).  
Dibangun dengan **Node.js + Express.js**, menyimpan data di **Supabase (Postgres)**, dan **siap deploy ke Vercel**.

---

## 🎯 Tujuan & Fitur Utama
- CRUD data item cucian sepatu: `POST/GET/PATCH/DELETE /items`
- Filter status: `GET /items?status=Menunggu|Proses|Selesai|Batal`
- Validasi status case-insensitive (misal `selesai` → `Selesai`)
- Siap dipakai di production (serverless) via **Vercel**

## 🧱 Struktur Data (Tabel `items`)
Kolom penting:
- `id` (uuid, primary key, default `gen_random_uuid()`)
- `customer_name` (text, required)
- `brand` (text, optional)
- `size` (text, optional)
- `service_type` (text, required)
- `status` (text enum: `Menunggu|Proses|Selesai|Batal`, default `Menunggu`)
- `checkin_date` (timestamptz, default `now()`)
- `promised_date` (date, optional)
- `price` (integer, optional)
- `note` (text, optional)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

SQL skema tersedia di [`supabase.sql`](./supabase.sql).

## 📦 Struktur Project
```
shoewash-api/
├─ api/
│  └─ index.js           # Entry untuk Vercel Serverless (wrap Express)
├─ src/
│  ├─ app.js             # Definisi Express app + routes
│  ├─ server.js          # Menjalankan secara lokal
│  └─ supabase.js        # Supabase client
├─ .env.example
├─ package.json
├─ supabase.sql
└─ vercel.json
```

## 🚀 Endpoints

### Healthcheck
`GET /health`
```json
{ "ok": true, "uptime": 12.34 }
```

### Create Item
`POST /items`
```json
{
  "customer_name": "Budi",
  "brand": "Nike",
  "size": "42",
  "service_type": "Deep Clean",
  "status": "Menunggu",
  "promised_date": "2025-10-30",
  "price": 60000,
  "note": "Ada noda di ujung"
}
```
**Response 201**
```json
{
  "id": "uuid-...",
  "customer_name": "Budi",
  "brand": "Nike",
  "size": "42",
  "service_type": "Deep Clean",
  "status": "Menunggu",
  "checkin_date": "2025-10-22T10:00:00.000Z",
  "promised_date": "2025-10-30",
  "price": 60000,
  "note": "Ada noda di ujung",
  "created_at": "...",
  "updated_at": "..."
}
```

### List Items (dengan filter opsional)
`GET /items?status=Selesai`
- `status` valid: `Menunggu|Proses|Selesai|Batal` (case-insensitive)

**Response 200**
```json
[
  {
    "id": "uuid-...",
    "customer_name": "Budi",
    "service_type": "Deep Clean",
    "status": "Selesai",
    "created_at": "...",
    "updated_at": "..."
  }
]
```

### Get Detail Item
`GET /items/:id`

### Update Item (partial)
`PATCH /items/:id`
```json
{ "status": "Selesai", "price": 75000 }
```

### Delete Item
`DELETE /items/:id`

---

## 🛠️ Cara Instalasi & Menjalankan Lokal

1) **Clone & Install**
```bash
git clone https://github.com/<username>/shoewash-api.git
cd shoewash-api
npm install
```

2) **Buat Project Supabase**
- Buat project di https://supabase.com/
- Buka **SQL Editor** dan jalankan isi file [`supabase.sql`](./supabase.sql)
- Salin **Project URL** dan **Service Role Key** dari **Settings → API**

3) **Konfigurasi Environment**
- Duplikat `.env.example` jadi `.env` lalu isi:
  ```env
  SUPABASE_URL=...
  SUPABASE_SERVICE_ROLE_KEY=...
  CORS_ORIGIN=http://localhost:3000
  ```

4) **Jalankan lokal**
```bash
npm run dev
# API: http://localhost:3000
```

---

## ☁️ Deploy ke Vercel (paling mudah)

**Opsi A — 1 Klik dari GitHub (disarankan)**
1. Upload repo ke GitHub (atau gunakan tombol “Import” di Vercel).
2. Di Vercel, buat Project dari repo ini.
3. Tambahkan **Environment Variables** (Project Settings → Environment Variables):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - (opsional) `CORS_ORIGIN`
4. Deploy.  
   Vercel otomatis menggunakan `api/index.js` sebagai serverless function dan `vercel.json` sudah me-*route* `/(.*)` ke sana sehingga endpoint menjadi:
   - `GET https://<project>.vercel.app/health`
   - `GET https://<project>.vercel.app/items`
   - dst.

**Opsi B — Vercel CLI**
```bash
npm i -g vercel
vercel
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add CORS_ORIGIN
vercel deploy --prod
```

---

## 🔒 Catatan Keamanan
- **Jangan** commit `.env`.
- Gunakan **Service Role Key** hanya di server (Vercel), **jangan** di front-end/public.
- Anda bisa menambah policy RLS agar akses read via anon key juga aman (opsional).

---

## 🔗 Link
- **Repository GitHub:** (isi setelah Anda upload)
- **Link Deploy (Vercel):** (isi setelah deploy; contoh `https://shoewash-api.vercel.app`)

---

## 🧪 Contoh cURL

**Create**
```bash
curl -X POST https://<project>.vercel.app/items     -H "Content-Type: application/json"     -d '{"customer_name":"Budi","service_type":"Deep Clean","status":"Menunggu"}'
```

**List dengan filter status**
```bash
curl "https://<project>.vercel.app/items?status=Selesai"
```

**Update status**
```bash
curl -X PATCH https://<project>.vercel.app/items/<id>     -H "Content-Type: application/json"     -d '{"status":"Selesai"}'
```

**Delete**
```bash
curl -X DELETE https://<project>.vercel.app/items/<id>
```

---

## ✅ Tips Troubleshooting
- **500 error Supabase**: cek env `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY` di Vercel.
- **CORS**: set `CORS_ORIGIN` ke domain front-end Anda.
- **UUID default** error: ganti default `gen_random_uuid()` ke `uuid_generate_v4()` lalu enable extension `uuid-ossp` jika perlu.
