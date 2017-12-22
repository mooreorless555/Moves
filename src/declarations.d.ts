/*
  Declaration files are how the Typescript compiler knows about the type information(or shape) of an object.
  They're what make intellisense work and make Typescript know all about your code.

  A wildcard module is declared below to allow third party libraries to be used in an app even if they don't
  provide their own type declarations.

  To learn more about using third party libraries in an Ionic app, check out the docs here:
  http://ionicframework.com/docs/v2/resources/third-party-libs/

  For more info on type definition files, check out the Typescript docs here:
  https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
*/

/// <reference path="../node_modules/@types/googlemaps/index.d.ts" />

declare module '*';

declare module 'imgcache.js';
declare var $: any;
declare var swal: any;
declare var iziToast: any;
declare var iziModal: any;
declare var MapOverlay: any;
declare var editable: any;
declare var velocity: any;
declare var anime: any;
declare var marquee: any;
declare var Mailjet: any;
declare var FCMPlugin: any;