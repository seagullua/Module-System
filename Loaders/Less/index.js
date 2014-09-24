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
        file_data += '\n@import "';
        file_data += path.join(file_disk, file_names[i]);
        file_data += '";\n';
    }


    global_less += file_data;
}

exports.createCssFile = function() {
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