/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global $script, angular*/

(function () {

    'use strict';

    var jScripts = [];

    var libraries = [
        'jquery.min',
        'underscore.min',
        'bootstrap.min',
        'mousetrap.min',
        'angular.min'
    ];

    var controllers = [
        'MainCtrl',
        'TitleBarCtrl',
        'SidebarCtrl',
        'FilesCtrl'
    ];

    var services = [
        'watcher',
        'compiler',
        'config',
        'liveServer',
        'notification',
        'projectsManager',
        'importsVisitor',
        'importsVisitor',
        'storage',
        'utils',
        'fileTypes'
    ];

    var fileTypes = [
        'less',
        'sass',
        'stylus',
        'markdown',
        'coffee',
        'javascript',
        'jade',
        'haml',
        'slim'
    ];

    var filters = [
        'shorten',
        'interpolatePath'
    ];

    var directives = [
        'tooltip',
        'keyboard-shortcuts',
        'drag-drop-project',
        'log-element',
        'ng-include-when'

    ];

    //Libraries
    libraries.forEach(function(lib) {
        jScripts.push('scripts/libraries/' + lib + '.js');
    });

    //Angularjs App
    jScripts.push('scripts/app.js');

    //Controllers
    controllers.forEach(function(controller) {
        jScripts.push('scripts/controllers/' + controller + '.js');
    });

    //Services
    services.forEach(function (service) {
        jScripts.push('scripts/services/' + service + '.js');
    });

    //File types
    fileTypes.forEach(function (type) {
        jScripts.push('scripts/services/fileTypes/' + type + '.js');
    });

    //Filters
    filters.forEach(function (filter) {
        jScripts.push('scripts/filters/' + filter + '.js');
    });

    //Directives
    directives.forEach(function (directive) {
        jScripts.push('scripts/directives/' + directive + '.js');
    });

    //Load scripts and bootstrap
    $script(jScripts, function () {

        angular.bootstrap(document, ['prepros']);

    });
})();