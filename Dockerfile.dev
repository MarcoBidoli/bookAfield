FROM node:26

WORKDIR /usr/src/app

RUN npm install -g nodemon

COPY ./app/package*.json ./
RUN npm install

COPY ./app .

EXPOSE 3000

CMD ["node", "server.js"]