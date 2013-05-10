/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _ , $*/

//Title Bar controls
prepros.controller('FilesCtrl', function ($scope, compiler, projectsManager) {

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


    //Compile file
    $scope.compile = function(){
        compiler.compile($scope.selectedFile.id);
    }

});