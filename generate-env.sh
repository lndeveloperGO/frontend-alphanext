#!/bin/bash

# Generate env-config.js from environment variables
# This script is run at container startup to inject Railway env vars

ENV_FILE="/usr/share/nginx/html/env-config.js"

# Get values from environment variables with defaults
API_URL="${VITE_API_BASE_URL:-}"
APP_NAME="${VITE_APP_NAME:-AlphaNext}"
APP_TAGLINE="${VITE_APP_TAGLINE:-AlphaNext Learning Platform}"

# Generate JavaScript file with environment variables
cat > "$ENV_FILE" << EOF
// Runtime environment configuration
// Auto-generated from Railway environment variables
window.__env__ = {
  VITE_APP_NAME: "${APP_NAME}",
  VITE_API_BASE_URL: "${API_URL}",
  VITE_APP_TAGLINE: "${APP_TAGLINE}"
};
EOF

echo "Generated env-config.js with API_URL: ${API_URL}"

