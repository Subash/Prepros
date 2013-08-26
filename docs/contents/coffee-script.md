---
title: Using CoffeeScript with Prepros
template: index.jade
---

You can compile CoffeeScript files with Prepros.

If you save CoffeeScript files in `coffee` folder the compiled output will be saved in your `js` folder.

You can configure default `css`, `js`, and `html` folders from [project options](projects.html).

### Concatenating files

`# @prepros-append` statements can be used to append a file at the end of another file.

```css
# @prepros-append first.coffee
# @prepros-append second.coffee
# @prepros-append third file.coffee

```

`# @prepros-prepend` statements can be used to prepend a file at the begining of another file.

```css
# @prepros-prepend first.coffee
# @prepros-prepend second.coffee
# @prepros-prepend third file.coffee
```

The above file will output the concatenated form of `first.coffee`, `second.coffee`and `third file.coffee`.

All coffeescript files are compiled before they are appended or prepended. Settings of the parent file also apply to children files.

Files that are appended/prepended are not shown in the files list but they are watched and parent file is compiled whenever a change is made to the appended file.

Please note if you are using nested append/prepend, the nested statements are treated as the statements on parent file not the nested file that means if the child has append/prepend statements the files in that statement are directly concatenated to compiling parent file not with the file which has statements.

Prepros also supports codekit style `# @codekit-append` and `# @codekit-prepend` statements.

You can learn more about CoffeeScript on [CoffeeScript website](http://coffeescript.org).