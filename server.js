// Servidor MAVERIX - Mensajes Masivos
// Node puro, sin dependencias. Sirve la pagina, recibe y guarda las opiniones.
//
// Variables de entorno (configurar en EasyPanel):
//   PORT       -> puerto (default 3000)
//   DATA_DIR   -> carpeta persistente para los datos (default /data) -> montar un VOLUMEN aca
//   ADMIN_KEY  -> clave para entrar al /admin (CAMBIAR si o si)

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || '/data';
const ADMIN_KEY = process.env.ADMIN_KEY || 'cambiar-esta-clave';
const DATA_FILE = path.join(DATA_DIR, 'feedback.jsonl');
const PUBLIC = __dirname;

// Asegurar carpeta de datos
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {
    console.error('No se pudo crear DATA_DIR:', e.message);
}

function sendJSON(res, status, obj) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(obj));
}

function serveFile(res, file, type) {
    fs.readFile(path.join(PUBLIC, file), (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': type + '; charset=utf-8' });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
    const pathname = url.pathname;

    // ---- Guardar una opinion ----
    if (req.method === 'POST' && pathname === '/api/feedback') {
        let body = '';
        req.on('data', c => { body += c; if (body.length > 100000) req.destroy(); });
        req.on('end', () => {
            let data;
            try { data = JSON.parse(body); } catch (e) { return sendJSON(res, 400, { error: 'JSON invalido' }); }
            const rating = parseInt(data.rating, 10);
            if (!(rating >= 1 && rating <= 5)) return sendJSON(res, 400, { error: 'rating invalido' });
            const text = String(data.text || '').slice(0, 2000);
            const entry = { ts: new Date().toISOString(), rating: rating, text: text };
            fs.appendFile(DATA_FILE, JSON.stringify(entry) + '\n', err => {
                if (err) { console.error('Error guardando:', err.message); return sendJSON(res, 500, { error: 'no se pudo guardar' }); }
                sendJSON(res, 200, { ok: true });
            });
        });
        return;
    }

    // ---- Leer opiniones (solo con clave) ----
    if (req.method === 'GET' && pathname === '/api/feedback') {
        if (url.searchParams.get('key') !== ADMIN_KEY) return sendJSON(res, 401, { error: 'no autorizado' });
        fs.readFile(DATA_FILE, 'utf8', (err, content) => {
            if (err) return sendJSON(res, 200, { responses: [] }); // todavia no hay archivo
            const responses = content.split('\n').filter(Boolean).map(l => {
                try { return JSON.parse(l); } catch (e) { return null; }
            }).filter(Boolean);
            sendJSON(res, 200, { responses: responses });
        });
        return;
    }

    // ---- Paginas ----
    if (pathname === '/' || pathname === '/index.html') return serveFile(res, 'index.html', 'text/html');
    if (pathname === '/admin' || pathname === '/admin.html') return serveFile(res, 'admin.html', 'text/html');

    res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
    console.log('MAVERIX server escuchando en puerto ' + PORT);
    console.log('Datos en: ' + DATA_FILE);
    if (ADMIN_KEY === 'cambiar-esta-clave') console.warn('!! ADMIN_KEY por defecto: cambiala en las env vars !!');
});
