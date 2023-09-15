# Adapted from
# https://sveltesociety.dev/recipes/publishing-and-deploying/dockerize-a-svelte-app

# Running this image will expose the frontend on port 80. Note that when
# running this container on its own, the backend is not present, i.e. custom
# scenarios will not work! If you want both together, please cd to the root
# directory of this repository and run
#    docker-compose up
# instead, which will use the compose.yaml file.

FROM node:20.6.1 AS builder

WORKDIR .

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY index.html .
COPY svelte.config.js .
COPY tsconfig.json .
COPY tsconfig.node.json .
COPY vite.config.ts .
COPY src ./src
RUN npm run build

FROM nginx:1.25.2
COPY default.conf /etc/nginx/conf.d
COPY --from=builder /dist /usr/share/nginx/html
