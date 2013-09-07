/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, angular, _*/

//Storage
prepros.factory('storage',[

    function () {

        'use strict';

        var fs = require('fs-extra'),
            path = require('path');

        //Function to save project list to json
        function put(projects) {

            localStorage.PreprosData = angular.toJson(projects, false);

        }

        //Get projects list from localStorage
        function get() {

            var projects = [];

            try {

                projects = angular.fromJson(localStorage.PreprosData || '[]');

            } catch (e) {

                window.alert('Error Reading Projects ! Reverting to defaults.');

                put([]);

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