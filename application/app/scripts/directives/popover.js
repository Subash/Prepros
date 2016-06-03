/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap */

//Popover directive
prepros.directive('popover', [

  '$timeout',

  function($timeout) {

    'use strict';

    return {
      restrict: 'A',
      link: function(scope, element, attrs) {

        $timeout(function() {

          element.popover({
            html: true,
            content: attrs.popover
          });

        });

      }
    };
  }
]);
