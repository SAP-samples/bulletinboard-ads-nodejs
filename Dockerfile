FROM node:10.18-alpine3.10

WORKDIR /app
COPY package*.json ./
COPY js ./js
COPY ui ./ui

RUN npm ci

EXPOSE 8080
ENTRYPOINT [ "npm"]
CMD [ "start" ]