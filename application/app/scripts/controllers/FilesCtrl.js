/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _ , $*/

//Files List controls
prepros.controller('FilesCtrl', function ($scope, compiler, projectsManager, $filter, utils) {

    'use strict';

    var fs = require('fs'),
        path = require('path');

    //Change file output
    $scope.changeFileOutput = function (event, pid, id) {

        event.preventDefault();
        event.stopPropagation();

        var wd;

        var file = projectsManager.getFileById(pid, id),
            project = projectsManager.getProjectById(pid);

        //Interpolate path to replace css/js dirs
        var out = $filter('interpolatePath')(file.output, {config: project.config});

        out = $filter('fullPath')(out, { basePath: project.path});

        if (fs.existsSync(path.dirname(out))) {

            wd = path.dirname(out);

        } else {

            wd = project.path;

        }

        var elm = $('<input type="file" nwsaveas nwworkingdir="' + wd + '">');

        elm.trigger('click');

        $(elm).on('change', function (e) {

            var output = e.currentTarget.files[0].path;

            if(utils.isFileInsideFolder(project.path, e.currentTarget.files[0].path)) {

                output = path.relative(project.path, output);
            }

            $scope.$apply(function () {
                projectsManager.changeFileOutput(pid, id, output);
            });
        });
    };

    //Open file with default editor
    $scope.openFile = function (projectPath, filePath) {

        require('nw.gui').Shell.openExternal(path.join(projectPath, filePath));

    };


    //Compile file
    $scope.compile = function () {
        compiler.compile($scope.selectedFile.pid, $scope.selectedFile.id);
    };

});