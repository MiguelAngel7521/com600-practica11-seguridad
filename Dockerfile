FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY src ./src
ENV NODE_ENV=production HOST=0.0.0.0
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
