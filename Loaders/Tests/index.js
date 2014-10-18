var Tests = include('Core/Tests');
var fs = require('fs');
var path = require('path');

/**
 * Finds tests in module
 * @param dir
 * @param module
 */
exports.load = function(dir, module) {
    var files = fs.readdirSync(dir);
    for(var i=0; i<files.length; ++i) {
        var js = path.join(dir, files[i]);
        Tests.addTest(module.getName(), js);
    }
}