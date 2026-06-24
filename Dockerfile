FROM node:22-alpine

WORKDIR /app
COPY . .

ENV PORT=8791
EXPOSE 8791

CMD ["node", "server.mjs"]
