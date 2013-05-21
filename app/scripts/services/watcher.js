/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */


/*jshint browser: true, node: true*/
/*global prepros,  _*/

prepros.factory("watcher", function (projectsManager, notification, config, compiler) {

	"use strict";

	var fs = require("fs"),
        watching = [];

	//Function to start watching file
	function startWatching(data) {

		var files = data.files;

		var imports = data.imports;

		//Remove all previous listeners
        _.each(watching, function(filePath){
            fs.unwatchFile(filePath);
        });

        watching = [];


		//Watch files
		_.each(files, function (file) {

			//Prevent multiple events
			var debounceCompile = _.debounce(function () {

                if(file.config.autoCompile){

                    //Compile File
                    compiler.compile(file.id);

                }



			}, 200, true);

            try {

                fs.watchFile(file.input, { persistent: true, interval: 200}, debounceCompile);

                //Push to watching list so it can be closed later
                watching.push(file.input);

            } catch (err) {

                notification.error("Error watching file.", file.input);
            }

		});

		//Watch imports
		_.each(imports, function (imp) {

			//Prevent multiple events
			var debounceCompile = _.debounce(function () {

                _.each(imp.parents, function(parentId){

                    var parentFile = projectsManager.getFileById(parentId);

                    if(!_.isEmpty(parentFile) && parentFile.config.autoCompile) {

                        compiler.compile(parentId);
                    }
                });

			}, 200, true);

			try {

                fs.watchFile(imp.path, { persistent: true, interval: 200}, debounceCompile);

                //Push to watching list so it can be closed later
                watching.push(imp.path);

			} catch (err) {

				notification.error("Error watching imported file.", imp.path);

			}

		});

	}

	return{
		startWatching: startWatching
	};

});

