# Estágio 1: Build do Frontend com Vite
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Estágio 2: Servidor Node Express de Produção
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3070

# Instala ffmpeg para processamento e suporte a mídias
RUN apk add --no-cache ffmpeg

COPY package*.json ./
RUN npm install --omit=dev

COPY server ./server
COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/server/data /app/server/uploads

EXPOSE 3070

VOLUME ["/app/server/data", "/app/server/uploads"]

CMD ["node", "server/server.js"]
