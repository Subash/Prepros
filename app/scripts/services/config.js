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
    var basePath = path.join(path.dirname(process.execPath), 'app');

    //Package.json file url
    var packageFileUrl = path.join(basePath, '../package.json');

    //Read package.json file and get data of app in prepros object
    var packageData = JSON.parse(fs.readFileSync(packageFileUrl).toString());

    //We need package path because everything is relative to this file
    var packagePath = path.join(basePath, '..');

    var dataPath = '';

    //for windows > vista
    if(process.env.LOCALAPPDATA){

        //User data path
        dataPath = path.join(process.env.LOCALAPPDATA, 'Prepros/Data');

    } else {

        //for windows Xp
        dataPath = path.join(process.env.APPDATA, 'Prepros/Data');

    }

    //User config file
    var configFile = path.join(dataPath, 'config.json');

    //CachePath
    var cachePath = path.join(os.tmpdir(), 'PreprosCache');

    //Node modules required by the app
    var node_modules = packageData.dependencies;

    //App version
    var version = packageData.version;

    //App urls
    var online = {
        url: 'http://alphapixels.com/prepros',
        helpUrl: 'http://alphapixels.com/prepros/docs/',
        loveUrl: 'http://alphapixels.com/prepros#love',
        updateFileUrl: 'http://alphapixels.com/prepros/update.json',
        githubUrl: 'http://github.com/sbspk/prepros',
        authorTwitter: 'http://twitter.com/sbspk',
        authorUrl: 'http://alphapixels.com'
    };

    var ruby  = {};

    //Ruby Executable
    ruby = {
        path: path.join(packagePath, packageData.ruby.path),
        version: packageData.ruby.version
    };

    //Gems
    ruby.gems = {};
    var gemKeys = Object.keys(packageData.ruby.gems);

    _.each(gemKeys, function(key){

        ruby.gems[key] = {

            path: path.join(packagePath, packageData.ruby.gems[key].path),
            version: packageData.ruby.gems[key].version
        };

    });


    //User options
    var userConfig = {};

    //Private function to save user configurations
    function _saveOptions() {

        try {

            fs.outputFileSync(configFile, angular.toJson(userConfig, true));

        } catch(e){

            //Can't use notification api here
            window.alert('Unable to save configuration file.');

        }
    }

    //Read user config
    if (fs.existsSync(configFile)) {

        try {

            userConfig = JSON.parse(fs.readFileSync(configFile).toString());

        } catch(e){

            //Can't use notification api here
            window.alert('Unable to read configuration file.');
        }


    }

    var defaultConfig = {
        cssPath: 'css',
        jsPath: 'js',
        htmlPath: 'html',
        htmlExtension: '.html',
        enableSuccessNotifications: true,
        enableErrorNotifications: true,
        filterPatterns: '',
        useCustomRuby: false,
        customRubyPath: '',


        //Default Less Options
        less : {
            autoCompile: true,
            compress : false,
            lineNumbers: false,
            strictMath: true,
            strictUnits: true
        },

        //Default Sass options
        sass : {
            autoCompile : true,
            lineNumbers : false,
            debug: false,
            compass : false,
            fullCompass: false,
            outputStyle : 'expanded' //compressed, nested, expanded, compact
        },


        //Default Stylus Options
        stylus : {
            autoCompile: true,
            lineNumbers : false,
            nib : false,
            compress : false
        },

        //Default Markdown Options
        markdown : {
            autoCompile: true,
            sanitize: false,
            gfm: true
        },

        //Default Coffeescript Options
        coffee: {
            autoCompile: true,
            bare: false,
            uglify: false
        },

        //Default javascript options
        javascript: {
            autoCompile: true,
            uglify: true
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
            fourSpaceIndent: true,
            format: ':html5' //:xhtml, :html4, :html5, :html
        }
    };

    //Fill in the undefined values from default configurations
    userConfig = _.defaults(userConfig, defaultConfig);

    //Create configuration file if it doesn't exist
    if(!fs.existsSync(configFile)) {

        _saveOptions();

    }

    //Wrap user options in a function to prevent angular data sharing between services
    //If user config data is shared between files changing configuration of one file will affect another file
    function getUserOptions() {

        return $.parseJSON(angular.toJson(userConfig));

    }

    function saveUserOptions(options) {

        userConfig = $.parseJSON(angular.toJson(options));

        _saveOptions();

    }


    var config =  {
        dataPath: dataPath,
        cachePath: cachePath,
        basePath: basePath,
        ruby: ruby,
        node_modules: node_modules,
        online: online,
        version: version,
        getUserOptions: getUserOptions,
        saveUserOptions: saveUserOptions
    };

    //Push to global so other windows can also read configurations
    global.preprosConfig = config;

    return config;

});