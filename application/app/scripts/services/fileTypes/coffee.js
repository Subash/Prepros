/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('coffee', function (config, utils) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        _id = utils.id;


    var format = function (pid, fid, filePath, projectPath) {

        //File name
        var name = path.basename(filePath);

        // Output path
        var output = filePath.replace(/\.coffee/gi, '.js');

        var pathRegx = /\\coffee\\|\/coffee\//gi;

        //Find output path; save to /js folder if file is in /coffee folder
        if (filePath.match(pathRegx)) {

            var customOutput = path.normalize(output.replace(pathRegx, path.sep + '{{jsPath}}' + path.sep));

            if(utils.isFileInsideFolder(projectPath, customOutput)) {
                output = customOutput;
            }

        }

        return {

            id: fid,
            pid: pid,
            name: name,
            type: 'Coffee',
            input: path.relative(projectPath, filePath),
            output: path.relative(projectPath, output),
            config: config.getUserOptions().coffee
        };
    };

    var compile = function (file, successCall, errorCall) {

        var coffee = require('coffee-script');

        var ugly = require('uglify-js');

        var options = {};

        if (file.config.bare) {

            options.bare = true;
        }

        fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {
            if (err) {

                errorCall(err.message);

            } else {

                try {

                    var javascript = coffee.compile(data.toString(), options);

                    if (file.config.uglify) {

                        javascript = ugly.minify(javascript, {fromString: true, mangle: file.config.mangle}).code;
                    }

                    fs.outputFile(file.output, javascript, function (err) {

                        if (err) {

                            errorCall(err.message);

                        } else {

                            successCall(file.input);

                        }

                    });


                } catch (e) {

                    errorCall(e.message + "\n" + file.input);
                }
            }
        });
    };

    return {
        format: format,
        compile: compile
    };
});