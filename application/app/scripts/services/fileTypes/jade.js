/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('jade', [

    'config',
    'utils',

    function (
        config,
        utils
    ) {

        'use strict';

        var fs = require('fs-extra'),
            path = require('path');

        var format = function (pid, fid, filePath, projectPath) {

            //File name
            var name = path.basename(filePath);

            // Output path
            var output = filePath.replace(/\.jade/gi, config.getUserOptions().htmlExtension);

            var pathRegx = /\\jade\\|\/jade\//gi;

            //Find output path; save to /html folder if file is in /jade folder
            if (filePath.match(pathRegx)) {

                var customOutput = path.normalize(output.replace(pathRegx, path.sep + '{{htmlPath}}' + path.sep));

                if(utils.isFileInsideFolder(projectPath, customOutput)) {
                    output = customOutput;
                }

            }

            return {
                id: fid,
                pid: pid,
                name: name,
                type: 'Jade',
                input: path.relative(projectPath, filePath),
                output: path.relative(projectPath, output),
                config: config.getUserOptions().jade
            };
        };

        var compile = function (file, successCall, errorCall) {

            var jadeCompiler = require('jade');

            var options = {
                filename: file.input,
                pretty: file.config.pretty
            };

            var isJSOutput = (path.extname(file.output) === "js");
            var templateName = file.output.split(path.sep).pop().split(".");
            templateName.pop();
            templateName = templateName.join("_");

            if (isJSOutput) {
                options.client = true;
                options.compileDebug = false;
            }


            fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {
                if (err) {

                    errorCall(err.message);

                } else {

                    try {

                        var fn = jadeCompiler.compile(data.toString(), options);

                        var html;
                        if (isJSOutput) {
                            html = fn.toString();
                            html = "var Templates = Templates || {}\n" + html;
                            html = html.replace(/function anonymous/,"Templates." + templateName + " = function");
                        } else {
                            html = fn({
                                prepros: {
                                    filePath : file.input,
                                    fileOutputPath: file.output,
                                    projectPath: file.projectPath
                                }
                            });
                        }

                        fs.outputFile(file.output, html, function (err) {

                            if (err) {

                                errorCall(err.message);

                            } else {

                                successCall(file.input);

                            }
                        });

                    } catch (e) {

                        errorCall(e.message + '\n' + file.input);
                    }
                }
            });
        };


        return {
            compile: compile,
            format: format
        };

    }
]);
