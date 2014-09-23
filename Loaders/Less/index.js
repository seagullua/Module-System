//ideology for less files

var fs = require('fs');
var path = require('path');
var config = include('Core/Config');

exports.load = function(dir) {



    //get previous data from file
    var less_file_name = path.join(config.less_main_files,"main.less");
    if (!fs.exists(less_file_name)) {
        //create file
        fs.writeFileSync(less_file_name, '');
    }

    //read old info from main.less file
    var old_info = fs.readFileSync(less_file_name,'utf8');

    //read info from all less files in the directory
    //write imports for all less files
    var file_data;
    var file_disk = path.join(dir, 'frontend/LESS/');
    var file_names = fs.readdirSync(file_disk);
    for(var i=0; i<file_names.length; i++) {
        //file_data += fs.readFileSync(path.join(file_disk, file_names[i]),'utf8');
        file_data += '@import "';
        file_data += path.join(file_disk, file_names[i]);
        file_data += '";';
    }

    //write to the common less file old and new info
    var info = old_info + '\n'+ file_data;
    fs.writeFileSync(less_file_name, info);

    //TODO: create main.css file
    //get previous data from file
    var css_file_name = path.join(config.less_main_files,"main.css");
    if (!fs.exists(css_file_name)) {
        //create file
        fs.writeFileSync(css_file_name, '');
    }

    //read old info from main.css file
    var old_info = fs.readFileSync(css_file_name,'utf8');

    //recreate new css file
}
