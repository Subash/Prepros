/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, angular, _, $*/

prepros.factory('config', function () {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        os = require('os');

    //Base path
    var basePath = path.join(process.cwd(), 'app');

    //Package.json file url
    var packageFileUrl = path.join(basePath, '../package.json');

    //Read package.json file and get data of app in prepros object
    var packageData = angular.fromJson(fs.readFileSync(packageFileUrl).toString());

    //We need package path because everything is relative to this file
    var packagePath = path.join(basePath, '..');

    //CachePath
    var cachePath = path.join(os.tmpdir(), 'PreprosCache');

    //Node modules required by the app
    var node_modules = packageData.dependencies;

    //Ruby Gems
    var ruby_gems = packageData.ruby.gems;

    //App version
    var version = packageData.version;

    //App urls
    var online = {
        url: 'http://alphapixels.com/prepros',
        helpUrl: 'http://alphapixels.com/prepros/docs/',
        loveUrl: 'http://alphapixels.com/prepros#love',
        updateFileUrl: 'http://prepros.alphapixels.com/update.json',
        githubUrl: 'http://github.com/sbspk/prepros',
        authorTwitter: 'http://twitter.com/sbspk',
        authorUrl: 'http://alphapixels.com'
    };

    //Read user config
    var userConfig = {};
    try {

        userConfig = $.parseJSON(localStorage.PreprosConfig || '{}');

    } catch (e) {

        window.alert('Error Reading Configurations ! Reverting to defaults.');

        saveUserOptions(userConfig);
    }

    var defaultConfig = {
        cssPath: 'css',
        jsPath: 'js',
        htmlPath: 'html',
        jsMinPath: 'min',
        htmlExtension: '.html',
        enableSuccessNotifications: true,
        enableErrorNotifications: true,
        filterPatterns: 'node_modules', //Filter node modules folder by default
        customRuby: {
            use: false,
            path: '',
            sass: false,
            slim: false,
            haml: false
        },

        //Default Less Options
        less: {
            autoCompile: true,
            compress: false,
            lineNumbers: false,
            strictMath: false,
            strictUnits: false
        },

        //Default Sass options
        sass: {
            autoCompile: true,
            lineNumbers: false,
            unixNewlines: false,
            debug: false,
            compass: false,
            fullCompass: false,
            outputStyle: 'expanded' //compressed, nested, expanded, compact
        },


        //Default Stylus Options
        stylus: {
            autoCompile: true,
            lineNumbers: false,
            nib: false,
            compress: false
        },

        //Default Markdown Options
        markdown: {
            autoCompile: true,
            sanitize: false,
            gfm: true
        },

        //Default Coffeescript Options
        coffee: {
            autoCompile: true,
            bare: false,
            uglify: false,
            mangle: true
        },

        //Default Livescript Options
        livescript: {
            autoCompile: true,
            bare: false,
            uglify: false,
            mangle: true
        },

        //Default javascript options
        javascript: {
            autoCompile: true,
            uglify: true,
            mangle: true
        },

        //Default Jade  Options
        jade: {
            autoCompile: true,
            pretty: true
        },

        //Default Haml Options
        haml: {
            autoCompile: true,
            format: 'html5', //xhtml, html5
            outputStyle: 'indented', //indented, ugly
            doubleQuotes: false
        },

        //Default Slim  Options
        slim: {
            autoCompile: true,
            pretty: true,
            indent: 'default', //default, four, tab
            fourSpaceIndent: true,
            format: ':html5' //:xhtml, :html4, :html5, :html
        }
    };

    //Fill in the undefined values from default configurations
    userConfig = _.defaults(userConfig, defaultConfig);

    for (var configKey in userConfig) {

        if (userConfig.hasOwnProperty(configKey) && typeof userConfig[configKey] === 'object') {

            userConfig[configKey] = _.defaults(userConfig[configKey], defaultConfig[configKey]);
        }
    }

    //Wrap user options in a function to prevent angular data sharing between services
    //If user config data is shared between files changing configuration of one file will affect another file
    function getUserOptions() {

        return $.parseJSON(angular.toJson(userConfig, false));

    }

    function saveUserOptions(options) {

        localStorage.setItem('PreprosConfig', angular.toJson(options));

        userConfig = $.parseJSON(angular.toJson(options));
    }

    //Ruby Executable
    var ruby = {
        version: packageData.ruby.version,
        bourbon: path.join(packagePath, packageData.ruby.bourbon),
        neat: path.join(packagePath, packageData.ruby.neat),
        getExec: function (fileType) {
            
            if (userConfig.customRuby.use && userConfig.customRuby.path !== '' && userConfig.customRuby[fileType]) {

                return path.normalize(userConfig.customRuby.path);
            }

            return path.join(packagePath, packageData.ruby.path);

        },
        getGem: function (fileType) {

            var ft = (fileType === 'compass') ? 'sass' : fileType;

            var loader = path.join(basePath, '../bin/gem_loader.rb');

            var gemPath = path.join(packagePath, packageData.ruby.gemPath);

            if (process.platform !== 'win32' && userConfig.customRuby.use && userConfig.customRuby[ft]) {

                return [loader, 'custom', fileType];

            } else if (process.platform === 'win32' && userConfig.customRuby.use && userConfig.customRuby.path !== '' && userConfig.customRuby[ft]) {

                return [loader, 'custom', fileType];

            } else {

                return [loader, gemPath, fileType];

            }
        }
    };

    return {
        cachePath: cachePath,
        basePath: basePath,
        ruby: ruby,
        node_modules: node_modules,
        ruby_gems: ruby_gems,
        online: online,
        version: version,
        getUserOptions: getUserOptions,
        saveUserOptions: saveUserOptions
    };

});
