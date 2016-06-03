/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */

/*jshint browser: true, node: true, curly: false*/
/*global prepros*/

prepros.filter('shortPath', [

  'utils',

  function(utils) {

    'use strict';

    var path = require('path');

    return function(string, basePath) {

      if (utils.isFileInsideFolder(basePath, string)) return path.relative(basePath, string);

      return string;

    };
  }
]);
