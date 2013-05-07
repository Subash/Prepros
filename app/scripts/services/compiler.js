/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory("compiler", function (projectsManager, fileTypes) {

	"use strict";

	var fs = require("fs-extra");

	//function to compile
	function compile(fid) {

		var file = projectsManager.getFileById(fid);

		if (fs.existsSync(file.input)) {

			var type = file.type.toLowerCase();

			if (type === "less") {

				fileTypes.less.compile(file);

			} else if (type === "sass" || type === "scss") {

				fileTypes.sass.compile(file);

			} else if (type === "stylus") {

				fileTypes.stylus.compile(file);

			} else if (type === "md") {

				fileTypes.markdown.compile(file);

			} else if (type === "coffee") {

				fileTypes.coffee.compile(file);

			} else if (type === "jade") {

				fileTypes.jade.compile(file);

			} else if (type === "haml") {

				fileTypes.haml.compile(file);

			}

		}
	}

	return{
		compile      : compile
	};

});

