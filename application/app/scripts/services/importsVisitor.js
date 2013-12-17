/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, loopfunc: true, curly: false*/
/*global prepros, _*/

//Imports Visitor
prepros.factory('importsVisitor', [

    function () {

        'use strict';

        var fs = require('fs-extra'),
            path = require('path');


        function getImports(filePath, callback) {

            var imports = [];

            var regx = {
                less: /@import\s(?:url\(|\(|)['"]*([^\n"';\)]*)/g,
                sass: /@import\s+(.*)/g,
                scss: /@import\s['"]*([^;]+)[;"']/g,
                styl: /@import\s(?:url\(|\(|)['"]*([^\n"';\)]*)/g,
                jade: /(?:include|extends)\s+(.*)/g,
                slim: /\==\sSlim::Template.new\(['"]*([^\n"']+)['"]\).render/g,
                js: /\/\/(?:\s|)@(?:\s|)(?:prepros|codekit)-(?:append|prepend)\s+(.*)/gi,
                coffee: /#(?:\s|)@(?:\s|)(?:prepros|codekit)-(?:append|prepend)\s+(.*)/gi
            };

            var ext = path.extname(filePath).toLowerCase().slice(1);

            if (!ext || !regx[ext]) return callback(null, []);

            var importReg = regx[ext];
            var basedir = path.dirname(filePath);

            fs.readFile(filePath, 'utf8', function (err, data) {

                if (err) {
                    return callback(err);
                }

                var list = [];
                var result;

                do {

                    result = importReg.exec(data);
                    if (result) {

                        var imps = result[1].replace(/"|'|\n|;/gi, '').split(',');

                        imps = imps.map(function (imp) {

                            return path.resolve(basedir, imp.trim());

                        });

                        list = list.concat(imps);
                    }

                } while (result);

                var i = 0;
                (function next() {

                    var file = list[i++];

                    if (!file) {

                        return callback(null, _.uniq(imports));
                    }

                    //Check the path without adding extension
                    fs.stat(file, function (err, stat) {

                        if (err || stat.isDirectory()) {

                            //Add Extension if doesn't exist
                            if (path.extname(file).toLowerCase() !== ext) {
                                file = file + '.' + ext;
                            }

                            //Chcek for non partial file
                            fs.stat(file, function (err, stat) {

                                if (err) {

                                    //Check for the partial file
                                    file = path.dirname(file) + path.sep + '_' + path.basename(file);

                                    getImports(file, function (err, res) {

                                        if (!err) {

                                            imports.push(file);
                                            imports = imports.concat(res);
                                        }
                                        next();
                                    });

                                } else {

                                    getImports(file, function (err, res) {

                                        if (!err) {

                                            imports.push(file);
                                            imports = imports.concat(res);
                                        }
                                        next();
                                    });
                                }
                            });

                        } else {

                            getImports(file, function (err, res) {

                                if (!err) {

                                    imports.push(file);
                                    imports = imports.concat(res);
                                }
                                next();
                            });
                        }
                    });

                })();

            });
        }

        return {
            getImports: getImports
        };

    }
]);