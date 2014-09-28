//ideology for less files

var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var less = require('less');
var config = include('Core/Config');
var global_less = '';
var target_file;
exports.load = function(dir, module) {

    if(!target_file) {
        target_file =  path.join(module.getRootPath(), config.less_main_files.path);
    }

    var file_data = '';
    var file_disk = dir;
    var file_names = fs.readdirSync(file_disk);
    for(var i=0; i<file_names.length; i++) {
        var name = file_names[i];
        if(path.extname(name) == ".less") {
            file_data += '\n@import "';
            file_data += path.join(file_disk, name);
            file_data += '";\n';
        }
    }


    global_less += file_data;
}

function createCssFile() {
    if(!target_file) {
        return;
    }
    var file = target_file;
    var dir = path.dirname(file);
    fse.ensureDirSync(dir);

    global_less = global_less.split('\\').join('/');
    less.render(global_less, {compress: true}, function (e, data) {
        if(e) {
            return console.error("Less error: ", e)
        }
        fse.writeFileSync(file, data);
    });
}

exports.configureBeforeLaunch = function() {
    console.log("Creating LESS...");
    createCssFile();
}
exports.createCssFile = createCssFile;

var Urls = include('Core/Urls');
var Config = include('Core/Config');
exports.configureModules = function(app) {
    Urls.addUrl('urlMainCss', function()
    {
        return Config.server.urlcontent + Config.less_main_files.url
    });
}