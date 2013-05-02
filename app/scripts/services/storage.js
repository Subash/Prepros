/*jshint browser: true, node: true*/
/*global prepros,  _, angular */

//Storage
prepros.factory('storage', function (notification, config, $rootScope) {

    'use strict';

	var fs = require('fs-extra');

	//function to save files list
	function saveFiles(files) {

		//Write data to file
        try {

            fs.outputFileSync(config.files, angular.toJson(files, true));

        } catch(e){

            notification.error('Error saving files list.');
        }


	}

	//Function to save project list to json
	function saveProjects(projects) {

        //Write data to file
        try {

            fs.outputFileSync(config.projects, angular.toJson(projects, true));

        } catch(e){

            notification.error('Error saving projects list.');
        }

	}

	//Function to save imports list to json
	function saveImports(imports) {

        //Write data to file
        try {

            fs.outputFileSync(config.imports, angular.toJson(imports, true));

        } catch(e){

            notification.error('Error saving imports list.');
        }

	}

	//Get projects list from projects.json file
	function getProjects() {

		var projects = [];

		//Read Projects file
		if (fs.existsSync(config.projects)) {

			try {

				projects = JSON.parse(fs.readFileSync(config.projects).toString());

			} catch (e) {

				notification.error('Error reading projects list.');

			}

		} else {

			//Create new empty projects file
			saveProjects([]);
		}


		//Remove non existing projects
		var notRemoved = _.filter(projects, function (project) {
			return fs.existsSync(project.path);
		});

		//If some projects are removed
		if (!_.isEqual(projects, notRemoved)) {

			//Save new projects list
			saveProjects(notRemoved);
		}

		return notRemoved;
	}

	//Get files list from files.json file
	function getFiles() {

		var files = [];

		//Read Files
		if (fs.existsSync(config.files)) {
			try {

				files = JSON.parse(fs.readFileSync(config.files).toString());

			} catch (e) {

				notification.error('Error reading files list.');

			}

		} else {

			//Create new empty files list
			saveFiles([]);

		}

		var notRemoved = _.filter(files, function (file) {

			return fs.existsSync(file.input);

		});

		//If some files are removed
		if (!_.isEqual(files, notRemoved)) {

			//Save new projects list
			saveFiles(notRemoved);
		}

		return notRemoved;
	}

	//Get files from files.json file
	function getImports() {

		var imports = [];

		//Read Imports
		if (fs.existsSync(config.imports)) {

			try {

				imports = JSON.parse(fs.readFileSync(config.imports).toString());

			} catch (e) {

				notification.error('Error reading imports list.');

			}

		} else {

			//Create new empty imports list
			saveImports([]);
		}

		var notRemoved = _.filter(imports, function (importedFile) {
			return fs.existsSync(importedFile.path);
		});

		//If some files are removed
		if (!_.isEqual(imports, notRemoved)) {

			//Save new projects list
			saveImports(notRemoved);
		}

		return notRemoved;
	}

    var throttleSave = _.throttle(function(data){
        saveFiles(data.files);
        saveProjects(data.projects);
        saveImports(data.imports);
    }, 2000);

    //Save data
    $rootScope.$on('dataChange', function(event, data){
        throttleSave(data);
    });


	//Return projects list and files list
	return {

		getProjects : getProjects,
		saveProjects: saveProjects,

		getFiles    : getFiles,
		saveFiles   : saveFiles,

		getImports  : getImports,
		saveImports : saveImports
	};
});