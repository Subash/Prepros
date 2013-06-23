/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _ , $*/

//App controller
prepros.controller('MainCtrl', function ($scope, $route, $routeParams, $location, storage,
                                        projectsManager, liveServer, watcher, notification) {

    'use strict';

    //Files and projects
    $scope.projects = projectsManager.projects;

    $scope.files = projectsManager.files;

    $scope.imports = projectsManager.imports;

    $scope.selectedFile = {};

    $scope.selectedProject = {};

    $scope.selectedProjectFiles = [];

    $scope.log = notification.log;

    ///File Change
    var throttleFileChange = _.throttle(function(){

        storage.saveFiles($scope.files);

        watcher.startWatching({
            files: $scope.files,
            projects: $scope.projects,
            imports: $scope.imports
        });

    }, 1500);

    //Projects Change
    var throttleProjectsChange = _.throttle(function(){

        storage.saveProjects($scope.projects);
        liveServer.startServing($scope.projects);

    }, 1500);

    //Imports Change
    var throttleImportsChange = _.throttle(function(){

        storage.saveImports($scope.imports);

        watcher.startWatching({
            files: $scope.files,
            projects: $scope.projects,
            imports: $scope.imports
        });

    }, 1500);

    $scope.$watch('files', function(){

        throttleFileChange();

    }, true);

    $scope.$watch('projects', function(){

        throttleProjectsChange();

    }, true);

    $scope.$watch('imports', function(){

        throttleImportsChange();

    }, true);

    //No need to start services because event on $watch is fired at the begining and it will start the services automatically

    $scope.selectedProjectFiles = _.where($scope.files, {pid: $routeParams.pid});

    $scope.$on('dataChange', function (event, data) {

        $scope.projects = data.projects;
        $scope.files = data.files;
        $scope.imports = data.imports;

        if($scope.selectedProject.id){

            var projectExists = _.findWhere($scope.projects, {id: $scope.selectedProject.id});

            if(!projectExists) {

                $scope.selectedProject = {};
                $scope.selectedProjectFiles = [];
                $location.path('/home');

            } else {

                $scope.selectedProjectFiles = _.where($scope.files, {pid: $routeParams.pid});

            }
        }

        if($scope.selectedFile.id){

            var fileExists = _.findWhere($scope.files, {id: $scope.selectedFile.id});

            if (!fileExists) {

                $location.path('/files/' + $scope.selectedFile.pid);

                $scope.selectedFile = {};
            }
        }
    });

    $scope.$on('$routeChangeSuccess', function (){

        $scope.path = $route.current.path;

        if($scope.path === 'files') {

            var projectExists = !_.isEmpty(_.findWhere($scope.projects, {id: $routeParams.pid}));

            //If project id in the url is in the projects list
            if (projectExists) {

                $scope.selectedProject = _.findWhere($scope.projects, {id: $routeParams.pid});

                $scope.selectedProjectFiles = _.where($scope.files, {pid: $routeParams.pid});

                //If url contains file id
                if ($routeParams.fid) {

                    var fileExists = !_.isEmpty(_.findWhere($scope.files, {id: $routeParams.fid}));

                    //If file id is in the file list
                    if (fileExists) {

                        $scope.selectedFile = _.findWhere($scope.files, {id: $routeParams.fid});


                    } else {

                        //If file is not in the file list redirect to project files list
                        $location.path('/files/' + $scope.selectedProject.id);

                    }
                } else {

                    $scope.selectedFile = {};
                }

            } else {

                //If project id is not in the list redirect to home
                $location.path('/home');

            }
        } else {

            $scope.selectedProject = {};

            $scope.selectedProjectFiles = [];
        }

    });


    //Function to clear log
    $scope.clearLog = function(){
        notification.clearLog();
    };

    //Update log on log change event
    $scope.$on('logUpdate', function(e, data) {
        $scope.log = data.log;
    })

});