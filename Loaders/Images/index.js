//ideology for Images files

var fs = require('fs');
var path = require('path');
var fse = require('fs-extra');
var ncp = require('ncp').ncp;
ncp.limit = 16;
var Config = include('Core/Config');

exports.load = function(dir, module) {

    //get folder for JS files
    var common_images_folder_path = Config.images_files.path;
    //get long path for this JS file
    var this_images_file_path = dir;

    var target_path = path.join(module.getRootPath(), common_images_folder_path, module.getName());


    //create folder for current JS file
    fse.ensureDirSync(target_path);

    //get all JS files from this module and copy to new place
    ncp(this_images_file_path, target_path, function (err) {
        if (err) {
            return console.error("Can't copy files: ", err);
        }
    });

    var prefix = Config.server.urlcontent + Config.images_files.url + '/' + module.getName() + '/';
    module.getFunctions().frontendFile = function(){
        return '<script>' +
            'window.file = function(url){ return "'+prefix+'" + url;}' +
            '</script>'
    };
    var fn = function(url) {
        return prefix + url;
    };

    var email_prefix = prefix;
    if(email_prefix.substr(0, 4) != "http") {
        email_prefix = "http:" + email_prefix;
    }
    fn.email = function(url) {
        return email_prefix + url;
    };

    return fn;
};

exports.name = 'file';