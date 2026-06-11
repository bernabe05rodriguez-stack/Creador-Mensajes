# Creador-Mensajes - MAVERIX

App web para generar CSV de mensajes masivos a partir de un "Informe de Cuentas.csv".
Incluye una encuesta de opinión **obligatoria antes de la primera descarga**, y un panel `/admin` para ver las respuestas.

**En vivo:** https://creador-mensajes.bm6z1s.easypanel.host (panel en `/admin`)

> ⚠️ Esta app **necesita el backend** (`server.js`) para guardar las opiniones. NO usar GitHub Pages (es estático y la encuesta no guarda). Pages quedó desactivado a propósito.

## Estructura

- `index.html` — la app (subir CSV, armar mensaje, exportar) + modal de encuesta + tutorial "¿cómo funciona?" (links en tagline y footer).
- `admin.html` — panel `/admin` para ver las opiniones (protegido por clave).
- `server.js` — backend Node puro (sin dependencias): sirve las páginas y guarda/lee las opiniones. Rate limit y healthcheck incluidos.
- `Dockerfile` — para deploy en EasyPanel.

## Cómo funciona la encuesta

1. La persona usa la app y aprieta "descargar csv".
2. Si nunca contestó la encuesta, aparece el modal: puntaje 1-5 (estrellas) + "¿Qué mejorarías o qué le falta?" (texto opcional). **La descarga recién ocurre al enviarla** ("ahora no" la cancela).
3. Al enviar, el dato se guarda en el servidor (`POST /api/feedback`) y queda marcado en `localStorage` — las descargas siguientes son directas.
4. Vos entrás a `/admin`, ponés la clave y ves total, promedio, distribución y todas las respuestas (cada una con día y hora).

## Endpoints

| Endpoint | Qué hace |
|----------|----------|
| `POST /api/feedback` | Guarda una opinión. Rate limit: 5 cada 10 minutos por IP. Body máximo 10KB (413 si se pasa). |
| `GET /api/feedback?key=ADMIN_KEY` | Lee todas las opiniones (usado por `/admin`). |
| `GET /healthz` | Healthcheck, responde `{"ok":true}`. |

## Variables de entorno

| Variable    | Default              | Para qué |
|-------------|----------------------|----------|
| `PORT`      | `3000`               | Puerto del servidor |
| `DATA_DIR`  | `/data`              | Carpeta donde se guardan las opiniones. **Montar un volumen acá.** |
| `ADMIN_KEY` | `cambiar-esta-clave` | Clave para entrar al `/admin`. **Cambiala sí o sí.** |

## Deploy en EasyPanel

1. Crear una app (tipo **App** / desde GitHub o Dockerfile) apuntando a este repo.
2. En **Environment**: setear `ADMIN_KEY` con una clave propia.
3. En **Mounts / Volumes**: montar un volumen en `/data` para que las opiniones **persistan** entre redeploys (si no, se borran al reiniciar el contenedor).
4. Exponer el puerto `3000`.
5. Deploy. La app queda en el dominio asignado; el panel en `/admin`.

## Correr local

```bash
DATA_DIR=./data ADMIN_KEY=miclave PORT=3000 node server.js
# App:   http://localhost:3000
# Admin: http://localhost:3000/admin  (clave: miclave)
```
