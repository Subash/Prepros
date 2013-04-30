/*jshint browser: true, node: true*/
/*global $, prepros,  _ */

//App controller
prepros.controller('AppCtrl', function ($scope, $route, $routeParams, $location, storage, projectsManager, watcher, compiler, liveRefresh, utils) {

    'use strict';

    var fs = require('fs'),
        path = require('path'),
        md5 = require('MD5');

    //Files and projects
	$scope.projects = projectsManager.projects;

	$scope.files = projectsManager.files;

	$scope.imports = projectsManager.imports;

    $scope.compile = compiler.compile;

    //Start watching files
    watcher.startWatching({

        projects: $scope.projects,
        files: $scope.files,
        imports: $scope.imports

    });

    //Start live refreshing
    liveRefresh.startServing($scope.projects);

    var debounceStartServices = _.debounce(function(){

        //Start watching files
        watcher.startWatching({

            projects: $scope.projects,
            files: $scope.files,
            imports: $scope.imports

        });

        liveRefresh.startServing($scope.projects);

    }, 1000);

    //Throttle data saving
    var throttleDataSave  = _.throttle(function(){

        storage.saveFiles($scope.files);
        storage.saveProjects($scope.projects);
        storage.saveImports($scope.imports);

    }, 1000);

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

        debounceStartServices();

        //Save data
        throttleDataSave();

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

    //function to show project settings
    $scope.showOptions = function(){

        $('.project-options').slideDown('fast');

    };

    $scope.saveOptions = function(){

        $('.project-options').slideUp('fast');

        storage.saveProjects($scope.projects);

        liveRefresh.startServing($scope.projects);

    };

    //Save data on exit
    utils.nw.window.on('close', function () {

        this.hide();
        storage.saveFiles($scope.files);
        storage.saveImports($scope.imports);
        storage.saveProjects($scope.projects);

    });
});