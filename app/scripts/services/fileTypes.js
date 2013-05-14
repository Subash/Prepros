/*jshint browser: true, node: true*/
/*global prepros*/

'use strict';

prepros.factory('fileTypes', function (storage, notification, config, utils,

                                       less, sass, stylus, markdown, coffee, jade, haml) {

    return {
        less: less,
        sass: sass,
        stylus: stylus,
        markdown: markdown,
        coffee: coffee,
        jade: jade,
        haml: haml
    };
});