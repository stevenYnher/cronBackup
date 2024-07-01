FROM --platform=linux/arm64 node:current-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 3002

CMD ["node", "backup-script.js"]