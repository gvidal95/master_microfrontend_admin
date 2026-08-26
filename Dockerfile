# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG ASSET_PREFIX=http://localhost:3002
ENV ASSET_PREFIX=$ASSET_PREFIX
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
