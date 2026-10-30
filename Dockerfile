FROM node:22-alpine AS dependencias
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

# Runtime sin npm/yarn ni herramientas de desarrollo.
FROM alpine:3.24
RUN apk add --no-cache libstdc++ && apk upgrade --no-cache
COPY --from=dependencias /usr/local/bin/node /usr/local/bin/node
WORKDIR /app
COPY --from=dependencias /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
ENV NODE_ENV=production HOST=0.0.0.0
USER 1000:1000
EXPOSE 3000
CMD ["node", "src/server.js"]
