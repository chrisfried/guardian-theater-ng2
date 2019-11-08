#!/bin/bash

cd docker/ssl

if [ ! -f dev.key ]; then
  openssl req -new -x509 -newkey rsa:2048 -sha256 -nodes -keyout dev.key -days 3560 -out dev.crt -config certificate.cnf
fi

cd -

if [ ! -f src/environments/keys.ts ]; then
  cat > src/environments/keys.ts <<EOF
  export const bungieDev = {
    apiKey: '$BUNGIE_DEV_API_KEY',
    authUrl: 'https://www.bungie.net/en/OAuth/Authorize',
    clientId: '$BUNGIE_DEV_CLIENT_ID',
    clientSecret: '$BUNGIE_DEV_CLIENT_SECRET'
  }
  export const bungieProd = {
    apiKey: '$BUNGIE_PROD_API_KEY',
    authUrl: 'https://www.bungie.net/en/OAuth/Authorize',
    clientId: '$BUNGIE_PROD_CLIENT_ID',
    clientSecret: '$BUNGIE_PROD_CLIENT_SECRET'
  }
EOF
fi


docker build --no-cache . -t gt
docker run -d --name gt -p 3000:443 gt
