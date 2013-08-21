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

        var watchedProjects = [];

    //Function to start watching file
    function startWatching(projects) {

        var files = [];
        var imports = [];

        var newProjects = [];

        _.each(projects, function(project){
            files = _.union(files, project.files);
            imports = _.union(imports, project.imports);
            newProjects.push(project.id);
        });

        _.each(watchedProjects, function(project) {
            if(!_.contains(newProjects, project.pid)) {
                project.watcher.close();
                watchedProjects = _.reject(watchedProjects, function(pr){ return pr.pid === project.pid; });
            }
        });

        var _files = [];
        _.each(files, function(file) {

            // <file-path>|<project-id>|<file-id> ; use split('|')
            var fullFile = $filter('fullPath')(file.input, { basePath: projectsManager.getProjectById(file.pid).path}) + '|' + file.pid + '|' + file.id;

            _files.push(fullFile);
        });

        var _imports = [];
        _.each(imports, function(imp) {

            // <import-path>|<project-id>|<import-id> ; use split('|')
            var fullImp = $filter('fullPath')(imp.path, { basePath: projectsManager.getProjectById(imp.pid).path}) +'|' + imp.pid + '|' + imp.id;

            _imports.push(fullImp);
        });

        _.each(projects, function(project) {

            if(!_.contains(_.pluck(watchedProjects, 'pid'), project.id)) {

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

                    _.each(_files, function(file) {

                        var sf = file.split('|');

                        if(path.relative(sf[0], fpath)=== "") {

                            var f = projectsManager.getFileById(sf[1], sf[2]);

                            process.nextTick(function() {
                                $rootScope.$apply(function() {
                                    projectsManager.refreshFile(f.pid, f.id);
                                });
                            });

                            if (f.config.autoCompile) {

                                //Compile File
                                compiler.compile(f.pid, f.id);
                            }

                        }
                    });

                    _.each(_imports, function(file) {

                        var sf = file.split('|');

                        if(path.relative(sf[0], fpath)=== "") {

                            var im = projectsManager.getImportById(sf[1], sf[2]);

                            _.each(im.parents, function (parentId) {

                                var parentFile = projectsManager.getFileById(im.pid, parentId);

                                if (parentFile.config.autoCompile) {

                                    compiler.compile(im.pid, parentId);
                                }
                            });

                        }
                    });
                });

                watcher.on('error', function(err) {
                    notification.error('Error', 'An error occurred while watching project folder.' , project.path + ' ' + err.message);
                });

                watchedProjects.push({pid: project.id, watcher : watcher});
            }
        });
    }

    return{
        startWatching: startWatching
    };

});

