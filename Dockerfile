FROM node:20.18.0-slim
RUN npm install -g @nestjs/cli

WORKDIR /app

COPY . .
RUN npm install

CMD ["nest", "start"]