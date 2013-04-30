/*jshint browser: true, node: true*/
/*global nw, prepros, $, _, angular */

'use strict';

//Drag and drop directive
prepros.directive('dropTarget', function (projectsManager) {

    return {

        restrict: 'A',
        link: function (scope, element, attrs) {

            var fs = require('fs'),
                path = require('path');

            //Add project on file drop
            element.on('drop', function (e) {

                e.preventDefault();

                var oe = e.originalEvent;

                //Get files or folders
                var files = oe.dataTransfer.files;

                //Iterate through each file/folder
                _.each(files, function (file) {

                    //Get stats
                    var stats = fs.statSync(file.path);

                    //Check if it is a directory and not a drive
                    if (stats.isDirectory() && path.dirname(file.path) !== file.path) {

                        //Add to projects
                        projectsManager.addProject(file.path);
                    }
                });
            });
        }
    }
});

//Directive to add new project
prepros.directive('addProject', function (projectsManager) {

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var fs = require('fs'),
                path = require('path');

            element.on('click', function(){

                event.preventDefault();
                event.stopPropagation();

                var elm = $('<input type="file" nwdirectory>');

                elm.trigger('click');

                $(elm).on('change', function (e) {

                    var files = e.currentTarget.files;

                    _.each(files, function (file) {

                        //Get stats
                        var stats = fs.statSync(file.path);

                        //Check if it is a directory and not a drive
                        if (stats.isDirectory() && path.dirname(file.path) !== file.path) {

                            //Add to projects
                            projectsManager.addProject(file.path);
                        }
                    });

                });
            })
        }
    }
});

//Directive to change file output directory
prepros.directive('changeFileOutput', function(projectsManager){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){

            var fs = require('fs'),
                path = require('path');

            element.on('click', function(event){

                event.preventDefault();
                event.stopPropagation();

                var wd;

                var file = projectsManager.getFileById(attrs.changeFileOutput),
                    project = projectsManager.getProjectById(file.pid);


                if(fs.existsSync(path.dirname(file.output))){
                    wd = path.dirname(file.output);
                } else {
                    wd = project.path;
                }

                var elm = $('<input type="file" nwsaveas nwworkingdir="' + wd + '">');

                elm.trigger('click');

                $(elm).on('change', function(e){

                    projectsManager.changeFileOutput(attrs.changeFileOutput, e.currentTarget.files[0].path)

                });
            });
        }
    }
});

//Directive to refresh project files
prepros.directive('refreshProjectFiles', function(projectsManager){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            element.on('click', function(event){

                event.preventDefault();
                event.stopPropagation();

                projectsManager.refreshProjectFiles(attrs.refreshProjectFiles);

            })
        }
    }
});

//Directive to open live project url
prepros.directive('openLiveUrl', function(liveRefresh, projectsManager){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){

            element.on('click', function(event){
                event.preventDefault();
                event.stopPropagation();

                var url = liveRefresh.getLiveUrl(projectsManager.getProjectById(attrs.openLiveUrl));

                require('child_process').spawn('explorer', [ url ], {detached: true});

            });
        }
    }
});

//Directive to open live project url
prepros.directive('removeProject', function(projectsManager){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){

            element.on('click', function(event){
                event.preventDefault();
                event.stopPropagation();

                projectsManager.removeProject(attrs.removeProject);

            });
        }
    }
});


//Tooltip directive
prepros.directive('tooltip', function(){

    return {
        restrict: 'A',
        link: function(scope, element, attrs){

            element.tooltip({delay: 500, title: attrs.tooltip});

        }
    };

});