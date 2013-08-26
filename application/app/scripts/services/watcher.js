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

        var supported = /\.(:?less|sass|scss|styl|md|markdown|coffee|js|jade|haml|slim|ls)$/gi;

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
                ignored: function(f) {

                    //Ignore dot files or folders
                    if(/\\\.|\/\./.test(f)) {
                        return true;
                    }

                    //Do not ignore files that don't have extension because that may be a folder
                    if(!path.extname(f)) {
                        return false;
                    }

                    //Test against supported extensions and ignore if not supported
                    return !f.match(supported);
                },
                ignorePermissionErrors: true,
                ignoreInitial: true,
                usePolling : !config.getUserOptions().experimental.fileWatcher
            });

            var changeDelay = config.getUserOptions().experimental.fileWatcher? 50 : 0;

            var debounceChange = _.debounce(function(fpath) {

                if(!fs.existsSync(fpath)) {
                    return;
                }

                _.each(project.files, function(file) {

                    var filePath = $filter('fullPath')(file.input, { basePath: project.path});

                    if(path.relative(filePath, fpath)=== "") {

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

