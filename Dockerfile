# Multi-Stage Build für optimale Image-Größe

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Kopiere package files
COPY package*.json ./
COPY tsconfig*.json ./

# Installiere Dependencies
RUN npm ci

# Kopiere Source Code
COPY . .

# Build Server und Client
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Installiere nur Production Dependencies
COPY package*.json ./
RUN npm ci --only=production

# Kopiere gebaute Files vom Builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Erstelle Log-Verzeichnis
RUN mkdir -p /app/logs

# Exponiere Port
EXPOSE 5000

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Starte Server
CMD ["npm", "run", "start"]

