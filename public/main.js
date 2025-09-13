// public/main.js
const form = document.getElementById('contactForm');
const statusDiv = document.getElementById('status');
const lista = document.getElementById('listaRegistros');
const refreshBtn = document.getElementById('refreshBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusDiv.textContent = 'Enviando...';

  const payload = {
    nombre: document.getElementById('nombre').value.trim(),
    email: document.getElementById('email').value.trim(),
    mensaje: document.getElementById('mensaje').value.trim()
  };

  try {
    const resp = await fetch('/api/registros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Error desconocido');
    statusDiv.textContent = `Guardado con id ${data.id}`;
    form.reset();
    cargarRegistros();
  } catch (err) {
    statusDiv.textContent = 'Error: ' + err.message;
  }
});

refreshBtn.addEventListener('click', cargarRegistros);

async function cargarRegistros() {
  lista.innerHTML = 'Cargando...';
  try {
    const resp = await fetch('/api/registros');
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Error al obtener registros');
    lista.innerHTML = '';
    if (data.registros.length === 0) {
      lista.innerHTML = '<li>No hay registros</li>';
      return;
    }
    data.registros.forEach(r => {
      const li = document.createElement('li');
      li.textContent = `${r.id} — ${r.nombre} (${r.email}) — ${r.mensaje || '-'} — ${r.created_at}`;
      lista.appendChild(li);
    });
  } catch (err) {
    lista.innerHTML = '<li>Error: ' + err.message + '</li>';
  }
}

// cargar al inicio
cargarRegistros();
