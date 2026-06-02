# MAVERIX - Mensajes Masivos. Sin dependencias npm, imagen minima.
FROM node:20-alpine
WORKDIR /app
COPY server.js index.html admin.html ./
ENV PORT=3000 DATA_DIR=/data
EXPOSE 3000
CMD ["node", "server.js"]
