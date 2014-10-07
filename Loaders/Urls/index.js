var Urls = include('Core/Urls');

exports.load = function(dir) {
    var data = require(dir);

    for(var key in data) {
        Urls.addUrl(key, data[key]);
    }
};