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

    //get previous data from file
//    var less_file_name = path.join(config.less_main_files,"main.less");
//    if (!fs.exists(less_file_name)) {
//        //create file
//        fs.writeFileSync(less_file_name, '');
//    }

    //read old info from main.less file
    //var old_info = fs.readFileSync(less_file_name,'utf8');

    //read info from all less files in the directory
    //write imports for all less files
    var file_data = '';
    var file_disk = dir;
    var file_names = fs.readdirSync(file_disk);
    for(var i=0; i<file_names.length; i++) {
        //file_data += fs.readFileSync(path.join(file_disk, file_names[i]),'utf8');
        file_data += '\n@import "';
        file_data += path.join(file_disk, file_names[i]);
        file_data += '";\n';
    }

    //write to the common less file old and new info
    //var info = old_info + '\n'+ file_data;
    //fs.writeFileSync(less_file_name, info);
    global_less += file_data;



    //recreate new css file
}
exports.createCssFile = function() {
    if(!target_file) {
        return;
    }
    //var dir = path.join(module.getRootPath(), path.dirname(config.less_main_files));
    var file = target_file;
    var dir = path.dirname(file);

    //console.log()
    fse.ensureDirSync(dir);

//    var parser = new(less.Parser)({
//        paths: ['/'], // Specify search paths for @import directives
//        filename: 'main.less' // Specify a filename, for better error messages
//    });
    global_less = global_less.split('\\').join('/');
    less.render(global_less, function (e, data) {
        if(e) {
            return console.error("Less error: ", e)
        }
//        var data = tree.toCSS({
//            // Minify CSS output
//            compress: false
//        });
        console.log(file, data);
        fse.writeFileSync(file, data);
    });
}