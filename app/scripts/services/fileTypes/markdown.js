/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('markdown', function (config, utils) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        _id = utils.id;

    var format = function (filePath, projectPath) {

        //File name
        var name = path.basename(filePath);

        //Relative input path
        var shortInput = path.relative(projectPath, filePath).replace(/\\/g, '/');

        // Output path
        var output = filePath.replace(/\.markdown|\.md/gi, config.getUserOptions().htmlExtension);

        //Find output path; save to user defined html folder if file is in md or markdown folder
        if(filePath.match(/\\md\\|\\markdown\\|\/md\/|\/markdown\//gi)) {

            output = path.normalize(output.replace(/\\md\\|\\markdown\\|\/md\/|\/markdown\//gi, path.sep + '{{htmlPath}}' + path.sep));

        }

        //Find short output path
        var shortOutput = output.replace(/\\/g, '/');

        //Show Relative path if output file is within project folder
        if (path.relative(projectPath, filePath).indexOf('.' + path.sep) === -1) {

            shortOutput = path.relative(projectPath, output).replace(/\\/g, '/');
        }

        return {
            id: _id(filePath),
            pid: _id(projectPath),
            name: name,
            type: 'MD',
            input: filePath,
            shortInput: shortInput,
            output: output,
            shortOutput: shortOutput,
            config: config.getUserOptions().markdown
        };
    };

    var compile = function (file, callback) {

        var marked = require('marked');

        // Set markdown options
        marked.setOptions({
            gfm: file.config.gfm,
            sanitize: file.config.sanitize
        });

        fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {

            if (err) {

                callback(true, err.message);

            } else {

                try {
                    var html = marked(data.toString());

                    fs.outputFile(file.output, html, function (err) {

                        if (err) {

                            callback(true, err.message);

                        } else {

                            callback(false, file.input);

                        }

                    });

                } catch(e) {

                    callback(true, file.input);

                }

            }
        });
    };

    return {
        format: format,
        compile: compile
    };
});