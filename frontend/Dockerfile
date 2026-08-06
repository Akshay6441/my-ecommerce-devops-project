# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (leverages layer cache)
COPY package.json ./
RUN npm install --prefer-offline 2>&1 | tail -5

# Copy source and build
COPY . .

ARG REACT_APP_BACKEND_URL_ARG=http://localhost:80
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL_ARG}

RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
