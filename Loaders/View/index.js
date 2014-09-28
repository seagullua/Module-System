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

exports.name = 'view';

function viewFileName(view) {
    if(view instanceof ViewModule) {
        return view.file;
    } else {
        return view;
    }
}

var res = express.response;
res.defaultRender = res.render;
res.render = function(view, options, fn){
    options.ME = view.module;
    this.defaultRender(viewFileName(view), options, fn);
};
exports.viewFileName = viewFileName;
exports.configureModules = function(app) {
    app.set('view engine', 'ejs');
}
