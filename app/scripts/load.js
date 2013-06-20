/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global $LAB, angular*/

(function () {

    'use strict';

    var jScripts = [];

    var libraries = [
        'jquery.min',
        'underscore.min',
        'bootstrap.min',
        'mousetrap.min',
        'angular'
    ];

    var controllers = [
        'MainCtrl',
        'TitleBarCtrl',
        'SidebarCtrl',
        'FilesCtrl',
        'AboutCtrl'
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
        'drop-project',
        'tabs',
        'show-modal-on-click'

    ];

    //Libraries
    libraries.forEach(function(lib) {
        jScripts.push('scripts/libraries/' + lib + '.js');
    });

    //Angularjs App
    jScripts.push('scripts/app.js');

    //Services
    services.forEach(function (service) {
        jScripts.push('scripts/services/' + service + '.js');
    });

    //File types
    fileTypes.forEach(function (type) {
        jScripts.push('scripts/services/fileTypes/' + type + '.js');
    });

    //Controllers
    controllers.forEach(function(controller) {
        jScripts.push('scripts/controllers/' + controller + '.js');
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
    $LAB.setOptions({AlwaysPreserveOrder:true});

    $LAB.script(jScripts)
        .wait(function(){
            angular.bootstrap(document, ['prepros']);
        });
})();