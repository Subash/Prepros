/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

'use strict';

prepros.filter('interpolatePath', function ($interpolate) {

    var path = require('path');

    return function (string, data) {

        var project = {
            path: data.basePath,
            config: data.config
        };

        var relative = data.relative;

        var p = string;

        if (relative) {

            var isRelative = !(path.relative(project.path, string).indexOf('.' + path.sep) >= 0 || path.relative(project.path, string).indexOf(':') >= 0);

            if (isRelative) {
                p = path.relative(project.path, string);
            }
        }

        var jsMinPath = project.config.jsMinPath,
            cssPath = project.config.cssPath,
            jsPath = project.config.jsPath,
            htmlPath = project.config.htmlPath;

        if (string.indexOf('{{jsMinPath}}') >= 0 && jsMinPath.indexOf(':') >= 0) {

            var np = path.normalize(string.replace(/\{\{jsMinPath\}\}/gi, ''));

            p = path.join(jsMinPath, path.relative(project.path, np));

        } else if (string.indexOf('{{htmlPath}}') >= 0 && htmlPath.indexOf(':') >= 0) {

            p = path.join(htmlPath, string.split('{{htmlPath}}').reverse()[0]);

        } else if (string.indexOf('{{cssPath}}') >= 0 && cssPath.indexOf(':') >= 0) {

            p = path.join(cssPath, string.split('{{cssPath}}').reverse()[0]);

        } else if (string.indexOf('{{jsPath}}') >= 0 && jsPath.indexOf(':') >= 0) {

            p = path.join(jsPath, string.split('{{jsPath}}').reverse()[0]);

        }

        p = path.normalize($interpolate(p)(project.config));

        project = null;
        data = null;

        return p;
    };
});