/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, angular, _*/

prepros.factory("compiler", function (projectsManager, fileTypes, notification, $filter, $rootScope, liveServer) {

    "use strict";

    var fs = require('fs-extra'),
        path = require('path');

    var compileQueue = [];

    //function to compile
    function compile(fid) {

        if (!_.contains(compileQueue, fid)) {

            compileQueue.push(fid);

            var file = projectsManager.getFileById(fid);

            var ext = path.extname(file.input).toLowerCase();

            //Replace file.output placeholders with real paths
            var prj = projectsManager.getProjectById(file.pid);

            //Remove angular hash maps so that the change in file here won't affect files in project
            var f = $.parseJSON(angular.toJson(file));

            //Sass compiler requires project path for config.rb file
            if (ext === '.scss' || ext === '.sass') {

                f.projectPath = prj.path;
            }

            f.output = $filter('interpolatePath')(file.output, {config: prj.config, relative: false, basePath: prj.path});

            if (fs.existsSync(f.input)) {

                fileTypes.compile(f, function (data) {

                    compileQueue = _.without(compileQueue, fid);

                    $rootScope.$apply(function () {

                        notification.success('Compilation Successful', 'Successfully compiled ' + f.name, data);

                    });

                    if (projectsManager.getProjectById(f.pid).config.liveRefresh) {
                        liveServer.refresh(f.output);
                    }


                }, function (data) {

                    compileQueue = _.without(compileQueue, fid);

                    $rootScope.$apply(function () {
                        notification.error('Compilation Failed', 'Failed to compile ' + f.name, data);
                    });

                });
            }
        }

    }

    return{
        compile: compile
    };

});

