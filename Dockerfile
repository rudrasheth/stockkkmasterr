# Multi-stage Dockerfile to build frontend (Vite) and backend (TypeScript Node)

# --- Frontend build stage ---
FROM node:20-alpine AS frontend
WORKDIR /app

# Copy only necessary files for install
COPY src/package.json src/package-lock.json ./
RUN npm ci --prefer-offline --no-audit --progress=false

# Copy frontend sources and build
COPY src/ .
RUN npm run build

# --- Backend build stage ---
FROM node:20-alpine AS backend
WORKDIR /app

# Install backend deps
COPY src/api/package.json src/api/package-lock.json ./api/
RUN cd api && npm ci --prefer-offline --no-audit --progress=false

# Copy backend source
COPY src/api ./api

# Build backend (tsc) into api/dist
RUN cd api && npm run build

# Copy frontend dist into final image so server can serve it
COPY --from=frontend /app/dist /app/api/dist

EXPOSE 5000
ENV NODE_ENV=production
WORKDIR /app/api
CMD ["node", "dist/index.js"]
