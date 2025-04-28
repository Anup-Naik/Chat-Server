FROM node:lts-slim

WORKDIR /chat

COPY package*.json ./

RUN npm ci --opt-dev

COPY dist/ ./

USER node

ENV PORT=5000
ENV MONGO_URL=mongodb://host.docker.internal:27017/Chat

EXPOSE 5000

CMD ["node", "server.js"]