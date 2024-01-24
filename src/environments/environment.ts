// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  API_MAIN_URL: 'http://127.0.0.1:8000',
  API_DATA_URL: 'http://127.0.0.1:8001',
  API_MESSAGE_URL: 'http://127.0.0.1:8002',
  API_POST_PROCESSING_URL: 'http://127.0.0.1:8003',
  API_ONTOLOGY_DIRECT_URL: 'http://127.0.0.1:5555',

  SOS_TRADES_HEADER_COLOR_HEX: "#008000",
  SOS_TRADES_LOGO_FIRST: {
    PATH : "assets/SOS_TRADES_LOGO_BLANC.svg",
    HEIGHT : "40px"
  },
  SOS_TRADES_LOGO_SECOND: {
    PATH : "assets/OscLogoWhite.png",
    HEIGHT : "50px"
  },
  SOS_TRADES_LOGO_THIRD: {
    PATH : "",
    HEIGHT : ""
  },
  SOS_TRADES_LOGO_FOURTH: {
    PATH : "",
    HEIGHT : ""
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
