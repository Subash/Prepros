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
    function compile(pid, fid) {

        var queueId =  fid+pid;

        if (!_.contains(compileQueue, queueId)) {

            var f = projectsManager.getFileById(pid, fid);

            if(_.isEmpty(f)) {
                return;
            }

            compileQueue.push(queueId);

            //Replace file.output placeholders with real paths
            var project = projectsManager.getProjectById(pid);

            var file = _.extend({}, f);

            //Sass/Compass compiler requires project path
            file.projectPath = project.path;

            //Less, Sass, Stylus compilers require autoprefixer options from project options
            file.config.autoprefixerBrowsers = project.config.autoprefixerBrowsers;

            file.input = $filter('fullPath')(file.input, { basePath: project.path});

            //Interpolate path to replace css/js dirs
            file.output = $filter('interpolatePath')(file.output, {config: project.config});

            //Get full path of a file
            file.output = $filter('fullPath')(file.output, { basePath: project.path});

            if (fs.existsSync(file.input)) {

                fileTypes.compile(file, function (data) {

                    compileQueue = _.without(compileQueue, queueId);

                    $rootScope.$apply(function () {

                        notification.success('Compilation Successful', 'Successfully compiled ' + file.name, data);

                    });

                    if(project.config.liveRefresh) {
                        liveServer.refresh(project.id, file.output, project.config.liveRefreshDelay);
                    }

                }, function (data) {

                    compileQueue = _.without(compileQueue, queueId);

                    $rootScope.$apply(function () {
                        notification.error('Compilation Failed', 'Failed to compile ' + file.name, data);
                    });

                });
            }
        }
    }

    return{
        compile: compile
    };

});

