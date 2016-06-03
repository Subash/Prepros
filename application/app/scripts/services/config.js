/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, angular, _, $*/

prepros.factory('config', [

  function() {

    'use strict';

    var fs = require('fs-extra'),
      path = require('path'),
      os = require('os');


    //Package.json path
    var packagePath = process.cwd();

    //Base path
    var basePath = path.join(packagePath, 'app');

    //Package.json file url
    var packageFileUrl = path.join(packagePath, 'package.json');

    //Read package.json file and get data of app in prepros object
    var packageData = angular.fromJson(fs.readFileSync(packageFileUrl).toString());

    //CachePath
    var cachePath = path.join(os.tmpdir(), 'PreprosCache');

    //Node modules required by the app
    var node_modules = packageData.dependencies;

    //Ruby Gems
    var ruby_gems = packageData.ruby.gems;

    //App version
    var version = packageData.version;

    //Read user config
    var userConfig = {};
    try {

      userConfig = $.parseJSON(localStorage.PreprosConfig || '{}');

    } catch (e) {

      window.alert('Error Reading Configurations ! Reverting to defaults.');

      saveUserOptions(userConfig);
    }

    var defaultConfig = {
      cssPath: 'css/',
      jsPath: 'js/',
      htmlPath: 'html/',
      minJsPath: 'min/',
      cssPathType: 'REPLACE_TYPE', //REPLACE_TYPE, RELATIVE_FILESDIR, RELATIVE_FILEDIR
      htmlPathType: 'REPLACE_TYPE',
      jsPathType: 'REPLACE_TYPE',
      minJsPathType: 'RELATIVE_FILEDIR',
      htmlTypes: 'jade, haml, slim, markdown, md',
      cssTypes: 'less, sass, stylus, scss, styl',
      jsTypes: 'coffee, coffeescript, coffeescripts, ls, livescript, livescripts',
      cssPreprocessorPath: '',
      htmlPreprocessorPath: '',
      jsPreprocessorPath: '',
      minJsPreprocessorPath: '',
      htmlExtension: '.html',
      enableSuccessNotifications: true,
      enableErrorNotifications: true,
      filterPatterns: 'node_modules', //Filter node modules folder by default
      autoprefixerBrowsers: '',
      liveRefreshDelay: 0,
      notificationTime: 3000,
      notificationDetails: false,
      experimental: {
        fileWatcher: false,
        autoAddRemoveFile: true
      },

      customRuby: {
        use: false,
        path: '',
        sass: false,
        slim: false,
        haml: false
      },

      //Default Less Options
      less: {
        autoCompile: true,
        compress: false,
        sourcemaps: false,
        cleancss: false,
        strictMath: false,
        strictUnits: false,
        autoprefixer: false
      },

      //Default Sass options
      sass: {
        autoCompile: true,
        lineNumbers: false,
        unixNewlines: false,
        sourcemaps: false,
        debug: false,
        compass: false,
        fullCompass: false,
        outputStyle: 'expanded', //compressed, nested, expanded, compact
        autoprefixer: false
      },


      //Default Stylus Options
      stylus: {
        autoCompile: true,
        lineNumbers: false,
        nib: false,
        compress: false,
        autoprefixer: false
      },

      //Default Markdown Options
      markdown: {
        autoCompile: true,
        sanitize: false,
        gfm: true
      },

      //Default Coffeescript Options
      coffee: {
        autoCompile: true,
        bare: false,
        uglify: false,
        mangle: true,
        iced: false,
        sourcemaps: false
      },

      //Default Livescript Options
      livescript: {
        autoCompile: true,
        bare: false,
        uglify: false,
        mangle: true
      },

      //Default javascript options
      javascript: {
        autoCompile: true,
        uglify: true,
        mangle: true,
        sourcemaps: false
      },

      //Default Jade  Options
      jade: {
        autoCompile: true,
        pretty: true
      },

      //Default Haml Options
      haml: {
        autoCompile: true,
        format: 'html5', //xhtml, html5
        outputStyle: 'indented', //indented, ugly
        doubleQuotes: false
      },

      //Default Slim  Options
      slim: {
        autoCompile: true,
        pretty: true,
        indent: 'default', //default, four, tab
        fourSpaceIndent: true,
        format: ':html5' //:xhtml, :html4, :html5, :html
      }
    };

    //Fill in the undefined values from default configurations
    userConfig = _.defaults(userConfig, defaultConfig);

    if (userConfig.jsMinPath) {

      userConfig.minJsPath = userConfig.jsMinPath;
      delete userConfig.jsMinPath;
    }

    for (var configKey in userConfig) {

      if (userConfig.hasOwnProperty(configKey) && typeof userConfig[configKey] === 'object') {

        userConfig[configKey] = _.defaults(userConfig[configKey], defaultConfig[configKey]);
      }
    }

    //Do not pass by refrence
    function getUserOptions() {
      return JSON.parse(angular.toJson(userConfig, false));
    }

    function saveUserOptions(options) {
      localStorage.setItem('PreprosConfig', angular.toJson(options));
      userConfig = JSON.parse(angular.toJson(options));
    }

    //Ruby Executable
    var ruby = {
      version: packageData.ruby.version,
      bourbon: path.join(packagePath, packageData.ruby.bourbon),
      neat: path.join(packagePath, packageData.ruby.neat),
      bitters: path.join(packagePath, packageData.ruby.bitters),
      getExec: function(fileType) {

        if (userConfig.customRuby.use && userConfig.customRuby.path !== '' && userConfig.customRuby[fileType]) {

          return path.normalize(userConfig.customRuby.path);
        }

        return path.join(packagePath, packageData.ruby.path);

      },
      getGem: function(fileType) {

        var ft = (fileType === 'compass') ? 'sass' : fileType;

        var loader = path.join(basePath, '../bin/gems.rb');

        var gemPath = path.join(packagePath, packageData.ruby.gemPath);

        if (userConfig.customRuby.use && userConfig.customRuby.path !== '' && userConfig.customRuby[ft]) {

          return [loader, 'custom', fileType];

        } else {

          return [loader, gemPath, fileType];

        }
      }
    };

    return {
      cachePath: cachePath,
      basePath: basePath,
      ruby: ruby,
      node_modules: node_modules,
      ruby_gems: ruby_gems,
      getUserOptions: getUserOptions,
      saveUserOptions: saveUserOptions
    };

  }
]);
