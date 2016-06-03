/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */

/*jshint browser: true, node: true, loopfunc: true, curly: false*/
/*global prepros, _*/

prepros.factory('javascript', [

  'concat',
  '$filter',

  function(concat, $filter) {

    'use strict';

    var fs = require('fs-extra');
    var path = require('path');
    var ugly = require('uglify-js');

    var appendRegx = /\/\/(?:\s|)@(?:\s|)(?:prepros|codekit)-append\s+(.*)/gi;
    var prependRegx = /\/\/(?:\s|)@(?:\s|)(?:prepros|codekit)-prepend\s+(.*)/gi;

    var compile = function(file, project, callback) {

      var input = path.resolve(project.path, file.input);

      var output = (file.customOutput) ? path.resolve(project.path, file.customOutput) : $filter('interpolatePath')(file.input, project);

      concat.getConcatList(input, {

        appendRegx: appendRegx,
        prependRegx: prependRegx

      }, function(err, list) {

        if (err) return callback(new Error('Unable read the concatenation list \n' + err.message));


        if (file.config.uglify && file.config.sourcemaps) {

          try {

            var result = ugly.minify(list, {
              outSourceMap: path.basename(output) + '.map',
              mangle: file.config.mangle
            });

            if (file.config.sourcemaps) {
              result.code += '\n//# sourceMappingURL=' + path.basename(output) + '.map';
            }

            fs.outputFile(output, result.code, function(err) {

              if (err) return callback(new Error('Unable to write output file ' + err.message));

              callback(null, input);
            });

            if (file.config.sourcemaps) {

              var data = JSON.parse(result.map);

              for (var i = 0; i < data.sources.length; i++) {

                if (input.substr(0, 1) === data.sources[i].substr(0, 1)) {

                  data.sources[i] = path.relative(path.dirname(output), data.sources[i]).replace(/\\/g, '/');

                }
              }

              fs.outputFile(output + '.map', JSON.stringify(data), function(err) {

                if (err) return callback(new Error('Unable to write sourcemap file ' + err.message));

                callback(null, input);
              });
            }

          } catch (e) {

            callback(new Error('Error on line ' + e.line + ' col ' + e.col + ' ' + e.message));

          }


          return; //Stop execution bellow this

        }

        var total = list.length;

        var dataArray = [];

        //Make slots for data
        dataArray.length = list.length;

        var _complete = function() {

          if (!total) {

            fs.outputFile(output, dataArray.join("\n"), function(err) {

              if (err) return callback(new Error('Unable to write output file ' + err.message));

              callback(null, input);
            });
          }
        };


        _.each(list, function(filePath, i) {

          fs.readFile(filePath, 'utf8', function(err, js) {

            if (err) return callback(new Error('Failed to read file \n' + err.message));

            js = js.split("\n").map(function(line) {

              if (!line.match(appendRegx) && !line.match(prependRegx)) return line;

            });

            js = js.join("\n");

            if (file.config.uglify && !/\.min.js$/.exec(path.basename(filePath))) {

              try {

                js = ugly.minify(js, {
                  fromString: true,
                  mangle: file.config.mangle
                }).code;

              } catch (e) {

                return callback(new Error('Error on line ' + e.line + ' col ' + e.col + ' ' + e.message + ' of ' + filePath));
              }
            }

            --total;

            dataArray[i] = js;

            _complete();
          });

        });
      });
    };

    return {
      compile: compile
    };
  }
]);
