FROM node:10-alpine AS builder

WORKDIR /app
COPY . .
RUN npm install
RUN npm run ng build

FROM nginx:1-alpine

WORKDIR /usr/share/nginx/html
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/ssl/dev.key /etc/nginx/ssl/dev.key
COPY docker/ssl/dev.crt /etc/nginx/ssl/dev.crt
COPY --from=builder /app/dist/ .
RUN cp index.html 404.html

EXPOSE 80
EXPOSE 443
