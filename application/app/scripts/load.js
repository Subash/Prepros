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
        'jquery-ui.min',
        'underscore.min',
        'bootstrap.min',
        'backbone.min',
        'backbone-notifier.min',
        'mousetrap.min',
        'qrcode.min',
        'angular',
        'angular-ui.min'
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
        'copy-selected-text',
        'popover'
    ];

    //Libraries
    libraries.forEach(function (lib) {
        jScripts.push('vendor/' + lib + '.js');
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
    controllers.forEach(function (controller) {
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
    $LAB.setOptions({AlwaysPreserveOrder: true});

    $LAB.script(jScripts)
        .wait(function () {
            angular.bootstrap(document, ['prepros']);
        });
}