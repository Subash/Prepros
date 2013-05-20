/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, _ */

'use strict';

//Filter to shorten the string
prepros.filter('shorten', function () {
    return function (string) {
        if(string.length>65){

            var splits = string.split('/');

            var first = splits[0];

            //Doesn't work in edge cases; please submit a pull request if you have better idea
            var i =1;
            while(first.length < 25){

                first = first + '/' + splits[i];
                i++;
            }

            //File name and folder where it resides
            var last = splits[splits.length - 2] + '/' +splits[splits.length - 1];

            return first + '/........../' + last;

        } else {
            return string;
        }
    };
});