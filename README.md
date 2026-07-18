# Creador-Mensajes - MAVERIX

App web para generar CSV de mensajes masivos a partir de un "Informe de Cuentas.csv".
Al abrir la página pide el **usuario del ejecutivo** (autocompletado sobre una lista fija en `index.html`); ese nombre queda registrado en cada ingreso, cada descarga y en la calificación de la encuesta. Incluye una encuesta de opinión **obligatoria antes de la primera descarga**, y un panel `/admin` para ver quién usa la página y las respuestas.

**En vivo:** https://creador.fidelizador.online (panel en `/admin`) — dominio propio en Hostinger; el viejo `*.easypanel.host` fue borrado y da 404.

> ⚠️ Esta app **necesita el backend** (`server.js`) para guardar las opiniones. NO usar GitHub Pages (es estático y la encuesta no guarda). Pages quedó desactivado a propósito.

## Estructura

- `index.html` — la app (subir CSV, armar mensaje, exportar) + modal de encuesta + tutorial "¿cómo funciona?" (links en tagline y footer).
- `admin.html` — panel `/admin` para ver las opiniones (protegido por clave).
- `server.js` — backend Node puro (sin dependencias): sirve las páginas y guarda/lee las opiniones. Rate limit y healthcheck incluidos.
- `Dockerfile` — para deploy en EasyPanel.

## Flujo de uso

1. **Al abrir la página**: modal "Escribe tu Ejecutivo" con autocompletado sobre la lista fija (const `EJECUTIVOS` en `index.html`, 215 usuarios). Solo deja continuar con un nombre de la lista; queda en `localStorage` (`maverix_user`) y registra un evento `login`.
2. La persona procesa su CSV y aprieta "descargar csv".
3. **Encuesta (una vez por ejecutivo)**: si ese ejecutivo nunca calificó, aparece el modal con estrellas + **comentario obligatorio** (mín. 3 letras). Sin salida: se contesta o no se descarga. Se guarda con el nombre del ejecutivo.
4. **Modal de donación (en cada descarga)**: "MAVERIX es GRATIS — mantenerlo, NO" + alias `palta.camote.mp` (click = copiar). Botón "descargar" baja el archivo; "cancelar" (chiquito) cierra sin descargar.
5. El CSV se descarga como **`Maverix - mensaje AAAA-MM-DD.csv`** y registra un evento `download` con la cantidad de filas.
6. En `/admin` (con clave): stats, tabla "quién usa la página" (click en una fila = detalle de cada ingreso/descarga con fecha-hora + sus calificaciones y comentarios) y lista completa de opiniones con `@usuario`.

## Endpoints

| Endpoint | Qué hace |
|----------|----------|
| `POST /api/feedback` | Guarda una opinión (`rating`, `text`, `user`). Rate limit: 5 cada 10 minutos por IP. Body máximo 10KB (413 si se pasa). |
| `GET /api/feedback?key=ADMIN_KEY` | Lee todas las opiniones (usado por `/admin`). |
| `POST /api/usage` | Registra un evento de uso: `{user, event: "login"\|"download", rows?}`. Se guarda en `DATA_DIR/usage.jsonl`. Rate limit: 120 cada 10 min por IP. |
| `GET /api/usage?key=ADMIN_KEY` | Lee todos los eventos de uso (usado por `/admin`). |
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
