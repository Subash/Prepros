---
title: Concatenating and minifying javascript
template: index.jade
---

Starting from version 1.7 Prepros supports js concatenation and minification.

After adding new project your javascript files that Prepros can concatenate and minify are shown in the files list. The minified and concatenated files are saved in `min` folder and file names are suffixed with `.min.js`.

Minified js file that end with `min.js` are ignored by Prepros.

### Concatenating files

`//@prepros-append` statements can be used to append a file at the end of another file.

```css
//@prepros-append first.js
//@prepros-append second.js
//@prepros-append third file.js
//@prepros-append fourth.min.js

```

The above file will output the concatenated form of `first.js`, `second.js`, `third file.js` and `fourth.min.js`.
Files that are appened are not shown in the files list but they are watched and parent file is compiled whenever a change is made to the appended file.

If you have minification settings turned on the `first.js`, `second.js` and `third file.js` will be minified before appending but fourth file will be appended as it is because the file contains `.min` suffix. This prevents Prepros from re-minifying an already minified file which is a disaster.

