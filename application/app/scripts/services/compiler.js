/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, curly: false*/
/*global prepros, $, angular, _*/

prepros.factory("compiler",[

    '$filter',
    '$rootScope',
    'projectsManager',
    'fileTypes',
    'notification',
    'log',
    'liveServer',

    function (
        $filter,
        $rootScope,
        projectsManager,
        fileTypes,
        notification,
        log,
        liveServer
    ) {

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

                var project = projectsManager.getProjectById(pid);

                fileTypes.compile(file, project, function(err) {

                    compileQueue = _.without(compileQueue, queueId);

                    if(err) {

                        $rootScope.$apply(function() {

                            log.add({
                                type: 'error',
                                title: 'Compilation Failed',
                                message: 'Failed to compile ' + file.name,
                                details: err.message + '\n' + path.join(project.path, file.input),
                                time: new Date().toISOString()
                            });
                        });

                        return notification.error('Compilation Failed', 'Failed to compile ' + file.name, err.message);
                    }

                    $rootScope.$apply(function() {

                        log.add({
                            type: 'success',
                            title: 'Compilation Successful',
                            message: 'Successfully compiled ' + file.name,
                            details: path.join(project.path, file.input),
                            time: new Date().toISOString()
                        });
                    });

                    notification.success('Compilation Successful', 'Successfully Compiled ' + file.name);

                    if(project.config.liveRefresh) {

                        var fullPath = (file.customOutput)? path.resolve(project.path, file.customOutput): $filter('interpolatePath')(file.input, project);

                        liveServer.refresh(project.id,fullPath , project.config.liveRefreshDelay);
                    }

                });
            }
        }

        return{
            compile: compile
        };

    }
]);

