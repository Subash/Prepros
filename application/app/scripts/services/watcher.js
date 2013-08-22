/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */


/*jshint browser: true, node: true*/
/*global prepros,  _*/

prepros.factory("watcher", function (projectsManager, notification, config, compiler, $filter, liveServer, fileTypes, $rootScope, utils) {

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
                ignoreInitial: true,
                usePolling : !config.getUserOptions().experimental.fileWatcher
            });

            var timeOutAdd = function(fpath) {

                window.setTimeout(function() {

                    if(!fs.existsSync(fpath)) {
                        return;
                    }

                    if(config.getUserOptions().experimental.autoAddRemoveFile) {
                        $rootScope.$apply(function() {
                            projectsManager.addFile(project.id, fpath);
                        });
                    }
                }, 200);
            };

            watcher.on('add', timeOutAdd);

            var timeOutUnlink = function(fpath) {

                window.setTimeout(function() {

                    if(fs.existsSync(fpath)) {
                        return;
                    }

                    if(config.getUserOptions().experimental.autoAddRemoveFile) {
                        $rootScope.$apply(function() {
                            projectsManager.removeFile(project.id, utils.id(path.relative(project.path, fpath)));
                        });
                    }

                }, 200);
            };

            watcher.on('unlink', timeOutUnlink);

            var changeDelay = config.getUserOptions().experimental.fileWatcher? 50 : 0;

            var debounceChange = _.debounce(function(fpath) {

                if(!fs.existsSync(fpath)) {
                    return;
                }

                //Do not refresh on preprocessable files except javascript, markdown and also exclude prepros.json file
                if (project.config.liveRefresh && (!fileTypes.isExtSupported(fpath) || /\.(md|markdown)/i.test(fpath) || /\.js/i.test(fpath)) && !/prepros\.json/.test(fpath)) {

                    liveServer.refresh(project.id, fpath, project.config.liveRefreshDelay);
                }

                //Try to add to files list. if file is not supported project manager will ignore it.
                if(config.getUserOptions().experimental.autoAddRemoveFile) {
                    $rootScope.$apply(function() {
                        projectsManager.addFile(project.id, fpath);
                    });
                }

                _.each(project.files, function(file) {

                    var filePath = $filter('fullPath')(file.input, { basePath: project.path});

                    if(path.relative(filePath, fpath)=== "") {

                        if (file.config.autoCompile) {

                            //Compile File
                            compiler.compile(file.pid, file.id);
                        }

                        $rootScope.$apply(function() {
                            projectsManager.refreshFile(file.pid, file.id);
                        });
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
            }, changeDelay);

            watcher.on('change', debounceChange);

            watcher.on('error', function(err) {
                //Ignore all errors;  there are too many to notify the user
            });

            projectsBeingWatched.push({id: project.id, watcher: watcher});

        });
    }

    return{
        startWatching: startWatching
    };

});

