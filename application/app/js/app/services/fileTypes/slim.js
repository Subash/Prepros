/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('slim', function (config, utils) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        cp = require('child_process'),
        _id = utils.id;

    var format = function (pid, fid, filePath, projectPath) {

        //File name
        var name = path.basename(filePath);

        //Relative input path
        var shortInput = path.relative(projectPath, filePath);

        // Output path
        var output = filePath.replace(/\.slim/gi, config.getUserOptions().htmlExtension);

        var pathRegx = /\\slim\\|\/slim\//gi;

        //Find output path; save to /html folder if file is in /slim folder
        if (filePath.match(pathRegx)) {

            output = path.normalize(output.replace(pathRegx, path.sep + '{{htmlPath}}' + path.sep));

        }

        return {
            id: fid,
            pid: pid,
            name: name,
            type: 'Slim',
            input: filePath,
            shortInput: shortInput,
            output: output,
            config: config.getUserOptions().slim
        };
    };


    var compile = function (file, successCall, errorCall) {

        var args = config.ruby.getGem('slim');

        args.push('-oformat=' + file.config.format);

        if (file.config.indent === 'four') {

            args.push('-oindent="    "');

        } else if (file.config.indent === 'tab') {

            args.push('-oindent="\t"');

        }

        //Input and output
        args.push(file.input, file.output);

        //Pretty
        if (file.config.pretty) {

            args.push('--pretty');
        }

        fs.mkdirsSync(path.dirname(file.output));

        //Start a child process to compile the file
        var rubyProcess = cp.spawn(config.ruby.getExec('slim'), args, {cwd: path.dirname(file.input)});

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

            }

            rubyProcess.removeAllListeners();

            rubyProcess = null;
        });
    };

    return {
        format: format,
        compile: compile
    };
});