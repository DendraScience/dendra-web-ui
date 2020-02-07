FROM node:12.14

MAINTAINER J. Scott Smith <scott@newleafsolutionsinc.com>

#
# Following Best Practices and guidelines at:
# 	https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
# 	https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
#

RUN groupmod -g 2000 node \
  && usermod -u 2000 -g 2000 node

WORKDIR /home/node/app

# Best practice: run with NODE_ENV set to production
ENV NODE_ENV production

# Install dependencies
COPY package.json /home/node/app
COPY package-lock.json /home/node/app
RUN npm install

# Best practice: run as user 'node'
USER node
EXPOSE 8080

# Copy source dist; relies on .dockerignore
# NOTE: Must perform 'npm run build' beforehand
COPY . /home/node/app

# Nuxt deployment:
#   https://nuxtjs.org/guide/commands
#   https://nuxtjs.org/faq/host-port/
ENV HOST 0.0.0.0
ENV PORT 8080
CMD [ "npm", "start" ]
