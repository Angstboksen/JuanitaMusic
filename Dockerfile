# create dockerfile for npm project
FROM node:latest

RUN apt-get update && \
    apt-get install -y openjdk-11-jdk ca-certificates-java && \
    apt-get clean && \
    update-ca-certificates -f
ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64/
RUN export JAVA_HOME

RUN apt-get install ffmpeg

WORKDIR /app

COPY . ./

RUN npm install
RUN npm run generate-all

CMD [ "npm", "start" ]
