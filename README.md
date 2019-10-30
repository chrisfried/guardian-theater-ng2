# Guardian Theater

This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.0.0-beta.24.

## Getting up and running

You'll need:

* NodeJS installed locally, I recommend using [nvm](https://github.com/nvm-sh/nvm) and installing the latest lts using `nvm install --lts`.
* OpenSSL cli tool
* API Key from Bungie https://www.bungie.net/en/Application

For the development server to run you must have a certificate it can load. Do so by issuing the following command:

`openssl req -new -x509 -newkey rsa:2048 -sha256 -nodes -keyout dev.key -days 3560 -out dev.crt -config docker/ssl/certificate.cnf`

You must also create a src/environments/keys.ts file with your key in it. The file looks like this:

```
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
```

Replace the variables with your own values and save the file.

Last, run `npm install` to install all requirements.

## Development server
Run `npm start` for a dev server. Create a hosts entry for `dev.guardian.theater` pointing to your localhost. Navigate to `http://dev.guardian.theater:3000/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `npm run ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `npm run ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `npm run ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

There are no tests, just boilerplate generated by Angular CLI. If you would like to write tests, you are more than welcome to.

## Running end-to-end tests

Run `npm run ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

There are no tests, just boilerplate generated by Angular CLI. If you would like to write tests, you are more than welcome to.

## Deploying to Github Pages

Run `npm run ngh` to deploy to Github Pages.

## Further help

To get more help on the `angular-cli` use `npm ng help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
