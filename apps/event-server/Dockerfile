FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build event-server

CMD ["node", "dist/apps/event-server/main"]
