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

	var fs = require("fs-extra");

	//function to compile
	function compile(fid) {

		var file = projectsManager.getFileById(fid);

        var type =  file.type.toLowerCase();

        //Map file type with compiler
        var typeMap = {
            less: 'less',
            sass: 'sass',
            scss: 'sass',
            stylus: 'stylus',
            md : 'markdown',
            coffee: 'coffee',
            jade: 'jade',
            haml: 'haml',
            slim: 'slim'
        };

        //Sass compiler requires project path for config.rb file
        if(type === 'scss' || type === 'sass') {

            file.projectPath = projectsManager.getProjectById(file.pid).path;

        }

        if (fs.existsSync(file.input)) {

            fileTypes[typeMap[type]].compile(file, function(err, data){

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

