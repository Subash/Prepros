/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

'use strict';

prepros.factory('fileTypes', function (less, sass, stylus, markdown, coffee, jade, haml, slim) {

    return {
        less: less,
        sass: sass,
        stylus: stylus,
        markdown: markdown,
        coffee: coffee,
        jade: jade,
        haml: haml,
        slim: slim
    };
});