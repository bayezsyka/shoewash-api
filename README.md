# REST API Daftar Barang Cuci Sepatu

## Deskripsi Umum

Proyek ini adalah tugas responsi pembuatan REST API menggunakan **Node.js** dan **Express.js** untuk mengelola data sepatu yang sedang dicuci. Data disimpan di **Supabase (Postgres)** dan layanan siap **dideploy ke Vercel**.

> **Output yang diunggah**
>
> 1. 📦 Link GitHub Repository
> 2. 🌐 Link Deploy (Vercel)

---

## Tujuan

1. Mengimplementasikan **CRUD** (Create, Read, Update, Delete) pada REST API.
2. Mempraktikkan penggunaan **Express.js** sebagai backend.
3. Mengelola data di **Supabase** dengan request/response **JSON**.
4. Membangun API yang relevan untuk kebutuhan bisnis nyata (filter status, dsb.).

---

## Teknologi

* **Node.js** — runtime server.
* **Express.js** — framework REST API.
* **Supabase (Postgres)** — basis data.
* **Vercel** — hosting serverless.

---

## Fitur Utama API

| Metode | Endpoint         | Deskripsi                                                        |
| :----: | ---------------- | ---------------------------------------------------------------- |
|   GET  | `/health`        | Cek status layanan.                                              |
|   GET  | `/items`         | Menampilkan seluruh daftar sepatu.                               |
|   GET  | `/items/:id`     | Menampilkan detail sepatu berdasarkan ID.                        |
|   GET  | `/items?status=` | **Filter** berdasarkan status (`Menunggu/Proses/Selesai/Batal`). |
|  POST  | `/items`         | Menambahkan data sepatu baru.                                    |
|  PATCH | `/items/:id`     | Memperbarui sebagian field (misal ubah status ke `Selesai`).     |
| DELETE | `/items/:id`     | Menghapus data sepatu.                                           |

> **Status valid:** `Menunggu`, `Proses`, `Selesai`, `Batal` (API menerima case-insensitive).

---

## Struktur Data

Contoh objek item (tabel `items`):

```json
{
  "id": "e0f3c8c0-7a7f-4b39-9b9a-2d8a6f3f4b1e",
  "customer_name": "Budi",
  "brand": "Nike",
  "size": "42",
  "service_type": "Deep Clean",
  "status": "Menunggu",
  "checkin_date": "2025-10-23T08:12:00.000Z",
  "promised_date": "2025-10-30",
  "price": 60000,
  "note": "Ada noda di ujung",
  "created_at": "2025-10-23T08:12:00.000Z",
  "updated_at": "2025-10-23T08:12:00.000Z"
}
```

**Keterangan kolom utama**: `id (uuid)`, `customer_name`, `brand`, `size`, `service_type`, `status`, `checkin_date`, `promised_date`, `price`, `note`, `created_at`, `updated_at`.

**Skema SQL (Supabase → SQL Editor)**

```sql
-- supabase.sql
create extension if not exists pgcrypto; -- untuk gen_random_uuid()

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  brand text,
  size text,
  service_type text not null,
  status text not null default 'Menunggu' check (status in ('Menunggu','Proses','Selesai','Batal')),
  checkin_date timestamptz not null default now(),
  promised_date date,
  price integer,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.items enable row level security; -- service role bypass RLS
```

> Jika `gen_random_uuid()` tidak tersedia:

```sql
create extension if not exists "uuid-ossp";
alter table public.items alter column id set default uuid_generate_v4();
```

---

## Dokumentasi Endpoint

### 1) Health Check

**Request**

```
GET /health
```

**Response 200**

```json
{ "ok": true, "uptime": 12.34 }
```

---

### 2) Create Item

**Request**

```
POST /items
Content-Type: application/json
```

**Body**

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

**Response 201 (ringkas)**

```json
{
  "id": "...",
  "customer_name": "Budi",
  "service_type": "Deep Clean",
  "status": "Menunggu",
  "checkin_date": "2025-10-23T08:12:00.000Z",
  "promised_date": "2025-10-30",
  "price": 60000,
  "note": "Ada noda di ujung",
  "created_at": "...",
  "updated_at": "..."
}
```

**Error**

* `400` — field wajib kosong / `status` tidak valid.
* `500` — kesalahan server/konfigurasi Supabase.

---

### 3) List Items (+ Filter)

**Semua data**

```
GET /items
```

**Filter status**

```
GET /items?status=Selesai
```

**Response 200 (contoh)**

```json
[
  {
    "id": "...",
    "customer_name": "Sari",
    "service_type": "Fast Clean",
    "status": "Selesai",
    "created_at": "...",
    "updated_at": "..."
  }
]
```

**Error**

* `400` — nilai `status` tidak valid.

---

### 4) Get Item by ID

**Request**

```
GET /items/:id
```

**Response 200**

```json
{
  "id": "...",
  "customer_name": "Budi",
  "service_type": "Deep Clean",
  "status": "Menunggu",
  "price": 60000,
  "created_at": "...",
  "updated_at": "..."
}
```

**Error**

* `404` — item tidak ditemukan.

---

### 5) Update Item (Partial)

**Request**

```
PATCH /items/:id
Content-Type: application/json
```

**Body**

```json
{ "status": "Selesai", "price": 75000 }
```

**Response 200**

```json
{ "id": "...", "status": "Selesai", "price": 75000, "updated_at": "..." }
```

**Error**

* `400` — `status` tidak valid.
* `404` — item tidak ditemukan.

---

### 6) Delete Item

**Request**

```
DELETE /items/:id
```

**Response 200**

```json
{ "deleted": true, "item": { "id": "..." } }
```

**Error**

* `404` — item tidak ditemukan.

---

## Instalasi & Menjalankan

### 1) Clone & Install

```bash
git clone https://github.com/<username>/shoewash-api.git
cd shoewash-api
npm install
```

### 2) Buat Tabel di Supabase

Jalankan SQL pada bagian **Skema Data** di atas (menu **SQL Editor** Supabase).

### 3) Konfigurasi Environment

Buat file `.env` di root proyek:

```env
SUPABASE_URL=https://xxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

### 4) Jalankan Lokal

```bash
npm run dev
# http://localhost:3000/health
```

---

## Deploy ke Vercel

1. Push ke GitHub → Import Project di **Vercel**.
2. Tambahkan **Environment Variables**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, (opsional) `CORS_ORIGIN`.
3. Deploy.

**File penting**

`api/index.js`

```js
// Ekspor Express app sebagai handler Vercel
const app = require('../src/app');
module.exports = app; // atau: (req, res) => app(req, res)
```

`vercel.json`

```json
{
  "version": 2,
  "builds": [{ "src": "api/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/api/index.js" }]
}
```

---

## Pengujian Cepat

**Postman**

* Import koleksi uji (atau buat request manual).
* Base URL produksi: `https://<project>.vercel.app` (atau `http://localhost:3000` saat lokal).

**Contoh cURL**

```bash
# Create
curl -X POST https://<project>.vercel.app/items \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Budi","service_type":"Deep Clean","status":"Menunggu"}'

# List
curl "https://<project>.vercel.app/items"

# Filter status
curl "https://<project>.vercel.app/items?status=Selesai"

# Update parsial
curl -X PATCH https://<project>.vercel.app/items/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"Selesai","price":75000}'

# Delete
curl -X DELETE https://<project>.vercel.app/items/
```
