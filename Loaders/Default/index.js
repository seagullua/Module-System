var fs = require('fs');
var path = require('path');

exports.load = function(dir) {
    var result = {};
    var index_file = path.join(dir, 'index.js');

    if(fs.existsSync(index_file)) {
        result = require(index_file);
    }
    var files = fs.readdirSync(dir);
    for(var i=0; i<files.length; ++i) {
        var file = files[i];
        if(file != 'index.js') {
            file = path.join(dir, file);
            var ext = path.extname(file);
            if(ext == ".js") {
                var name = path.basename(file, ext);
                result[name] = require(file);
            }
        }
    }

    //console.log('Default module= '+result);
    return result;

};