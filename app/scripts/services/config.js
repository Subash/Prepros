/*jshint browser: true, node: true*/
/*global prepros, $*/

prepros.factory('config', function () {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path');

    //Base path
    var basePath = path.dirname(path.normalize(decodeURIComponent(window.location.pathname.slice(1))));

    //Read config file, everything is relative to base path in app.json file
    var appFileUrl = path.join(basePath, '../package.json');
    var appFile = fs.readFileSync(appFileUrl).toString();
    var appData = JSON.parse(appFile).app;

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

    return {
        basePath: basePath,
        projects: projects,
        files: files,
        imports: imports,
        languages: languages,
		user: user,
        dependencies: dependencies,
        version: version
    };

});