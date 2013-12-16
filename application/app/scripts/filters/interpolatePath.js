/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

prepros.filter('interpolatePath', [

    'utils',

    function (utils) {

        'use strict';

        var path = require('path');

        var CSS = 'CSS';
        var HTML = 'HTML';
        var JS = 'JS';
        var MINJS = 'MINJS';

        var typeMap = {};

        //Css
        typeMap.less = typeMap.sass = typeMap.scss = typeMap.styl = CSS;

        //Html
        typeMap.md = typeMap.markdown = typeMap.jade = typeMap.haml = typeMap.slim = HTML;

        //Javascript
        typeMap.ls = typeMap.coffee = JS;

        //minified javascript
        typeMap.js = MINJS;

        return function (filePath, project) {

            var ext = path.extname(filePath).slice(1).toLowerCase();

            filePath = path.join(project.path, filePath);

            //Change Output Extension
            switch (typeMap[ext]) {

                case CSS:

                    filePath = path.join(path.dirname(filePath), path.basename(filePath).replace(new RegExp('.' + ext + '$'), '.css'));
                    break;

                case HTML:

                    filePath = path.join(path.dirname(filePath), path.basename(filePath).replace(new RegExp('.' + ext + '$'), project.config.htmlExtension));
                    break;

                case JS:

                    filePath = path.join(path.dirname(filePath), path.basename(filePath).replace(new RegExp('.' + ext + '$'), '.js'));
                    break;

                case MINJS:

                    filePath = path.join(path.dirname(filePath), path.basename(filePath).replace(new RegExp('.' + ext + '$'), '.min.js'));
                    break;
            }

            var fileName = path.basename(filePath);
            var fileDir = path.dirname(filePath);

            switch (typeMap[ext]) {

                case CSS:

                    switch (project.config.cssPathType) {

                        case "REPLACE_TYPE":

                            //Conver comma sepereted string to pipe seperated regx like string and escape special regx characters
                            var cssTypes = project.config.cssTypes.split(',').map(function (type) {

                                return type.trim().replace(/[-\/\\^$*+?.()[\]{}]/g, '\\$&');

                            }).join('|');

                            var cssRegX = new RegExp('(:?\\\\|/)(:?' + cssTypes + ')(:?\\\\|/)', 'gi');

                            filePath = filePath.replace(cssRegX, path.sep + project.config.cssPath + path.sep);

                            break;

                        case "RELATIVE_FILESDIR":


                            project.config.cssPreprocessorPath.split(',').forEach(function (cPath) {

                                var cssPreprocessorDir = path.resolve(project.path, cPath);

                                if (utils.isFileInsideFolder(cssPreprocessorDir, filePath)) {
                                    filePath = path.resolve(project.path, project.config.cssPath, path.relative(cssPreprocessorDir, filePath));
                                }
                            });

                            break;

                        case "RELATIVE_FILEDIR":

                            filePath = path.resolve(fileDir, project.config.cssPath, fileName);

                            break;
                    }

                    break;

                case HTML:

                    switch (project.config.htmlPathType) {

                        case "REPLACE_TYPE":

                            var htmlTypes = project.config.htmlTypes.split(',').map(function (type) {

                                return type.trim().replace(/[-\/\\^$*+?.()[\]{}]/g, '\\$&');

                            }).join('|');

                            var htmlRegX = new RegExp('(:?\\\\|\/)(:?' + htmlTypes + ')(:?\\\\|\/)', 'gi');

                            filePath = filePath.replace(htmlRegX, path.sep + project.config.htmlPath + path.sep);

                            break;

                        case "RELATIVE_FILESDIR":

                            project.config.htmlPreprocessorPath.split(',').forEach(function (hPath) {

                                var htmlPreprocessorDir = path.resolve(project.path, hPath);

                                if (utils.isFileInsideFolder(htmlPreprocessorDir, filePath)) {
                                    filePath = path.resolve(project.path, project.config.htmlPath, path.relative(htmlPreprocessorDir, filePath));
                                }
                            });

                            break;

                        case "RELATIVE_FILEDIR":

                            filePath = path.resolve(fileDir, project.config.htmlPath, fileName);
                            break;
                    }

                    break;

                case JS:

                    switch (project.config.jsPathType) {

                        case "REPLACE_TYPE":

                            var jsTypes = project.config.jsTypes.split(',').map(function (type) {

                                return type.trim().replace(/[-\/\\^$*+?.()[\]{}]/g, '\\$&');

                            }).join('|');

                            var jsRegX = new RegExp('(:?\\\\|\/)(:?' + jsTypes + ')(:?\\\\|\/)', 'gi');

                            filePath = filePath.replace(jsRegX, path.sep + project.config.jsPath + path.sep);

                            break;

                        case "RELATIVE_FILESDIR":

                            project.config.jsPreprocessorPath.split(',').forEach(function (jPath) {

                                var jsPreprocessorDir = path.resolve(project.path, jPath);

                                if (utils.isFileInsideFolder(jsPreprocessorDir, filePath)) {
                                    filePath = path.resolve(project.path, project.config.jsPath, path.relative(jsPreprocessorDir, filePath));
                                }
                            });

                            break;

                        case "RELATIVE_FILEDIR":

                            filePath = path.resolve(fileDir, project.config.jsPath, fileName);

                            break;
                    }

                    break;

                case MINJS:

                    switch (project.config.minJsPathType) {

                        case "RELATIVE_FILESDIR":

                            project.config.minJsPreprocessorPath.split(',').forEach(function (jPath) {

                                var minJsPreprocessorDir = path.resolve(project.path, jPath);

                                if (utils.isFileInsideFolder(minJsPreprocessorDir, filePath)) {
                                    filePath = path.resolve(project.path, project.config.minJsPath, path.relative(minJsPreprocessorDir, filePath));
                                }
                            });

                            break;

                        case "RELATIVE_FILEDIR":

                            filePath = path.join(fileDir, project.config.minJsPath, fileName);

                            break;
                    }

                    break;
            }

            return path.normalize(filePath);
        };
    }
]);