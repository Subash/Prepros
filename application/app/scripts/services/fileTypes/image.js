/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('image', function (config, utils) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        _id = utils.id;


    var format = function (filePath, projectPath) {

        //File name
        var name = path.basename(filePath);

        //Relative input path
        var shortInput = path.relative(projectPath, filePath);

        return {

            id: _id(filePath),
            pid: _id(projectPath),
            name: name,
            type: 'img',
            input: filePath,
            shortInput: shortInput,
            output: filePath
        };
    };

    var compile = function (file, successCall, errorCall) {

        var execFile = require('child_process').execFile;
        var ext = path.extname(file.input).slice(1);
        var png = ['png','gif','tif','tiff'];

        if (_.contains(png, ext)) {

            //Compile using PNG
            var optipngPath = require('optipng-bin').path;

            try {

                execFile(optipngPath, [file.input], function(err, stdout, stderr) {

                    if(err) {

                        errorCall(err.message);

                    } else {

                        successCall(file.input);

                    }
                });

            }  catch (e) {

                errorCall(e.message + "\n" + file.input);

            }

        } else {

            var jpegtranPath = require('jpegtran-bin').path;

            try {

                execFile(jpegtranPath, ['-outfile', file.input, '-optimize', file.input], function(err, stdout, stderr) {

                    if(err) {

                        errorCall(err.message);

                    } else {

                        successCall(file.input);

                    }
                });

            }  catch (e) {

                errorCall(e.message + "\n" + file.input);

            }
        }
    };

    return {
        format: format,
        compile: compile
    };
});