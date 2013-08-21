/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */


/*jshint browser: true, node: true*/
/*global prepros,  _*/

prepros.factory("watcher", function (projectsManager, notification, config, compiler, $filter, liveServer, fileTypes, $rootScope) {

    "use strict";

    var fs = require("fs"),
        chokidar = require('chokidar'),
        path = require('path');

        var projectsBeingWatched = [];

    //Function to start watching file
    function startWatching(projects) {

        _.each(projectsBeingWatched, function(project) {

            project.watcher.close();
            projectsBeingWatched =  _.reject(projectsBeingWatched, function(prj){
                return prj.id === project.id;
            });
        });

        _.each(projects, function(project) {

            var watcher = chokidar.watch(project.path, {
                ignored: /\\\.|\/\./,
                ignorePermissionErrors: true,
                usePolling : !config.getUserOptions().experimentalFileWatcher
            });

            watcher.on('change', function(fpath) {

                //Do not refresh on preprocessable files except javascript and also exclude prepros.json file
                if (project.config.liveRefresh && (!fileTypes.isExtSupported(fpath) || /\.js/i.test(fpath)) && !/prepros\.json/.test(fpath)) {

                    liveServer.refresh(project.id, fpath, project.config.liveRefreshDelay);
                }

                _.each(project.files, function(file) {

                    var filePath = $filter('fullPath')(file.input, { basePath: project.path});

                    if(path.relative(filePath, fpath)=== "") {

                        process.nextTick(function() {
                            $rootScope.$apply(function() {
                                projectsManager.refreshFile(file.pid, file.id);
                            });
                        });

                        if (file.config.autoCompile) {

                            //Compile File
                            compiler.compile(file.pid, file.id);
                        }
                    }
                });

                _.each(project.imports, function(imp) {

                    var filePath = $filter('fullPath')(imp.path, { basePath: project.path});

                    if(path.relative(filePath, fpath)=== "") {

                        _.each(imp.parents, function (parentId) {

                            var parentFile = projectsManager.getFileById(imp.pid, parentId);

                            if (!_.isEmpty(parentFile) && parentFile.config.autoCompile) {

                                compiler.compile(imp.pid, parentId);
                            }
                        });
                    }
                });
            });

            watcher.on('error', function(err) {
                notification.error('Error', 'An error occurred while watching project folder.' , project.path + ' ' + err.message);
            });

            projectsBeingWatched.push({id: project.id, watcher: watcher});

        });
    }

    return{
        startWatching: startWatching
    };

});

