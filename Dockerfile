# =============================================================================
#  Dockerfile — Todo App (Node.js / Express / MongoDB)
#
#  Single-stage production build:
#    - Based on node:20-alpine (slim, secure)
#    - Installs only production dependencies
#    - Runs as a non-root user
#    - Includes health check for container orchestration
# =============================================================================

FROM node:20-alpine

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy dependency manifests first (leverage Docker layer caching)
COPY package.json package-lock.json ./

# Install ONLY production dependencies (no devDeps like eslint, jest)
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source code
COPY server.js ./
COPY routes/ ./routes/
COPY models/ ./models/
COPY public/ ./public/

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 3000

# Health check — verifies the server is responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/ || exit 1

# Start the application
CMD ["node", "server.js"]
