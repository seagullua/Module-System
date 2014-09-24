//ideology for Views files
function ViewModule(module, file_name) {

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
        //Render view module
        console.log("Custom renderer");
    } else {
        this.defaultRender(view, options, fn);
    }
};
