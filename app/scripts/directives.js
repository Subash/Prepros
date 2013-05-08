/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap */

'use strict';

//Drag and drop directive
prepros.directive('dropTarget', function (projectsManager) {

    return {

        restrict: 'A',
        link: function (scope, element) {

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
    };
});

//Directive to add new project
prepros.directive('addProject', function (projectsManager) {

    return {
        restrict: 'A',
        link: function (scope, element) {

            var fs = require('fs'),
                path = require('path');

            Mousetrap.bind('ctrl+n', function() {
                element.trigger('click');
                return false;
            });

            element.on('click', function () {

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
            });
        }
    };
});

//Directive to change file output directory
prepros.directive('changeFileOutput', function (projectsManager) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var fs = require('fs'),
                path = require('path');

            element.on('click', function (event) {

                event.preventDefault();
                event.stopPropagation();

                var wd;

                var file = projectsManager.getFileById(attrs.changeFileOutput),
                    project = projectsManager.getProjectById(file.pid);


                if (fs.existsSync(path.dirname(file.output))) {
                    wd = path.dirname(file.output);
                } else {
                    wd = project.path;
                }

                var elm = $('<input type="file" nwsaveas nwworkingdir="' + wd + '">');

                elm.trigger('click');

                $(elm).on('change', function (e) {

                    projectsManager.changeFileOutput(attrs.changeFileOutput, e.currentTarget.files[0].path);

                });
            });
        }
    };
});

//Directive to refresh project files
prepros.directive('refreshProjectFiles', function (projectsManager) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            Mousetrap.bind(['ctrl+r', 'f5'], function() {
                if(scope.selectedProject.id){
                    element.trigger('click');
                }
                return false;
            });

            element.on('click', function (event) {

                event.preventDefault();
                event.stopPropagation();

                projectsManager.refreshProjectFiles(attrs.refreshProjectFiles);

            });
        }
    };
});

//Directive to open live project url
prepros.directive('openLiveUrl', function (liveRefresh, projectsManager) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            Mousetrap.bind('ctrl+l', function() {
                if(scope.selectedProject.id){
                    element.trigger('click');
                }
                return false;
            });

            element.on('click', function (event) {
                event.preventDefault();
                event.stopPropagation();

                var url = liveRefresh.getLiveUrl(projectsManager.getProjectById(attrs.openLiveUrl));

                require('child_process').spawn('explorer', [ url ], {detached: true});

            });
        }
    };
});

//Directive to open live project url
prepros.directive('removeProject', function (projectsManager) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            Mousetrap.bind('ctrl+d', function() {
                if(scope.selectedProject.id){
                    element.trigger('click');
                }
                return false;
            });

            element.on('click', function (event) {
                event.preventDefault();
                event.stopPropagation();

                projectsManager.removeProject(attrs.removeProject);

            });
        }
    };
});


//Tooltip directive
prepros.directive('tooltip', function ($timeout) {

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            $timeout(function(){

                element.tooltip({delay: 500, title: attrs.tooltip, container: 'body'});

            });

        }
    };

});

//Tooltip directive
prepros.directive('compile', function (compiler, projectsManager) {

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            Mousetrap.bind('ctrl+shift+c', function() {
                if(scope.selectedProject.id){

                    var projects = projectsManager.getProjectFiles(scope.selectedProject.id);

                    _.each(projects, function(project){

                        compiler.compile(project.id);

                    });
                }
                return false;
            });

            Mousetrap.bind('ctrl+c', function() {

                if(scope.selectedFile.id){

                    compiler.compile(scope.selectedFile.id);
                }

                return false;
            });



            element.on('click', function () {

                compiler.compile(attrs.compile);

            });

        }
    };

});

//Show Project Options directive
prepros.directive('showProjectOptions', function () {

    return {
        restrict: 'A',
        link: function (scope, element) {

            element.on('click', function (event) {
                event.preventDefault();
                event.stopPropagation();

                $('.project-options').slideDown('fast');

            });
        }
    };

});

//Save Project Options directive
prepros.directive('saveProjectOptions', function (storage, liveRefresh) {

    return {
        restrict: 'A',
        link: function (scope, element) {

            element.on('click', function (event) {
                event.preventDefault();
                event.stopPropagation();

                $('.project-options').slideUp('fast');

                storage.saveProjects(scope.projects);

                liveRefresh.startServing(scope.projects);

            });
        }
    };

});

//Directive to show options window
prepros.directive('openOptionsWindow', function (config) {

    return {
        restrict: 'A',
        link: function (scope, element) {

            var optionsWindow;

            element.on('click', function () {

                global.preprosOptions = {user: config.user};

                if (typeof(optionsWindow) === "object") {
                    optionsWindow.show();
                    optionsWindow.focus();
                } else {
                    optionsWindow = require('nw.gui').Window.open("file:///" + config.basePath + '\\html\\options.html', {
                        position: 'center',
                        width: 500,
                        height: 300,
                        frame: true,
                        toolbar: false,
                        icon: 'app/assets/img/icons/128.png',
                        resizable: false
                    });

                    optionsWindow.on('close', function () {
                        config.user = global.preprosOptions.user;
                        this.close(true);
                        optionsWindow = undefined;
                    });
                }
            });

            //Close options window when main window is closed
            require('nw.gui').Window.get().on('close', function () {

                if(typeof(optionsWindow) === 'object') {
                    optionsWindow.close();
                }

            });
        }
    };

});


//Directive to show about window
prepros.directive('openAboutWindow', function (config) {

    return {
        restrict: 'A',
        link: function (scope, element) {

            //About window
            var aboutWindow;

            element.on('click', function () {

                global.preprosAbout = {dependencies: config.dependencies, languages: config.languages, version: config.version};

                if(typeof(aboutWindow) === "object"){
                    aboutWindow.show();
                    aboutWindow.focus();
                } else {
                    aboutWindow = require('nw.gui').Window.open("file:///" + config.basePath + '\\html\\about.html', {
                        position: 'center',
                        width: 500,
                        height: 520,
                        frame: true,
                        toolbar: false,
                        icon: 'app/assets/img/icons/128.png',
                        resizable: false
                    });

                    aboutWindow.on('close', function(){
                        this.close(true);
                        aboutWindow = undefined;
                    });
                }
            });

            //Close about window when main window is closed
            require('nw.gui').Window.get().on('close', function () {

                if(typeof(aboutWindow) === 'object') {
                    aboutWindow.close();
                }
            });
        }
    };

});

//Directive to show log window
prepros.directive('openLogWindow', function (config) {

    return {
        restrict: 'A',
        link: function (scope, element) {

            //Log window
            var logWindow;

            //Push to global so notification can trigger click event to open log
            global.logElement = element;

            element.on('click', function () {

                if(typeof(logWindow) === 'object') {
                    logWindow.focus();
                    logWindow.show();
                } else {
                    logWindow = require('nw.gui').Window.open("file:///" + config.basePath + '\\html\\log.html', {
                        position: 'center',
                        width: 800,
                        height: 500,
                        frame: true,
                        toolbar: false,
                        icon: 'app/assets/img/icons/128.png',
                        resizable: false
                    });

                    logWindow.on('close', function(){
                        this.close(true);
                        logWindow = undefined;
                    });
                }
            });

            //Close log window when main window close
            require('nw.gui').Window.get().on('close', function () {

                if(typeof(logWindow) === 'object') {
                    logWindow.close();
                }

            });
        }
    };

});