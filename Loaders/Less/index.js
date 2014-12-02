//ideology for less files

var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var less = require('less');
var config = include('Core/Config');
var global_less = '';
var target_file;
var main_css = '';

function lessForFilesList(file_names, file_disk) {
    var file_data = '';
    for(var i=0; i<file_names.length; i++) {
        var name = file_names[i];
        if(path.extname(name) == ".less") {
            file_data += '\n@import "';
            file_data += path.join(file_disk, name);
            file_data += '";\n';
        }
    }

    return file_data;
}

exports.load = function(dir, module) {

    if(!target_file) {
        target_file =  path.join(module.getRootPath(), config.less_main_files.path);
    }


    var file_disk = dir;
    var file_names = fs.readdirSync(file_disk);

    global_less += lessForFilesList(file_names, file_disk);
};

function createCssFile() {
    if(!target_file) {
        return;
    }
    var file = target_file;
    var dir = path.dirname(file);
    fse.ensureDirSync(dir);

    if(Config.less && Config.less.pre_include) {
        var list = Config.less.pre_include;
        global_less = lessForFilesList(list, Config.rootPath) + global_less;
    }

    global_less = global_less.split('\\').join('/');
    less.render(global_less, {compress: true}, function (e, data) {
        if(e) {
            return console.error("Less error: ", e);
        }
        main_css = data;
        fse.writeFileSync(file, data);
    });
}

exports.configureBeforeLaunch = function() {
    console.log("Creating LESS...");
    createCssFile();
};
exports.createCssFile = createCssFile;
exports.getMainCss = function() {
    return main_css;
};

var Urls = include('Core/Urls');
var Config = include('Core/Config');
exports.configureModules = function(app) {
    Urls.addUrl('urlMainCss', function()
    {
        return Config.server.urlcontent + Config.less_main_files.url;
    });
};