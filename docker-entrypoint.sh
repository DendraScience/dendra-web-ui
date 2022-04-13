#!/bin/sh

# Pass environment settings to web app
envsubst < /srv/__env/template.js > /srv/__env/settings.js

exec "$@"
