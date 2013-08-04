/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, angular, _*/

//Storage
prepros.factory('storage', function () {

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

            //Load from config file
            _.each(Object.keys(projects), function(pid) {

                if(fs.existsSync(projects[pid].path + path.sep + 'Prepros.json')) {

                    var pPath = projects[pid].path;

                    var pr = JSON.parse(fs.readFileSync(projects[pid].path + path.sep + 'Prepros.json'));

                    pr.path = pPath;

                    projects[pid] = pr;
                }
            });

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
});