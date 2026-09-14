# Imagen del servicio mqtt-bridge, para desplegar en Railway o Fly.io.
# Un "Dockerfile" es la receta de cómo montar el servidor donde corre
# este servicio: qué versión de Node, qué instalar y qué ejecutar.

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

CMD ["npm", "start"]
