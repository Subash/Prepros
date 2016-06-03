/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

prepros.filter('prettyPath', [function() {

  'use strict';

  return function(string) {

    return string.replace(/\\/g, '/');

  };
}]);
