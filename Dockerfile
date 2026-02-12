# Multi-stage build for Sections Gallery Shopify App

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend
FROM node:18-alpine
WORKDIR /app

# Install dependencies for backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Copy Prisma schema and generate client
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/build ./public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "server.js"]
