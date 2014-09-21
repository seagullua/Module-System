//ideology for Images files

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var ncp = require('ncp').ncp;
ncp.limit = 16;

exports.load = function(dir) {

    var config = include('Core/Config');

    //get folder for JS files
    var common_images_folder_path = config.images_files;
    //get long path for this JS file
    var this_images_file_path = path.join(common_images_folder_path, dir);

    //create folder for current JS file
    mkdirp(this_images_file_path);

    //get all JS files from this module and copy to new place
    var file_data;
    var file_disk = path.join(dir, 'frontend/images/');
    var file_names = fs.readdirSync(file_disk);
    for(var i=0; i<file_names.length; i++) {
        //copy file to new folder
        //first arg - source
        //second - destination
        //TODO: id destination file name correct?
        ncp(path.join(file_disk, file_names[i]),
            this_js_file_path,
            function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log('done!');
            });
    }
}
