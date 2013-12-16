/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, curly: false*/
/*global prepros*/

prepros.factory('livescript', [

    '$filter',

    function ($filter) {

        'use strict';

        var fs = require('fs-extra');
        var path = require('path');
        var livescript = require('LiveScript');
        var ugly = require('uglify-js');

        var compile = function (file, project, callback) {

            var input = path.resolve(project.path, file.input);

            var output = (file.customOutput) ? path.resolve(project.path, file.customOutput) : $filter('interpolatePath')(file.input, project);

            var options = {
                bare: file.config.bare
            };

            fs.readFile(input, 'utf8', function (err, data) {

                if (err) return callback(new Error('Unable to read source file\n' + err.message));

                try {

                    var javascript = livescript.compile(data, options);

                    if (file.config.uglify) {

                        javascript = ugly.minify(javascript, {fromString: true, mangle: file.config.mangle}).code;
                    }

                    fs.outputFile(output, javascript, function (err) {

                        if (err) return callback(new Error('Unable to write compiled data. ' + err.message));

                        callback(null, input);

                    });


                } catch (e) {

                    if (err) return callback(new Error(err.message + '\n' + input));
                }
            });


        };


        return {
            compile: compile
        };
    }
]);