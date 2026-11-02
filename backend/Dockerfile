FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm install --global pm2
COPY --from=build /app/dist ./dist
COPY ecosystem.config.cjs ./ecosystem.config.cjs
EXPOSE 3000
CMD ["pm2-runtime", "ecosystem.config.cjs"]
