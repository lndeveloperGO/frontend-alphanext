FROM node:20-alpine AS builder

WORKDIR /app

# Install bun (fallback to npm if bun fails)
RUN npm install -g bun || true

# Copy package files
COPY package.json package-lock.json* ./

# Try bun install, fallback to npm
RUN if command -v bun &> /dev/null; then bun install; else npm install; fi

# Copy source code
COPY . .

# Build the application
RUN if command -v bun &> /dev/null; then bun run build; else npm run build; fi

# Production stage with nginx
FROM nginx:alpine

# Install bash and envsubst for template processing
RUN apk add --no-cache bash gettext

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script to generate env.js at runtime
COPY generate-env.sh /generate-env.sh
RUN chmod +x /generate-env.sh

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Generate env.js with runtime values
RUN /generate-env.sh

# Expose port
EXPOSE 8080

# Start nginx
CMD ["/bin/bash", "-c", "/generate-env.sh && nginx -g 'daemon off;'"]

