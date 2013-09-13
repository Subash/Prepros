/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */


/*jshint browser: true, node: true*/
/*global prepros,  _*/

prepros.factory("watcher", [

    '$filter',
    '$rootScope',
    'config',
    'compiler',
    'fileTypes',
    'notification',
    'projectsManager',

    function (
        $filter,
        $rootScope,
        config,
        compiler,
        fileTypes,
        notification,
        projectsManager
    ) {

        "use strict";

        var fs = require("fs"),
            chokidar = require('chokidar'),
            path = require('path');

            var projectsBeingWatched = {};

        var supported = /\.(:?less|sass|scss|styl|md|markdown|coffee|js|jade|haml|slim|ls)$/gi;
        var notSupported = /\.(:?png|jpg|jpeg|gif|bmp|woff|ttf|svg|ico|eot|psd|ai|tmp|html|htm|css|rb|php|asp|aspx|cfm|chm|cms|do|erb|jsp|mhtml|mspx|pl|py|shtml|cshtml|cs|vb|vbs|json)$/gi;


        function _watch(project) {

            var useExperimentalWatcher =  config.getUserOptions().experimental.fileWatcher;

            var watcher = chokidar.watch(project.path, {
                ignored: function(f) {

                    //Ignore dot files or folders
                    if(/\\\.|\/\./.test(f)) {
                        return true;
                    }

                    var ext = path.extname(f);

                    if(ext.match(notSupported)) {

                        return true;

                    } if(ext.match(supported)) {

                        return false;

                    } else if(projectsManager.matchFilters(project.id, f)) {

                        return true;

                    } else {

                        try {

                            if(fs.statSync(f).isDirectory()) {

                                return false;
                            }

                        } catch(e) {}
                    }

                    return true;
                },
                interval: 400,
                ignorePermissionErrors: true,
                ignoreInitial: true,
                usePolling : !useExperimentalWatcher
            });

            var changeHandler = function(fpath) {

                if(!fs.existsSync(fpath)) {
                    return;
                }

                if(fileTypes.isExtSupported(fpath)) {

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

                                    $rootScope.$apply(function() {
                                        projectsManager.refreshFile(imp.pid, parentId);
                                    });
                                }
                            });
                        }
                    });
                }
            };

            var debounceChangeHandler = _.debounce(function(fpath) {

                changeHandler(fpath);

            }, 75);

            watcher.on('change', function(fpath) {

                if(useExperimentalWatcher) {

                    return debounceChangeHandler(fpath);

                } else {

                    return changeHandler(fpath);
                }
            });

            watcher.on('error', function(err) {
                //Ignore all errors;  there are too many to notify the user
            });

            projectsBeingWatched[project.id] = {
                id: project.id,
                watcher: watcher
            };
        }

        var registerExceptionHandler = _.once(function(projects) {

            //An ugly hack to restart nodejs file watcher when it crashes
            process.on('uncaughtException', function(err) {

                if(/watch EPERM/.test(err.message)) {

                    _.each(projectsBeingWatched, function(project) {

                        project.watcher.close();

                        delete projectsBeingWatched[project.id];
                    });

                    _.each(projects, function(project) {
                        _watch(project);
                    });
                }
            });

        });

        //Function to start watching file
        function startWatching(projects) {

            registerExceptionHandler(projects);

            var ids = _.pluck(projects, 'id');

            _.each(projectsBeingWatched, function(project) {

                if(!_.contains(ids, project.id)) {

                    project.watcher.close();

                    delete projectsBeingWatched[project.id];
                }
            });

            _.each(projects, function(project) {

                if(!(project.id in projectsBeingWatched)) {
                    _watch(project);
                }
            });
        }

        return{
            startWatching: startWatching
        };

    }
]);

