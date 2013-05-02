/*jshint browser: true, node: true*/
/*global prepros,  _*/

prepros.factory("watcher", function (projectsManager, notification, config, compiler, $rootScope) {

	"use strict";

	var fs = require("fs"),
        watching = [];

	//Function to start watching file
	function startWatching(data) {

		var files = data.files;

		var imports = data.imports;

		//Remove all previous listeners
		if (!_.isEmpty(watching)) {

			_.each(watching, function (watcher) {
				watcher.close();
			});

		}

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

                if(fs.existsSync(file.input)){

                    var watcher = fs.watch(file.input, { persistent: true }, debounceCompile);

                    //Push to watching list so it can be closed later
                    watching.push(watcher);
                }

            } catch (err) {

                notification.error("Error watching file.", file.input);
            }

		});

		//Watch imports
		_.each(imports, function (imp) {

			//Prevent multiple events
			var debounceCompile = _.debounce(function () {

				if(fs.existsSync(imp.path)){

					_.each(imp.parents, function(parent){

                        var parentFile = projectsManager.getFileById(parent);

                        if(!_.isEmpty(parentFile) && parentFile.config.autoCompile) {

                            compiler.compile(parent);
                        }

					});

				}


			}, 200, true);

			try {

                if(fs.existsSync(imp.path)){

                    var watcher = fs.watch(imp.path, { persistent: true }, debounceCompile);

                    //Push to watching list so it can be closed later
                    watching.push(watcher);
                }

			} catch (err) {

				notification.error("Error watching imported file.", imp.path);

			}

		});

	}

    //Start watcher on init event
    $rootScope.$on('initApp', function(event, data){
        startWatching(data);
    });

    var throttleUpdate = _.throttle(startWatching, 2000);

    //Update watcher on data change
    $rootScope.$on('dataChange', function(event, data){
        throttleUpdate(data);
    });

	return{
		startWatching: startWatching
	};

});

