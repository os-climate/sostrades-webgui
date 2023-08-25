# SosTradesGui

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running end-to-end tests

End-to-end tests can be performed with the 1.15.2 version of [Playwright](https://playwright.dev/). 

To install it, first run `npm i -D @playwright/test@1.15.2`, and then, since playwright must be run on Chromium web browser, retrieve binaries files at : `https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/Win%2F920619%2Fchrome-win.zip?generation=1631493408185707&alt=media`. Chromium binary version corresponding to playwright 1.15.2 is 920619.

Finally go into `package.json` and in the section `scripts`, modify the following environment variable to the `test` item. 
For example : `"test": "set USERNAME_TEST=user_test&& set USERNAME_PASSWORD=user_test&& set BASE_URL_TEST=http://localhost:4200&& npx playwright test e2e-playwright"`

Run `npm test` to execute.

Run  `npx playwright codegen` to launch test generator.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## License
The sostrades-webgui source code is distributed under the Apache License Version 2.0.
A copy of it can be found in the LICENSE file.

The sostrades-webgui product depends on other software which have various licenses.
The list of dependencies with their licenses is given in the CREDITS.rst file.