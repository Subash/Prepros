/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, curly: false*/
/*global prepros*/

prepros.factory('jade', [

    '$filter',

    function ($filter) {

        'use strict';

        var fs = require('fs-extra');
        var path = require('path');
        var jade = require('jade');

        var compile = function (file, project, callback) {

            var input = path.resolve(project.path, file.input);

            var output = (file.customOutput) ? path.resolve(project.path, file.customOutput) : $filter('interpolatePath')(file.input, project);

            var options = {
                filename: input,
                pretty: file.config.pretty
            };

            fs.readFile(input, 'utf8', function (err, data) {

                if (err) return callback(new Error('Unable to read source file\n' + err.message));

                try {

                    var html = jade.compile(data, options)({
                        prepros: {
                            input: input,
                            output: output,
                            project: project.path
                        }
                    });

                    fs.outputFile(output, html, function (err) {

                        if (err) return callback(new Error('Unable to write compiled data. ' + err.message));

                        callback(null, input);

                    });

                } catch (err) {

                    callback(new Error(err.message + '\n' + input));
                }
            });
        };


        return {
            compile: compile
        };

    }
]);
