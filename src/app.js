const express = require('express');
const cors = require('cors');
require('dotenv').config(); // load .env in local dev
const { supabase } = require('./supabase');

const app = express();

// CORS
const corsOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
app.use(cors({ origin: corsOrigins.length ? corsOrigins : '*' }));

app.use(express.json());

// Utilities
const VALID_STATUSES = ['Menunggu', 'Proses', 'Selesai', 'Batal'];
const normalizeStatus = (s) => {
  if (!s || typeof s !== 'string') return null;
  const low = s.trim().toLowerCase();
  const found = VALID_STATUSES.find(v => v.toLowerCase() === low);
  return found || null;
};

app.get('/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

// Create
app.post('/items', async (req, res) => {
  try {
    const {
      customer_name,
      brand,
      size,
      service_type,
      status,
      checkin_date,
      promised_date,
      price,
      note
    } = req.body || {};

    if (!customer_name || !service_type) {
      return res.status(400).json({ error: 'customer_name dan service_type wajib diisi' });
    }

    let statusValue = 'Menunggu';
    if (status) {
      const norm = normalizeStatus(status);
      if (!norm) return res.status(400).json({ error: `status tidak valid. Pilihan: ${VALID_STATUSES.join(', ')}` });
      statusValue = norm;
    }

    const payload = {
      customer_name,
      brand: brand || null,
      size: size || null,
      service_type,
      status: statusValue,
      checkin_date: checkin_date || new Date().toISOString(),
      promised_date: promised_date || null,
      price: typeof price === 'number' ? price : null,
      note: note || null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('items')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'internal error' });
  }
});

// Read many with optional filter
app.get('/items', async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase.from('items').select('*').order('created_at', { ascending: false });

    if (status) {
      const norm = normalizeStatus(status);
      if (!norm) return res.status(400).json({ error: `status tidak valid. Pilihan: ${VALID_STATUSES.join(', ')}` });
      query = query.eq('status', norm);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'internal error' });
  }
});

// Read one
app.get('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { data, error } = await supabase.from('items').select('*').eq('id', id).single();
    if (error && error.code === 'PGRST116') return res.status(404).json({ error: 'Item tidak ditemukan' });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'internal error' });
  }
});

// Update (partial)
app.patch('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = { ...req.body };
    if (updates.status) {
      const norm = normalizeStatus(updates.status);
      if (!norm) return res.status(400).json({ error: `status tidak valid. Pilihan: ${VALID_STATUSES.join(', ')}` });
      updates.status = norm;
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code === 'PGRST116') return res.status(404).json({ error: 'Item tidak ditemukan' });
    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'internal error' });
  }
});

// Delete
app.delete('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { data, error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error && error.code === 'PGRST116') return res.status(404).json({ error: 'Item tidak ditemukan' });
    if (error) return res.status(500).json({ error: error.message });

    res.json({ deleted: true, item: data });
  } catch (err) {
    res.status(500).json({ error: err.message || 'internal error' });
  }
});

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = app;
