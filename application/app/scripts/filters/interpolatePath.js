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

        var p = string,
            normalPath = path.normalize(p.replace(/\{\{jsMinPath\}\}/gi, ''));

        var jsMinPath = project.config.jsMinPath;

        var cssPath = project.config.cssPath;

        var jsPath = project.config.jsPath;

        var htmlPath = project.config.htmlPath;

        if(relative) {

            var isRelative = !(path.relative(project.path, string).indexOf('.' + path.sep) >=0
                ||
                path.relative(project.path, string).indexOf(':')>=0);

            if(isRelative) {
                p = path.relative(project.path, string);
            }
        }

        p = $interpolate(p)(project.config);

        if(normalPath.indexOf(':') >= 0) {

            if(string.indexOf('{{jsMinPath}}')>=0 && jsMinPath.indexOf(':') >= 0) {

                p = path.join(jsMinPath, path.relative(project.path, normalPath));

            } else if(string.indexOf('{{htmlPath}}')>=0 && htmlPath.indexOf(':') >= 0) {

                p = path.join(htmlPath, normalPath.split('{{htmlPath}}').reverse()[0]);

            } else if(string.indexOf('{{cssPath}}')>=0 && cssPath.indexOf(':') >= 0) {

                p = path.join(cssPath, normalPath.split('{{cssPath}}').reverse()[0]);

            } else if(string.indexOf('{{jsPath}}')>=0 && jsPath.indexOf(':') >= 0) {

                p = path.join(jsPath, normalPath.split('{{jsPath}}').reverse()[0]);

            }
        }

        return p;
    };
});