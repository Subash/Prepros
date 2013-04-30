/*jshint browser: true, node: true*/
/*global prepros, $*/

prepros.factory('config', function () {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path');

    //Base path
    var basePath = path.dirname(path.normalize(decodeURIComponent(window.location.pathname.slice(1))));

    //Read config file, everything is relative to base bath in app.json file
    var appFileUrl = path.join(basePath, '../package.json');
    var appFile = fs.readFileSync(appFileUrl).toString();
    var appData = JSON.parse(appFile).app;

    var debug = appData.debug;

    var packagePath = path.join(basePath, '..');


    //User data
    var dataPath = path.join(process.env.LOCALAPPDATA, 'Prepros/Data');

    var projects =  path.join(dataPath, 'projects.json'),
        files =  path.join(dataPath, 'files.json'),
        imports = path.join(dataPath, 'imports.json'),
        configFile  = path.join(dataPath, 'config.json');

    var dependencies = appData.dependencies;
    var version = appData.version;

    var languages = {
        ruby: {
            path: path.join(packagePath, appData.ruby.path),
            version: appData.ruby.version
        },
        compass: {
            path: path.join(packagePath, appData.rubygems.compass.path),
            version: appData.rubygems.compass.version
        },
        sass: {
            path: path.join(packagePath, appData.rubygems.sass.path),
            version: appData.rubygems.sass.version
        },
		haml: {
			path: path.join(packagePath, appData.rubygems.haml.path),
			version: appData.rubygems.haml.version
		}
    };

    var user = [];

    if(fs.existsSync(configFile)){

        user  = JSON.parse(fs.readFileSync(configFile).toString());

    } else {

        user = {
            cssPath: 'css',
            jsPath: 'js',
            enableNotifications: true
        };

        fs.outputFile(configFile, angular.toJson(user, true));
    }

    var optionsWindow;

    $('.title-bar .controls .options').on('click', function () {

        global.preprosOptions = {dependencies: dependencies, languages: languages, user: user};

        if(typeof(optionsWindow) === "object"){
            optionsWindow.show();
            optionsWindow.focus();
        } else {
            optionsWindow = require('nw.gui').Window.open("file:///" + basePath + '\\html\\options.html', {
                position: 'center',
                width: 500,
                height: 300,
                frame: true,
                toolbar: false,
                icon: 'app/assets/img/icons/128.png',
                resizable: false
            });

            optionsWindow.on('close', function(){
                user = global.preprosOptions.user;
                this.close(true);
                optionsWindow = undefined;
            });
        }
    });


    require('nw.gui').Window.get().on('close', function () {

        if(typeof(optionsWindow) === 'object') {
            optionsWindow.close();
        }

    });

    //About window
    var aboutWindow;

    $('.title-bar .controls .about').on('click', function () {

        global.preprosAbout = {dependencies: dependencies, languages: languages, version: version};

        if(typeof(aboutWindow) === "object"){
            aboutWindow.show();
            aboutWindow.focus();
        } else {
            aboutWindow = require('nw.gui').Window.open("file:///" + basePath + '\\html\\about.html', {
                position: 'center',
                width: 500,
                height: 520,
                frame: true,
                toolbar: false,
                icon: 'app/assets/img/icons/128.png',
                resizable: false
            });

            aboutWindow.on('close', function(){
                this.close(true);
                aboutWindow = undefined;
            });
        }
    });

    require('nw.gui').Window.get().on('close', function () {

        if(typeof(aboutWindow) === 'object') {
            aboutWindow.close();
        }
    });


    return {
        basePath: basePath,
        debug: debug,
        projects: projects,
        files: files,
        imports: imports,
        languages: languages,
		user: user,
        dependencies: dependencies
    };

});