-- Jalankan di Supabase SQL Editor
-- Pastikan extension untuk UUID tersedia (gen_random_uuid).
-- Supabase project umumnya sudah menyediakan fungsi gen_random_uuid().

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

alter table public.items enable row level security;

-- Karena kita memakai SERVICE ROLE KEY di server (Vercel), policy ketat tidak wajib.
-- Namun untuk keamanan dasar, kita izinkan semua operasi untuk service role saja.
-- (Service role akan bypass RLS). Jika ingin akses via anon key, tambahkan policy sesuai kebutuhan.
