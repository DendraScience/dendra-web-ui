# dendra-web-ui

> Dendra public facing web site and application.

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn run dev

# build for production and launch server
$ yarn run build
$ yarn start

# generate static project
$ yarn run generate
```

For detailed explanation on how things work, checkout [Nuxt.js docs](https://nuxtjs.org).

## To build and publish the Docker image

1. Make this project directory the current directory, i.e. `cd dendra-web-ui`.

2. Build the project `docker build -t dendra:dendra-web-ui .`.

3. Tag the desired image, e.g. `docker tag f0ec409b5194 dendra/dendra-web-ui:latest`.

4. Push it via `docker push dendra/dendra-web-ui`.
