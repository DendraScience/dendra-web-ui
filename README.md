# dendra-web-ui

> Nuxt.js project

## Build Setup

``` bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).


## To build and publish the Docker image

1. Make this project directory the current directory, i.e. `cd dendra-web-ui`.

2. Build the project `docker build -t dendra:dendra-web-ui .`.

3. Tag the desired image, e.g. `docker tag f0ec409b5194 dendra/dendra-web-ui:latest`.

4. Push it via `docker push dendra/dendra-web-ui`.


## Snippets

To run in dev mode against a location Docker installation

```
$ WEB_UI_API_PATH=/v1/socket.io WEB_UI_API_URI=http://api.local.dendra.science:8080 npm run dev
```
