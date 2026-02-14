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

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

