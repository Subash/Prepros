/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory("compiler", function (projectsManager, fileTypes, notification) {

	"use strict";

	var fs = require('fs-extra'),
        path = require('path');

	//function to compile
	function compile(fid) {

		var file = projectsManager.getFileById(fid);

        var ext =  path.extname(file.input).toLowerCase();

        //Sass compiler requires project path for config.rb file
        if(ext === '.scss' || ext === '.sass') {

            file.projectPath = projectsManager.getProjectById(file.pid).path;

        }

        if (fs.existsSync(file.input)) {

            fileTypes.compile(file, function(err, data){

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

