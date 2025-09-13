// server.js
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // sirve index.html y assets

// Inicializar DB (archivo local)
const db = new sqlite3.Database('./data.db', (err) => {
  if (err) return console.error('DB error:', err.message);
  console.log('Conectado a SQLite.');
});

// Crear tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS registros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL,
      mensaje TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Ruta POST para recibir datos del formulario
app.post('/api/registros', (req, res) => {
  const { nombre, email, mensaje } = req.body || {};
  // validación básica
  if (!nombre || !email) {
    return res.status(400).json({ ok: false, error: 'nombre y email son obligatorios' });
  }

  const stmt = db.prepare(`INSERT INTO registros (nombre, email, mensaje) VALUES (?, ?, ?)`);
  stmt.run(nombre, email, mensaje || null, function(err) {
    if (err) {
      console.error('Insert error:', err.message);
      return res.status(500).json({ ok: false, error: 'Error al guardar' });
    }
    res.json({ ok: true, id: this.lastID });
  });
  stmt.finalize();
});

// Ruta GET para listar registros (útil para el front-end)
app.get('/api/registros', (req, res) => {
  db.all(`SELECT id, nombre, email, mensaje, created_at FROM registros ORDER BY id DESC LIMIT 100`, [], (err, rows) => {
    if (err) {
      console.error('Select error:', err.message);
      return res.status(500).json({ ok: false, error: 'Error al leer registros' });
    }
    res.json({ ok: true, registros: rows });
  });
});

// Iniciar servidor aunar
app.listen(PORT, () => {
  console.log(`Servidor aunar 2025 II corriendo en http://localhost:${PORT}`);
});
