/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, loopfunc: true, curly: false*/
/*global prepros, _*/

prepros.factory('concat', [

    function () {

        'use strict';

        var fs = require('fs');
        var path = require('path');

        var getConcatList = function (filePath, options, callback) {

            var appendRegx = options.appendRegx;
            var prependRegx = options.prependRegx;

            var imports = [];

            filePath = path.normalize(filePath);

            fs.readFile(filePath, { encoding: 'utf8' }, function (err, data) {

                if (err) return callback(err);

                var appendList = [];
                var prependList = [];

                var result;

                var basedir = path.dirname(filePath);

                do {

                    result = appendRegx.exec(data);

                    if (result) {

                        var app = result[1].replace(/"|'|\n|;/gi, '').trim();

                        appendList.push(path.resolve(basedir, app));
                    }

                } while (result);

                do {

                    result = prependRegx.exec(data);

                    if (result) {

                        var prep = result[1].replace(/"|'|\n|;/gi, '').trim();

                        prependList.push(path.resolve(basedir, prep));

                    }

                } while (result);


                //Add file itself to the list so the file comes in the middle of appends and prepends
                var list = prependList.concat([filePath], appendList);

                var i = 0;

                (function next() {

                    var file = list[i++];

                    if (!file) {

                        return callback(null, imports);
                    }

                    //Do not read the file itself but just add to imports list
                    if (filePath === file) {

                        imports.push(file);
                        return next();
                    }

                    //Read child file for imports
                    getConcatList(file, options, function (err, res) {
                        if (err) return callback(err);
                        imports = imports.concat(res);
                        next();
                    });

                })(); //Start execution
            });
        };


        return {
            getConcatList: getConcatList
        };
    }
]);