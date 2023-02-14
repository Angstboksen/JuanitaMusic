# create dockerfile for npm project
FROM node:latest

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm install
RUN npm run generate-all

COPY . /usr/src/app

CMD [ "npm", "start" ]
