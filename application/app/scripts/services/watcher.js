/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */


/*jshint browser: true, node: true, curly: false*/
/*global prepros,  _*/

prepros.factory("watcher", [

    '$rootScope',
    'config',
    'compiler',
    'fileTypes',
    'liveServer',
    'notification',
    'projectsManager',
    'utils',

    function ($rootScope, config, compiler, fileTypes, liveServer, notification, projectsManager, utils) {

        "use strict";

        var fs = require("fs"),
            chokidar = require('chokidar'),
            path = require('path');

        var projectsBeingWatched = {};

        var supported = /\.(:?less|sass|scss|styl|md|markdown|coffee|js|jade|haml|slim|ls|html|htm|css|rb|php|asp|aspx|cfm|chm|cms|do|erb|jsp|mhtml|mspx|pl|py|shtml|cshtml|cs|vb|vbs|tpl)$/gi;
        var notSupported = /\.(:?png|jpg|jpeg|gif|bmp|woff|ttf|svg|ico|eot|psd|ai|tmp|json|map)$/gi;


        function _watch(project) {

            var useExperimentalWatcher = config.getUserOptions().experimental.fileWatcher;

            //Utility Function to compile file
            var _compileFile = function (file_id) {

                if (project.files[file_id]) {

                    var file = project.files[file_id];

                    if (file.config.autoCompile) {

                        //Compile File
                        compiler.compile(file.pid, file.id);
                    }

                    projectsManager.refreshFile(file.pid, file.id, function () {
                        $rootScope.$apply();
                    });
                }
            };

            var watcher = chokidar.watch(project.path, {
                ignored: function (f) {

                    //Ignore dot files or folders
                    if (/\\\.|\/\./.test(f)) {
                        return true;
                    }

                    var ext = path.extname(f);

                    if (ext.match(notSupported)) {

                        return true;

                    } else if (ext.match(supported)) {

                        return false;

                    } else if (projectsManager.matchFilters(project.id, f)) {

                        return true;

                    } else {

                        try {

                            if (fs.statSync(f).isDirectory()) {

                                return false;
                            }

                        } catch (e) {
                        }
                    }

                    return true;
                },
                interval: 400,
                ignorePermissionErrors: true,
                ignoreInitial: true,
                usePolling: !useExperimentalWatcher
            });

            var timeOutAdd = function (fpath) {

                window.setTimeout(function () {

                    fs.exists(fpath, function (exists) {

                        if (exists && config.getUserOptions().experimental.autoAddRemoveFile) {

                            projectsManager.addFile(project.id, fpath, function () {
                                $rootScope.$apply();
                            });
                        }
                    });

                }, 2*1000);
            };

            watcher.on('add', timeOutAdd);

            var timeOutUnlink = function (fpath) {

                window.setTimeout(function () {

                    fs.exists(fpath, function (exists) {

                        if (exists && config.getUserOptions().experimental.autoAddRemoveFile) {

                            $rootScope.$apply(function () {
                                projectsManager.removeFile(project.id, utils.id(path.relative(project.path, fpath)));
                            });
                        }
                    });

                }, 2*1000);
            };

            watcher.on('unlink', timeOutUnlink);

            var changeHandler = function (fpath) {

                if (!fs.existsSync(fpath)) return;

                //Do not refresh on preprocessable files except javascript, markdown
                var isJs = /\.js$/i.test(fpath);

                var isMarkdown = /\.(md|markdown)/i.test(fpath);

                if (project.config.liveRefresh && (!fileTypes.isExtSupported(fpath) || isJs || isMarkdown)) {

                    liveServer.refresh(project.id, fpath, project.config.liveRefreshDelay);
                }

                //Try to add to files list. if file is not supported project manager will ignore it.
                if (config.getUserOptions().experimental.autoAddRemoveFile) {

                    projectsManager.addFile(project.id, fpath, function () {
                        $rootScope.$apply();
                    });
                }

                if (fileTypes.isExtSupported(fpath)) {

                    var id = utils.id(path.relative(project.path, fpath));

                    _compileFile(id);

                    if (project.imports[id]) {

                        var imp = project.imports[id];

                        _.each(imp.parents, function (parent) {
                            _compileFile(parent);
                        });
                    }
                }
            };

            var debounceChangeHandler = _.debounce(function (fpath) {

                changeHandler(fpath);

            }, 75);

            watcher.on('change', function (fpath) {

                if (useExperimentalWatcher) {

                    return debounceChangeHandler(fpath);

                } else {

                    return changeHandler(fpath);
                }
            });

            watcher.on('error', function (err) {
                console.log(err);
            });

            projectsBeingWatched[project.id] = {
                id: project.id,
                watcher: watcher
            };
        }

        var registerExceptionHandler = _.once(function (projects) {

            //An ugly hack to restart nodejs file watcher whenever it crashes
            process.on('uncaughtException', function (err) {

                if (err.message.indexOf('watch ') >= 0) {

                    _.each(projectsBeingWatched, function (project) {

                        project.watcher.close();

                        delete projectsBeingWatched[project.id];
                    });

                    _.each(projects, function (project) {
                        _watch(project);
                    });
                }
            });

        });

        //Function to start watching file
        function startWatching(projects) {

            registerExceptionHandler(projects);

            var ids = _.pluck(projects, 'id');

            _.each(projectsBeingWatched, function (project) {

                if (!_.contains(ids, project.id)) {

                    project.watcher.close();

                    delete projectsBeingWatched[project.id];
                }
            });

            _.each(projects, function (project) {

                if ((project.id in projectsBeingWatched) && project.config.watch === false) {

                    projectsBeingWatched[project.id].watcher.close();

                    delete projectsBeingWatched[project.id];

                } else if (!(project.id in projectsBeingWatched) && project.config.watch !== false) {

                    _watch(project);

                }
            });
        }

        return{
            startWatching: startWatching
        };

    }
]);
