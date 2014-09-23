//ideology for Images files

var fs = require('fs');
var path = require('path');
var fse = require('fs-extra');
var ncp = require('ncp').ncp;
ncp.limit = 16;
var Config = include('Core/Config');
var UglifyJS = require('uglify-js');

exports.load = function(dir, module) {

    //get folder for JS files
    var common_images_folder_path = Config.js_files.path;
    //get long path for this JS file
    var this_images_file_path = dir;

    var target_path = path.join(module.getRootPath(), common_images_folder_path, module.getName());


    //create folder for current JS file
    fse.ensureDirSync(target_path);

    var files = fs.readdirSync(dir);
    for(var i=0; i<files.length; ++i) {
        var js = files[i];
        var ext = path.extname(js);
        if(ext == ".js") {
            var base_name = path.basename(js, ext);
            if(path.extname(base_name) != ".min") {
                var map_name = js + ".map";
                var result = UglifyJS.minify(path.join(dir, js), {
                    outSourceMap: map_name
                });
                fse.writeFileSync(path.join(target_path, js), result.code);
                fse.writeFileSync(path.join(target_path, map_name), result.map);
                //Minify this file
            } else {
                fse.copySync(path.join(dir, js), path.join(target_path, js));
            }
        }
    }

    var prefix = Config.server.urlcontent + Config.js_files.url + '/' + module.getName() + '/';
    return function(url) {
        return prefix + url;
    }
}
