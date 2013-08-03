/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */


/*jshint browser: true, node: true*/
/*global prepros,  _*/

prepros.factory("watcher", function (projectsManager, notification, config, compiler, $filter) {

    "use strict";

    var fs = require("fs"),
        watchingFiles = [],
        watchingImports = [];

    //Function to start watching file
    function startWatching(projects) {

        var files = [];
        var imports = [];

        _.each(projects, function(project){
            files = _.union(files, project.files);
            imports = _.union(imports, project.imports);
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

        _.each(watchingFiles, function (file) {

            if (!_.contains(_files, file)) {

                fs.unwatchFile(file.split('|')[0]);
                watchingFiles = _.without(watchingFiles, file);
            }
        });

        _.each(watchingImports, function (imp) {

            if (!_.contains(_imports, imp)) {

                fs.unwatchFile(imp.split('|')[0]);
                watchingImports = _.without(watchingImports, imp);
            }
        });

        var filesToWatch = _.difference(_files, watchingFiles);
        var importsToWatch = _.difference(_imports, watchingImports);

        //Watch files
        _.each(filesToWatch, function (file) {

            var fileData = file.split('|');

            fs.watchFile(fileData[0], { persistent: true, interval: 200}, function(){

                var f = projectsManager.getFileById(fileData[1], fileData[2]);

                if (f.config.autoCompile) {

                    //Compile File
                    compiler.compile(f.pid, f.id);
                }
            });

            watchingFiles.push(file);
        });

        //Watch imports
        _.each(importsToWatch, function (imp) {

            var fileData = imp.split('|');

            fs.watchFile(fileData[0], { persistent: true, interval: 200}, function(){

                var im = projectsManager.getImportById(fileData[1], fileData[2]);

                _.each(im.parents, function (parentId) {

                    var parentFile = projectsManager.getFileById(im.pid, parentId);

                    if (parentFile.config.autoCompile) {

                        compiler.compile(im.pid, parentId);
                    }
                });
            });

            //Push to watching list so it can be closed later
            watchingImports.push(imp);
        });
    }

    return{
        startWatching: startWatching
    };

});

