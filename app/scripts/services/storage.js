/*jshint browser: true, node: true*/
/*global prepros,  _, angular */

//Storage
prepros.factory('storage', function (notification, config) {

    'use strict';

	var fs = require('fs-extra'),
        path = require('path');

    //Paths

    var filesPath = path.join(config.dataPath, 'files.json'),
        projectsPath = path.join(config.dataPath, 'projects.json'),
        importsPath = path.join(config.dataPath, 'imports.json');

	//function to save files list
	function saveFiles(files) {

		//Write data to file
        try {

            fs.outputFileSync(filesPath, angular.toJson(files, true));

        } catch(e){

            notification.error('Error saving files list.');
        }


	}

	//Function to save project list to json
	function saveProjects(projects) {

        //Write data to file
        try {

            fs.outputFileSync(projectsPath, angular.toJson(projects, true));

        } catch(e){

            notification.error('Error saving projects list.');
        }

	}

	//Function to save imports list to json
	function saveImports(imports) {

        //Write data to file
        try {

            fs.outputFileSync(importsPath, angular.toJson(imports, true));

        } catch(e){

            notification.error('Error saving imports list.');
        }

	}

	//Get projects list from projects.json file
	function getProjects() {

		var projects = [];

		//Read Projects file
		if (fs.existsSync(projectsPath)) {

			try {

				projects = JSON.parse(fs.readFileSync(projectsPath).toString());

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
		if (fs.existsSync(filesPath)) {
			try {

				files = JSON.parse(fs.readFileSync(filesPath).toString());

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
		if (fs.existsSync(importsPath)) {

			try {

				imports = JSON.parse(fs.readFileSync(importsPath).toString());

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