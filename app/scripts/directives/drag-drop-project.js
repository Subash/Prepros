/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap */

'use strict';

//Drag and drop directive
prepros.directive('dragDropProject', function (projectsManager) {

    return {

        restrict: 'A',
        link: function (scope, element) {

            var fs = require('fs'),
                path = require('path');

            //Add project on file drop
            element.on('drop', function (e) {

                e.preventDefault();

                var oe = e.originalEvent;

                //Get files or folders
                var files = oe.dataTransfer.files;

                //Iterate through each file/folder
                _.each(files, function (file) {

                    //Get stats
                    var stats = fs.statSync(file.path);

                    //Check if it is a directory and not a drive
                    if (stats.isDirectory() && path.dirname(file.path) !== file.path) {

                        //Add to projects
                        projectsManager.addProject(file.path);

                    } else if(stats.isFile() && path.dirname(path.dirname(file.path)) !== path.dirname(file.path)) {

                        //Add to projects
                        projectsManager.addProject(path.dirname(file.path));

                    }
                });
            });
        }
    };
});




