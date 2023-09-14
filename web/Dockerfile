# https://sveltesociety.dev/recipes/publishing-and-deploying/dockerize-a-svelte-app

FROM node:20.6.1 AS builder

WORKDIR .

COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.25.2
COPY --from=builder /dist /usr/share/nginx/html
