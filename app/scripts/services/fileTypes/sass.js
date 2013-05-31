/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */


/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('sass', function (config, utils) {

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

        //Find output path; save to user defined css folder if file is in sass or scss folder
        if(filePath.match(/\\sass\\|\\scss\\|\/sass\/|\/scss\//gi)) {

            output = path.normalize(output.replace(/\\sass\\|\\scss\\|\/sass\/|\/scss\//gi, path.sep + config.getUserOptions().cssPath + path.sep));

        }

        //Find short output path
        var shortOutput = output.replace(/\\/g, '/');

        //Show Relative path if output file is within project folder
        if (path.relative(projectPath, filePath).indexOf('.' + path.sep) === -1) {

            shortOutput = path.relative(projectPath, output).replace(/\\/g, '/');
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
            file.config = config.getUserOptions().scss;

        } else if (ext === '.sass') {

            file.type = 'Sass';
            file.config = config.getUserOptions().scss;

        }

        return file;

    };


    //Compile

    var compile = function (file, callback) {

        var args = [config.ruby.gems.sass.path];

        //Force utf-8 encoding
        args.push('-E', 'utf-8');

        //Input and output
        args.push(file.input, file.output);

        //Load path for @imports
        args.push('--load-path', path.dirname(file.input));

        //Cache location
        args.push('--cache-location', path.join(process.env.TEMP, 'PreprosCache'));

        //Output Style
        args.push('--style', file.config.outputStyle);

        //Debug info
        if(file.config.debug){

            args.push('--debug');
        }

        //Compass
        if (file.config.compass) {
            args.push('--compass');

            //Compass Susy Plugin
            args.push('--load-path', config.ruby.gems.susy.path);

        }

        //Sass bourbon
        args.push('--load-path', config.ruby.gems.bourbon.path);


        //Line numbers
        if (file.config.lineNumbers) {
            args.push('--line-numbers');
        }

        //Make output dir if it doesn't exist
        fs.mkdirsSync(path.dirname(file.output));

        //Start a child process to compile the file; file.projectPath is provided by compiler.js file
        var rubyProcess = cp.spawn(config.ruby.path, args, {cwd: file.projectPath});

        var compileErr = false;

        //If there is a compilation error
        rubyProcess.stderr.on('data', function (data) {

            compileErr = true;

            callback(true, data.toString());

        });

        //Success if there is no error
        rubyProcess.on('exit', function(){
            if(!compileErr){

                callback(false, file.input);

            }
        });

    };

    return {
        format: format,
        compile: compile
    };
});