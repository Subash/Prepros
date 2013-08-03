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
    function startWatching(data) {


        var files = data.files;
        var imports = data.imports;

        _.each(watchingFiles, function(file) {
            fs.unwatchFile(file);
        });

        _.each(watchingImports, function(file) {
            fs.unwatchFile(file);
        });

        //Watch files
        _.each(files, function (file) {

            var filePath = $filter('fullPath')(file.input, { basePath: projectsManager.getProjectById(file.pid).path});

            try {

                fs.watchFile(filePath, { persistent: true, interval: 200}, function(){

                    if (file.config.autoCompile) {

                        //Compile File
                        compiler.compile(file.pid, file.id);

                    }
                });

                watchingFiles.push(filePath);

            } catch (err) {

                notification.error('Error watching file.', 'An error occurred while watching file', filePath);
            }

        });

        //Watch imports
        _.each(imports, function (imp) {

            var importPath = $filter('fullPath')(imp.path, { basePath: projectsManager.getProjectById(imp.pid).path});

            try {

                fs.watchFile(imp, { persistent: true, interval: 200}, function(){

                    _.each(imp.parents, function (parentId) {

                        var parentFile = projectsManager.getFileById(imp.pid, parentId);

                        if (!_.isEmpty(parentFile) && parentFile.config.autoCompile) {

                            compiler.compile(imp.pid, parentId);
                        }
                    });
                });

                //Push to watching list so it can be closed later
                watchingImports.push(importPath);

            } catch (err) {

                notification.error('Error watching imported file', 'An error occurred while watching file', importPath);

            }

        });

    }

    return{
        startWatching: startWatching
    };

});

