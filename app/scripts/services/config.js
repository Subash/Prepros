/*jshint browser: true, node: true*/
/*global prepros, angular, _*/

prepros.factory('config', function () {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path');

    //Base path
    var basePath = path.dirname(path.normalize(decodeURIComponent(window.location.pathname.slice(1))));

    //Package.json file url
    var packageFileUrl = path.join(basePath, '../package.json');

    //Read package.json file and get data of app in prepros object
    var packageData = JSON.parse(fs.readFileSync(packageFileUrl).toString()).prepros;

    //We need package path because everything is relative to this file
    var packagePath = path.join(basePath, '..');

    //User data path
    var dataPath = path.join(process.env.LOCALAPPDATA, 'Prepros/Data');

    //User config file
    var configFile = path.join(dataPath, 'config.json');

    //Node modules required by the app
    var node_modules = packageData.node_modules;

    //App version
    var version = packageData.version;

    //App urls
    var online = {
        url: 'http://alphapixels.com/prepros',
        helpUrl: 'http://alphapixels.com/prepros',
        loveUrl: 'http://alphapixels.com/prepros#love',
        updateFileUrl: 'http://alphapixels.com/prepros/update.json'
    };

    var ruby = {

        path: path.join(packagePath, packageData.ruby.path),
        version: packageData.ruby.version,

        gems: {
            compass: {
                path: path.join(packagePath, packageData.ruby.gems.compass.path),
                version: packageData.ruby.gems.compass.version
            },
            sass: {
                path: path.join(packagePath, packageData.ruby.gems.sass.path),
                version: packageData.ruby.gems.sass.version
            },
            bourbon: {
                path: path.join(packagePath, packageData.ruby.gems.bourbon.path),
                version: packageData.ruby.gems.bourbon.version
            },
            haml: {
                path: path.join(packagePath, packageData.ruby.gems.haml.path),
                version: packageData.ruby.gems.haml.version
            },
            kramdown: {
                path: path.join(packagePath, packageData.ruby.gems.kramdown.path),
                version: packageData.ruby.gems.kramdown.version
            },
            susy: {
                path: path.join(packagePath, packageData.ruby.gems.susy.path),
                version: packageData.ruby.gems.susy.version
            }
        }
    };

    var user = {};


    var saveOptions = function () {

        try {
            fs.outputFileSync(configFile, angular.toJson(user, true));
        } catch(e){

            //Can't use notification api here
            window.alert('Unable to save configuration file.');

        }
    };

    //Read user config
    if (fs.existsSync(configFile)) {

        try {
            user = JSON.parse(fs.readFileSync(configFile).toString());
        } catch(e){
            //Can't use notification api here
            window.alert('Unable to read configuration file.');
        }


    }

    //Check if user config file is compatible with this version configurations
    if(_.isEmpty(user) || !user.less) {

        //Default Options For User
        user = {
            cssPath: 'css',
            jsPath: 'js',
            htmlExtension: '.html',
            enableNotifications: true,


            //Default Less Options
            less : {
                autoCompile: true,
                compress : true,
                lineNumbers: false
            },

            //Default Scss options
            scss : {
                autoCompile : true,
                lineNumbers : false,
                compass : false,
                outputStyle : 'compressed' //compressed, nested, expanded
            },

            //Default Sass options
            sass : {
                autoCompile : true,
                lineNumbers : false,
                compass : false,
                outputStyle : 'compressed' //compressed, nested, expanded
            },


            //Default Stylus Options
            stylus : {
                autoCompile: true,
                lineNumbers : false,
                nib : false,
                compress : true
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
                uglify: false
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
            }
        };

        saveOptions();
    }


    return {
        dataPath: dataPath,
        basePath: basePath,
        ruby: ruby,
        node_modules: node_modules,
        online: online,
        user: user,
        version: version,
        saveOptions: saveOptions
    };

});