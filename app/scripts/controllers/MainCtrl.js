/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _ , $*/

//App controller
prepros.controller('MainCtrl', function ($scope, $rootScope, $route, $routeParams, $location, storage,
                                        projectsManager, liveServer, watcher) {

    'use strict';

    //Files and projects
    $scope.projects = projectsManager.projects;

    $scope.files = projectsManager.files;

    $scope.imports = projectsManager.imports;

    $scope.selectedFile = {};

    $scope.selectedProject = {};

    $scope.selectedProjectFiles = [];

    ///File Change
    var throttleFileChange = _.throttle(function(){

        storage.saveFiles($scope.files);
        watcher.startWatching({files: $scope.files, projects: $scope.projects, imports: $scope.imports});

    }, 1500);

    //Projects Change
    var throttleProjectsChange = _.throttle(function(){

        storage.saveProjects($scope.projects);
        liveServer.startServing($scope.projects);

    }, 1500);

    //Imports Change
    var throttleImportsChange = _.throttle(function(){

        storage.saveImports($scope.imports);
        watcher.startWatching({files: $scope.files, projects: $scope.projects, imports: $scope.imports});

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

    //Save data on change
    function dataChange(data){

        $scope.projects = data.projects;
        $scope.files = data.files;
        $scope.imports = data.imports;

        //Check if selectedProject was removed from project list
        if ($scope.selectedProject.id && !_.findWhere($scope.projects, {id: $scope.selectedProject.id})) {

            $scope.selectedProject = {};
            $scope.selectedProjectFiles = [];
            $location.path('/home');
        }

        //Check if selectedFile was removed from files list
        if ($scope.selectedFile.id) {
            if (!_.findWhere($scope.files, {id: $scope.selectedFile.id})) {

                $scope.selectedFile = {};

                //If project exists
                if ($scope.selectedProject.id) {
                    $location.path('/files/' + $scope.selectedProject.id);
                }
            }
        }
    }

    $scope.$on('dataChange', function (event, data) {

        //Force view update if it is not updated automatically
        if (!$scope.$$phase){
            $scope.$apply(function(){
                dataChange(data);
            });
        } else {
            dataChange(data);
        }

    });

    $scope.$on('$routeChangeSuccess', function () {

        //Get path from route
        $scope.routePath = $route.current.routePath;

        //If url contains project id
        if ($routeParams.pid) {

            //If project id in the url is in the projects list
            if (!_.isEmpty(_.findWhere($scope.projects, {id: $routeParams.pid}))) {

                $scope.selectedProject = _.findWhere($scope.projects, {id: $routeParams.pid});

                $scope.selectedProjectFiles = _.where($scope.files, {pid: $routeParams.pid});

                //If url contains file id
                if ($routeParams.fid) {

                    //If file id is in the file list
                    if (!_.isEmpty(_.findWhere($scope.files, {id: $routeParams.fid}))) {

                        $scope.selectedFile = _.findWhere($scope.files, {id: $routeParams.fid});

                        //If file is ot in the file list redirect to project files list
                    } else {

                        $location.path('/files/' + $scope.selectedProject.id);

                    }
                } else {

                    $scope.selectedFile = {};
                }

                //If project id is not in the list redirect to home
            } else {

                $location.path('/home');

            }
        } else {

            $scope.selectedProject = {};

            $scope.selectedProjectFiles = [];
        }
    });
});