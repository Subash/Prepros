/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('haml', function (config, utils) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        cp = require('child_process'),
        _id = utils.id;

    var format = function (pid, fid, filePath, projectPath) {

        //File name
        var name = path.basename(filePath);

        // Output path
        var output = filePath.replace(/\.haml/gi, config.getUserOptions().htmlExtension);

        var pathRegx = /\\haml\\|\/haml\//gi;

        //Find output path; save to /html folder if file is in /haml folder
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
            type: 'Haml',
            input: path.relative(projectPath, filePath),
            output: path.relative(projectPath, output),
            config: config.getUserOptions().haml
        };
    };


    var compile = function (file, successCall, errorCall) {

        var args = config.ruby.getGem('haml');

        //Input and output
        args.push(file.input, file.output);

        //Load path for @imports
        args.push('--load-path', path.dirname(file.input));

        //Output format
        args.push('--format', file.config.format);

        //Output style
        args.push('--style', file.config.outputStyle);

        //Double quote attributes
        if (file.config.doubleQuotes) {
            args.push('--double-quote-attributes');
        }

        fs.mkdirsSync(path.dirname(file.output));

        //Start a child process to compile the file
        var rubyProcess = cp.spawn(config.ruby.getExec('haml'), args);

        rubyProcess.on('error', function (e) {
            errorCall('Unable to execute ruby —error ' + e.message);
        });

        var compileErr = false;

        //If there is a compilation error
        rubyProcess.stderr.on('data', function (data) {

            compileErr = true;

            errorCall(data.toString() + "\n" + file.input);

        });

        //Success if there is no error
        rubyProcess.on('exit', function () {
            if (!compileErr) {

                successCall(file.input);

                rubyProcess.removeAllListeners();

                rubyProcess = null;

            }
        });
    };

    return {
        format: format,
        compile: compile
    };
});