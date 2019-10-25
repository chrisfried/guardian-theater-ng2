#!/bin/bash

pushd docker/ssl

if [ ! -f dev.key ]; then
  openssl req -new -x509 -newkey rsa:2048 -sha256 -nodes -keyout dev.key -days 3560 -out dev.crt -config certificate.cnf
fi

popd

docker build --no-cache . -t gt
docker run -d --name gt -p 3000:443 gt
