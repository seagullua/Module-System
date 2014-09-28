//ideology for Images files

var fs = require('fs');
var path = require('path');
var fse = require('fs-extra');
var ncp = require('ncp').ncp;
ncp.limit = 16;
var Config = include('Core/Config');
var UglifyJS = require('uglify-js');
var is_development = false;

function debugJSUrl(module_name, js_file) {
    if(!module_name) {
        module_name = '';
    }
    module_name = module_name.split("/").join(".");
    return "/debug-js/"+module_name+"/"+js_file;
}

var debug_files = {};

exports.load = function(dir, module) {
    is_development = Config.js_files.development;

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
                var source_path = path.join(dir, js);
                var result = UglifyJS.minify(source_path, {
                    outSourceMap: map_name
                });
                fse.writeFileSync(path.join(target_path, js), result.code);
                //console.log(result.map);
                if(is_development) {
                    var map = JSON.parse(result.map);
                    var output_name = debugJSUrl(module.getName(), js);
                    debug_files[output_name] = fse.readFileSync(source_path);
                    map.sources = [Config.server.url + output_name];
                    fse.writeFileSync(path.join(target_path, map_name), JSON.stringify(map));
                }
            } else {
                fse.copySync(path.join(dir, js), path.join(target_path, js));
            }
        }
    }

    var prefix = Config.js_files.url + '/' + module.getName() + '/';
    return function(url) {
        return prefix + url;
    }
}

exports.name = 'js';
exports.configureModules = function(app) {
    if(Config.js_files.development) {
        app.get(debugJSUrl(":mname", ":jsname"), function(req, res){
            var key = debugJSUrl(req.params.mname, req.params.jsname);
            var file = debug_files[key];
            if(file) {
                res.send(debug_files[key]);
            } else {
                res.send(404);
            }
        });
    }
}