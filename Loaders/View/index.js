//ideology for Views files
function ViewModule(module, file_name) {
    this.file = file_name;
    this.module = module.getFunctions();
}
var express = require('express');
var path = require('path');

exports.load = function(dir, module) {
    return function(file_name) {
        return new ViewModule(module, path.join(dir, file_name));
    }
}

var res = express.response;
res.defaultRender = res.render;
res.render = function(view, options, fn){
    if(view instanceof ViewModule) {
        options = options || {};
        for(var key in view.module) {
            options[key] = view.module[key];
        }
        this.defaultRender(view.file, options, fn);
    } else {
        this.defaultRender(view, options, fn);
    }
};
