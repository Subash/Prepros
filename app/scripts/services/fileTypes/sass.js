/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('sass', function (config, utils, notification) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        cp = require('child_process'),
        _id = utils.id;


    var format = function (filePath, projectPath) {

        //File name
        var name = path.basename(filePath);

        //Relative input path
        var shortInput = path.relative(projectPath, filePath).replace(/\\/g, '/');

        // Output path
        var output = filePath.replace(/\.sass|\.scss/gi, '.css');

        //Find output path; save to user defined css folder if file is in scss or sass folder
        if (path.basename(path.dirname(filePath)).toLowerCase() === 'sass' ||
            path.basename(path.dirname(filePath)).toLowerCase() === 'scss') {

            output = path.dirname(path.dirname(filePath)) + '\\' + config.user.cssPath + '\\' + path.basename(filePath)
                .replace(/\.sass|\.scss/gi, '.css');
        }

        //Find short output path
        var shortOutput = filePath.replace(/\.sass|\.scss/gi, '.css').replace(/\\/g, '/');

        //Show Relative path if output file is within project folder
        if (path.relative(projectPath, filePath).indexOf('.\\') === -1) {

            shortOutput = path.relative(projectPath, output).replace(/\.sass|\.scss/gi, '.css').replace(/\\/g, '/');
        }

        var file = {
            id: _id(filePath),
            pid: _id(projectPath),
            name: name,
            input: filePath,
            shortInput: shortInput,
            output: output,
            shortOutput: shortOutput
        };

        var ext = path.extname(filePath);

        if (ext === '.scss') {

            file.type = 'Scss';
            file.config = config.user.scss;

        } else if (ext === '.sass') {

            file.type = 'Sass';
            file.config = config.user.sass;

        }

        return file;

    };


    //Compile

    var compile = function (file) {

        var args = [config.ruby.gems.sass.path];

        //Input and output
        args.push(file.input, file.output);

        //Load path for @imports
        args.push('--load-path', path.dirname(file.input));

        //Cache location
        args.push('--cache-location', process.env.TEMP + '/PreprosCache');

        //Output Style
        args.push('--style', file.config.outputStyle);

        //Compass
        if (file.config.compass) {
            args.push('--compass');
        }

        //Bourbon
        if (file.config.bourbon) {
            args.push('--load-path', config.ruby.gems.bourbon.path);
        }

        //Line numbers
        if (file.config.lineNumbers) {
            args.push('--line-numbers');
        }

        //Make output dir if it doesn't exist
        fs.mkdirsSync(path.dirname(file.output));

        //Start a child process to compile the file
        var rubyProcess = cp.spawn(config.ruby.path, args);

        //If there is a compilation error
        rubyProcess.stderr.on('data', function (data) {

            notification.error('Error compiling file', data.toString());

        });
    };

    return {
        format: format,
        compile: compile
    };
});