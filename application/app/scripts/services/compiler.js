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

            var file = projectsManager.getFileById(pid, fid);

            if(_.isEmpty(file)) {
                return;
            }

            compileQueue.push(queueId);

            var ext = path.extname(file.input).toLowerCase();

            //Replace file.output placeholders with real paths
            var prj = projectsManager.getProjectById(pid);

            //Remove angular hash maps so that the change in file here won't affect files in project
            var f = $.parseJSON(angular.toJson(file));

            //Sass compiler requires project path for config.rb file
            if (ext === '.scss' || ext === '.sass') {

                f.projectPath = prj.path;
            }

            //Less, Sass, Stylus compilers require autoprefixer options from project options
            f.config.autoprefixerBrowsers = prj.config.autoprefixerBrowsers;

            f.input = $filter('fullPath')(file.input, { basePath: prj.path});

            //Interpolate path to replace css/js dirs
            f.output = $filter('interpolatePath')(file.output, {config: prj.config});

            //Get full path of a file
            f.output = $filter('fullPath')(f.output, { basePath: prj.path});

            if (fs.existsSync(f.input)) {

                fileTypes.compile(f, function (data) {

                    compileQueue = _.without(compileQueue, queueId);

                    $rootScope.$apply(function () {

                        notification.success('Compilation Successful', 'Successfully compiled ' + f.name, data);

                    });

                    if(prj.config.liveRefresh) {
                        liveServer.refresh(prj.id, f.output, prj.config.liveRefreshDelay);
                    }

                }, function (data) {

                    compileQueue = _.without(compileQueue, queueId);

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

