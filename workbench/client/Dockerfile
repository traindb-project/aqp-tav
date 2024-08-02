FROM node:20.11.0-alpine as build

WORKDIR /app
COPY ./package*.json .

RUN npm i -g npm && \
    npm ci

COPY . .
RUN npm run build

FROM nginx:1.25.3-alpine

WORKDIR /app

COPY --from=build /app/dist/client/browser .
RUN chmod -R +x /app

EXPOSE 80
