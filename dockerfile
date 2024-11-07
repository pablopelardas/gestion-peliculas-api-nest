FROM node:18

WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json

RUN npm install

COPY . /usr/src/app

RUN npm run build

CMD ["npm", "start", "start:prod"]
