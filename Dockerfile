FROM node:16.12-alpine3.14

WORKDIR /app
COPY package*.json ./
COPY js ./js
COPY ui ./ui

RUN npm ci

EXPOSE 8080
ENTRYPOINT [ "npm"]
CMD [ "start" ]