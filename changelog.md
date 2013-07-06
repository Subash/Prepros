### Version 2.2.0 -July 06, 2013

* Fixed bourbon path bug
* Support for bourbon [neat](http://neat.bourbon.io)
* Added alertify notifications
* Support for absolute paths for html, css and javascripts folder
* File and project context menus
* Fixed edge case bug in js minification and concatenation
* Improved performance
* Bourbon updated to version 3.1.8
* Other minor bug fixes and performance improvements

### Version 2.1.0 -June 28, 2013

* Initial OSX version
* Custom ruby option for slim and haml
* Fixed bug in sass imports detector
* Copy selected text with CTRL+C
* Other minor bug fixes and improvements

### Version 2.0.1 -June 24, 2013

* Fixed Critical Configurations Bug
* Faster file watcher

### Version 2.0.0 -June 24, 2013

* Multi device live refresh [docs](http://alphapixels.com/prepros/docs/multi-device-live-refresh.html)
* Live refresh works on all browsers when built in server is used [docs](http://alphapixels.com/prepros/docs/live-refresh.html)
* Javascript `@prepros-append` statements [docs](http://alphapixels.com/prepros/docs/js-concat-minify.html) 
* Support for codekit style `@codekit-append/@codekit/prepend` statements  [docs](http://alphapixels.com/prepros/docs/js-concat-minify.html) 
* No pooling for file changes. Prepros uses event based system to refresh browser
* Improved Performance
* Improved UI
* Pretty Live Urls (localhost:5656/project-name)
* Support for jade `extends` watching
* Sass unix new lines
* Other minor bug fixes

### Version 1.7.0 -June 11, 2013

* Feature: Javascript concatenation and minification [Docs](http://alphapixels.com/prepros/docs/js-concat-minify.html)
* Feature: Options for less strict math and unit
* Bugfix: Chrome extension constant refresh
* Complete rewrite of @import detection scripts
* Jade updated to 0.31.2
* Ability to add project by dropping a file
* Updated Slim to 2.0.0
* Some performance and UI improvements

### Version 1.6.1 -June 08, 2013

* Bugfix: Prepros didn't ignore sass partials
* Feature: Slim import watching


### Version 1.6.0 -June 06, 2013

* Feature : Option to point to an external ruby compiler
* Feature : Per project html, css and js folders
* Feature : Full compass support
* Bugfix : Notification popup caused other windows to lose focus
* Enhancement : Nested imports upto 5 levels
* Updated CoffeeScript to 1.6.3
* Updated Jade to 0.31.1
* Updated Less to 1.4.0
* Updated Marked to 0.2.9
* Updated uglify-js to 2.3.6
* Some performance and UI improvements

### Version 1.5.0 -May 29, 2013

* Critical Bugfix : Changing option of a file affected another file
* Enhancement : Brand new style for notifications
* Feature : Notification on successful compilation
* Feature : [Slim](http://slim-lang.com) support
* Feature : Custom file filters on per project basis
* Feature : Coffeescript bare option
* Some ui improvements

### Version 1.4.1 -May 25, 2013

* Feature: Windows XP Compatibility
* Feature: Sass debug information
* Bugfix: Sass imports not detected

### Version 1.4.0 -May 22, 2013

* Support for compass config.rb file (must be inside projects root folder)
* Support deep nested imports
* Exclude certain patterns from file and folders
* Sass compact output style
* Success notice when file is successfully compiled
* Fixed bug where app was hidden after minimizing to tray
* Default extensions for changed output files
* Fixed crash while compiling less
* Other small fixes and improvements


### Version 1.3.0 -May 16, 2013

* New default options panel ( Ability to save default options for languages )
* Compass Susy plugin
* Automatic update checker
* Enabled Bourbon by default
* Cleaner codebase
* Fixed bug where app crash was caused and file settings were not preserved.


### Version 1.2.1 -May 11, 2013

* Support [Sass Bourbon](http://bourbon.io) Mixins
* Markdown Filter For Haml
* User interface improvement
* Some code and performance improvements


## Version 1.2.0 -May 07, 2013

* Fixed app crash on project folder delete
* Added Keyboard shortcuts

```
CTRL+N  : New Project
CTRL+R or F5  : Refresh Project Files
CTRL+L : Open Live Project Url
CTRL+D : Remove Project
CTRL+C : Compile Selected File
CTRL+SHIFT+C : Compile all project files
```
* Jade updated to 0.30.0
* Sass updated to 3.2.8
* Option to select installation folder
* Some code and performance improvements

## Version 1.1.2 -May 04, 2013

* Option to disable markdown sanitization and gfm.
* Ability to save application state; App opens where you left it.
* Fixed bug where project is not shown in the project list.
* Fixed bug where file settings were not preserved after refreshing project.
* Use marked instead of markdown.js.
* Cleaner codebase.


## Version 1.1.1 -May 01, 2013

* Initial release
