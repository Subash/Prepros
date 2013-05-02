/*jshint browser: true, node: true*/
/*global $, prepros,  _ */

//App controller
prepros.controller('AppCtrl', function ($scope, $rootScope, $route, $routeParams, $location, storage, projectsManager, liveRefresh, watcher, utils, config) {

    'use strict';

    //Files and projects
	$scope.projects = projectsManager.projects;

	$scope.files = projectsManager.files;

	$scope.imports = projectsManager.imports;

    $rootScope.$broadcast('initApp', {
        projects: $scope.projects,
        files: $scope.files,
        imports: $scope.imports
    });

    $scope.$on('dataChange', function (event, data) {

        //Apply only if $$phase is not $apply or $digest
        if ($scope.$$phase) {
			handleDataChange(data);
        } else {
            $scope.$apply(function () {
				handleDataChange(data);
            });
        }
    });

    //Update view and data on data change event
    function handleDataChange(data) {

        $scope.projects = data.projects;
        $scope.files = data.files;
        $scope.imports = data.imports;

        //Check if selectedProject was removed from project list
        if ($scope.selectedProject.id && !_.findWhere($scope.projects, {id: $scope.selectedProject.id})) {
            $scope.selectedProject = [];
            $location.path('/home');
        }

        //Check if selectedFile was removed from files list
        if ($scope.selectedFile.id) {
            if (!_.findWhere($scope.files, {id: $scope.selectedFile.id})) {
                $scope.selectedFile = [];

                //If project exists
                if($scope.selectedProject.id) {
                    $location.path('/files/' + $scope.selectedProject.id);
                }
            }
        }
    }

    $scope.$on('$routeChangeSuccess', function () {

        //Get path from route
        $scope.routePath = $route.current.routePath;

        //Remove existing active class from sidebar project list
        $('.sidebar li a').removeClass('active');

        if ($routeParams.pid) {
            $scope.pid = $routeParams.pid;

            $scope.selectedProject = _.findWhere($scope.projects, {id: $routeParams.pid});

            //Add active class to the sidebar project list
            $('.sidebar li a[href^="#/files/' + $routeParams.pid + '"]').addClass('active');
        }

        if (!$routeParams.pid) {

            $scope.selectedProject = [];
        }

        if ($routeParams.fid) {

            $scope.selectedFile = _.findWhere($scope.files, {id: $routeParams.fid});
        }

        if (!$routeParams.fid) {

            $scope.selectedFile = {};
        }
    });

    //Save data on exit
    require('nw.gui').Window.get().on('close', function () {

        this.hide();
        storage.saveFiles($scope.files);
        storage.saveImports($scope.imports);
        storage.saveProjects($scope.projects);
    });

    //Developer tools in development mode
    if(config.debug){

        window.addEventListener('keydown', function (e) {
            if (e.keyIdentifier === 'F12') {
                require('nw.gui').Window.get().showDevTools();
            }
        });
    }

});