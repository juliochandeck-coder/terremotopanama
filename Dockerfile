FROM node:20-alpine
WORKDIR /app
COPY server.js index.html ./
CMD ["node","server.js"]
