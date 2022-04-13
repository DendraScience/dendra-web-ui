FROM caddy:latest

MAINTAINER J. Scott Smith <scott@newleafsolutionsinc.com>

# Install envsubst command for replacing __env files
RUN set -x \
  && apk add gettext libintl

COPY docker-entrypoint.sh /usr/local/bin/

# Copy config
COPY caddy.docker.json /etc/caddy/caddy.json

# Copy source dist
# NOTE: Must perform 'npm run generate' beforehand
COPY dist /srv

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["caddy", "run", "--config", "/etc/caddy/caddy.json"]
