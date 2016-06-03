/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */

/*jshint browser: true, node: true, curly: false*/
/*global prepros, angular, _*/

//Storage
prepros.factory('storage', [

  'utils',

  function(utils) {

    'use strict';

    var fs = require('fs-extra'),
      path = require('path');

    var _put = function(projects) {

      var prs = {};

      angular.copy(projects, prs);

      _.each(prs, function(pr) {

        _.each(pr.images, function(img) {
          if (img.status === 'OPTIMIZING') {
            img.status = 'NOT_OPTIMIZED';
          }
        });
      });

      localStorage.PreprosData = angular.toJson(prs, false);

    };

    //Function to save project list to json
    function put(projects) {

      _put(projects);

    }

    //Get projects list from localStorage
    function get() {

      var projects = {};

      try {

        projects = angular.fromJson(localStorage.PreprosData || '{}');

        if (_.isArray(projects)) projects = utils.convertProjects(projects);

        _.each(projects, function(project) {

          if (!project.cfgVersion) project = utils.convertProject(project);

          projects[project.id] = project;
        });

      } catch (e) {

        window.alert('Error Reading Data ! Click ok and hit CTRL+SHIFT+X or CMD+SHIFT+X to clear data.');

      }

      return projects;
    }

    //Return projects list and files list
    return {
      get: get,
      put: put
    };
  }
]);
