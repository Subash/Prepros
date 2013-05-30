/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _ , $*/

//Files List controls
prepros.controller('FilesCtrl', function ($scope, compiler, projectsManager) {

    'use strict';

    var fs = require('fs'),
        path = require('path');

    //Change file output
    $scope.changeFileOutput = function(event, id){

        event.preventDefault();
        event.stopPropagation();

        var wd;

        var file = projectsManager.getFileById(id),
            project = projectsManager.getProjectById(file.pid);


        if (fs.existsSync(path.dirname(file.output))) {
            wd = path.dirname(file.output);
        } else {
            wd = project.path;
        }

        var elm = $('<input type="file" nwsaveas nwworkingdir="' + wd + '">');

        elm.trigger('click');

        $(elm).on('change', function (e) {

            projectsManager.changeFileOutput(id, e.currentTarget.files[0].path);

        });
    };

    //Open file with default editor
    $scope.openFile= function(file) {

        require('nw.gui').Shell.openExternal(file);

    };


    //Compile file
    $scope.compile = function(){
        compiler.compile($scope.selectedFile.id);
    };

});