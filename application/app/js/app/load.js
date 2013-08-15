/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global $LAB, angular*/

function bootstrapPrepros() {

    'use strict';

    var jScripts = [];

    var libraries = [
        'jquery.min',
        'underscore.min',
        'bootstrap.min',
        'backbone.min',
        'backbone-notifier.min',
        'mousetrap.min',
        'angular'
    ];

    var controllers = [
        'MainCtrl',
        'TitlebarCtrl',
        'SidebarCtrl',
        'FilesCtrl',
        'AboutCtrl',
        'LogCtrl',
        'MultiDeviceCtrl',
        'OptimImageCtrl'
    ];

    var services = [
        'watcher',
        'compiler',
        'config',
        'liveServer',
        'notification',
        'projectsManager',
        'importsVisitor',
        'storage',
        'utils',
        'fileTypes',
        'exceptionHandler'
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
        'slim',
        'livescript'
    ];

    var filters = [
        'shorten',
        'interpolatePath',
        'prettyPath',
        'fullPath'
    ];

    var directives = [
        'tooltip',
        'keyboard-shortcuts',
        'drop-project',
        'tabs',
        'show-modal-on-click',
        'project-context-menu',
        'file-context-menu',
        'copy-selected-text'
    ];

    //Libraries
    libraries.forEach(function (lib) {
        jScripts.push('js/vendor/' + lib + '.js');
    });

    //Angularjs App
    jScripts.push('js/app/app.js');

    //Services
    services.forEach(function (service) {
        jScripts.push('js/app/services/' + service + '.js');
    });

    //File types
    fileTypes.forEach(function (type) {
        jScripts.push('js/app/services/fileTypes/' + type + '.js');
    });

    //Controllers
    controllers.forEach(function (controller) {
        jScripts.push('js/app/controllers/' + controller + '.js');
    });

    //Filters
    filters.forEach(function (filter) {
        jScripts.push('js/app/filters/' + filter + '.js');
    });

    //Directives
    directives.forEach(function (directive) {
        jScripts.push('js/app/directives/' + directive + '.js');
    });

    //Load scripts and bootstrap
    $LAB.setOptions({AlwaysPreserveOrder: true});

    $LAB.script(jScripts)
        .wait(function () {
            angular.bootstrap(document, ['prepros']);
        });
}