# create dockerfile for npm project
FROM node:latest

WORKDIR /app

COPY . ./

RUN npm install
RUN npm run generate-all

CMD [ "npm", "start" ]
