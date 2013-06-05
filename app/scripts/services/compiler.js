/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, angular*/

prepros.factory("compiler", function (projectsManager, fileTypes, notification, $filter) {

	"use strict";

	var fs = require('fs-extra'),
        path = require('path');

	//function to compile
	function compile(fid) {

		var file = projectsManager.getFileById(fid);

        var ext =  path.extname(file.input).toLowerCase();

        //Replace file.output placeholders with real paths
        var cfg = projectsManager.getProjectConfig(file.pid);

        //Remove angular hash maps so that the change in file here won't affect files in project
        var f = $.parseJSON(angular.toJson(file));

        //Sass compiler requires project path for config.rb file
        if(ext === '.scss' || ext === '.sass') {

            f.projectPath = projectsManager.getProjectById(file.pid).path;
        }

        f.output = $filter('interpolatePath')(file.output, cfg);

        if (fs.existsSync(f.input)) {

            fileTypes.compile(f, function(err, data){

                if(err) {

                    notification.error('Compilation Failed', 'Failed to compile ' + file.name, data);

                } else {

                    notification.success('Compilation Successful', 'Successfully compiled ' + file.name, data);

                }

            });
        }
	}

	return{
		compile      : compile
	};

});

