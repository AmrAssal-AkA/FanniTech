FROM node:25-alpine AS builder

WORKDIR /src

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

#----Production stage----
FROM node:25-alpine

WORKDIR /src

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /src/dist ./dist

CMD ["node", "dist/main.js"]