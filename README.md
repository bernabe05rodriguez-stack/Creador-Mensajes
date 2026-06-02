# Mensajes Masivos - MAVERIX

App web para generar CSV de mensajes masivos a partir de un "Informe de Cuentas.csv".
Incluye una encuesta de opinión que se muestra tras descargar el archivo, y un panel `/admin` para ver las respuestas.

## Estructura

- `index.html` — la app (subir CSV, armar mensaje, exportar) + modal de encuesta.
- `admin.html` — panel `/admin` para ver las opiniones (protegido por clave).
- `server.js` — backend Node puro (sin dependencias): sirve las páginas y guarda/lee las opiniones.
- `Dockerfile` — para deploy en EasyPanel.

## Cómo funciona la encuesta

1. La persona usa la app y descarga el CSV.
2. Aparece un modal flotante: puntaje 1-5 (estrellas) + "¿Qué mejorarías o qué le falta?" (texto opcional).
3. Al enviar, el dato se guarda en el servidor (`POST /api/feedback`).
4. Vos entrás a `/admin`, ponés la clave y ves total, promedio, distribución y todas las respuestas.

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
