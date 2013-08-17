/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

prepros.filter('interpolatePath', function ($interpolate) {

    'use strict';

    var path = require('path');

    return function (string, data) {

        if(data.config.jsMinPath.indexOf(':')>=0) {

            string = path.normalize(string.replace(/\{\{jsMinPath\}\}/gi, ''));
            string = path.join(data.config.jsMinPath, string);

        } else if(data.config.cssPath.indexOf(':')>=0) {

            string = path.join(data.config.cssPath, string.split('{{cssPath}}').reverse()[0]);

        } else if(data.config.jsPath.indexOf(':')>=0) {

            string = path.join(data.config.jsPath, string.split('{{jsPath}}').reverse()[0]);

        } else if(data.config.htmlPath.indexOf(':')>=0) {

            string = path.join(data.config.htmlPath, string.split('{{htmlPath}}').reverse()[0]);

        }

        string = path.normalize($interpolate(string)(data.config));

        return string;
    };
});