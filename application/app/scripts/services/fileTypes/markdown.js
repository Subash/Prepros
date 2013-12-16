/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, curly: false*/
/*global prepros*/

prepros.factory('markdown', [

    '$filter',

    function ($filter) {

        'use strict';

        var fs = require('fs-extra');
        var path = require('path');
        var marked = require('marked');

        var compile = function (file, project, callback) {

            var input = path.resolve(project.path, file.input);

            var output = (file.customOutput) ? path.resolve(project.path, file.customOutput) : $filter('interpolatePath')(file.input, project);

            marked.setOptions({
                gfm: file.config.gfm,
                sanitize: file.config.sanitize
            });

            fs.readFile(input, 'utf8', function (err, data) {

                if (err) return callback(new Error('Unable to read source file\n' + err.message));

                try {

                    var html = marked(data.toString());

                    fs.outputFile(output, html, function (err) {

                        if (err) return callback(new Error('Unable to write compiled data. ' + err.message));

                        callback(null, input);

                    });

                } catch (err) {

                    if (err) return callback(new Error('Unable to write compiled data. ' + err.message));

                }
            });
        };


        return {
            compile: compile
        };
    }
]);