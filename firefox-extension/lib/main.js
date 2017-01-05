// The main module of the Prepros Add-on.
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");

pageMod.PageMod({
    include: "*", // All DOM windows (ie. all pages + all iframes).
    contentScriptWhen: "start", // page starts loading, at this point you have
                                // the head of the document and no more
    contentScriptFile: self.data.url("live.js")
});