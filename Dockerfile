# This Dockerfile builds an image containing all available areas of the
# DemoLand web app.
# 
# Adapted from https://sveltesociety.dev/recipes/publishing-and-deploying/dockerize-a-svelte-app
# 
# Usage:
#     docker build -t demoland_web .
#     docker run -p 80:80 demoland_web
# then visit 'http://localhost:80' in your browser.


FROM node:20.6.1 AS builder

WORKDIR .

COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY index.html .
COPY svelte.config.js .
COPY tsconfig.json .
COPY tsconfig.node.json .
COPY vite.config.ts .
COPY src ./src
COPY areas ./areas
COPY public ./public
COPY node_scripts ./node_scripts
RUN npm run build_all local

FROM nginx:1.25.2
COPY default.conf /etc/nginx/conf.d
COPY --from=builder /dist /usr/share/nginx/html
EXPOSE 80
