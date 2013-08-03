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

    var format = function (pid, fid, filePath, projectPath) {

        //File name
        var name = path.basename(filePath);

        // Output path
        var output = filePath.replace(/\.markdown|\.md/gi, config.getUserOptions().htmlExtension);

        var pathRegx = /\\md\\|\\markdown\\|\/md\/|\/markdown\//gi;

        //Find output path; save to user defined html folder if file is in md or markdown folder
        if (filePath.match(pathRegx)) {

            var customOutput = path.normalize(output.replace(pathRegx, path.sep + '{{htmlPath}}' + path.sep));

            if(utils.isFileInsideFolder(projectPath, output)) {
                output = customOutput;
            }

        }

        return {
            id: fid,
            pid: pid,
            name: name,
            type: 'MD',
            input: path.relative(projectPath, filePath),
            output: path.relative(projectPath, output),
            config: config.getUserOptions().markdown
        };
    };

    var compile = function (file, successCall, errorCall) {

        var marked = require('marked');

        // Set markdown options
        marked.setOptions({
            gfm: file.config.gfm,
            sanitize: file.config.sanitize
        });

        fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {

            if (err) {

                errorCall(err.message);

            } else {

                try {
                    var html = marked(data.toString());

                    fs.outputFile(file.output, html, function (err) {

                        if (err) {

                            errorCall(err.message);

                        } else {

                            successCall(file.input);

                        }

                    });

                } catch (e) {

                    errorCall(file.input);

                }

            }
        });
    };

    return {
        format: format,
        compile: compile
    };
});