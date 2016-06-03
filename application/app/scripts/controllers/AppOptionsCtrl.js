/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _ , $*/

//About Window Controller
prepros.controller('AppOptionsCtrl', [

  '$scope',
  'config',

  function($scope, config) {

    'use strict';

    $scope.config = config.getUserOptions();

    $scope.$watch('config', function() {

      if (!_.isEmpty($scope.config)) {

        config.saveUserOptions($scope.config);

      }

    }, true);
  }
]);
