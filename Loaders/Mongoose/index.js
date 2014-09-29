//db/User.js
//db/lowercase.js
//exports.name = "User";
//exports.schema = new Schema({...});
//db.User.add({...});
//db.User.schema.add({});
//db.User().update()
//db.findUserById()

var schemes = [];

function isModel(name) {
    var first = name[0];
    return first.toLowerCase() != first;
}


var fs = require('fs');
var path = require('path');

exports.load = function(dir, module) {
    var db_object = {};

    function loadModel(file) {
        var schema = {
            model: null,
            name: null,
            schema: null
        };
        var f = require(file);

        schema.name = f.name;
        schema.schema = f.schema;

        if(schema.name && schema.schema) {
            var func = function() {
                return schema.model;
            }
            func.schema = schema.schema;
            func.name = schema.name;
            func.add = function(option) {
                schema.schema.add(option);
            }
            db_object[schema.name] = func;

            schemes.push(schema);
        }

    }

    function loadService(file) {
        setImmediate(function(){
            var f = require(file);
            for(var key in f) {
                db_object[key] = f[key];
            }
        });
    }

    var files = fs.readdirSync(dir);
    for(var i=0; i<files.length; ++i) {
        var name = files[i];
        var f = path.join(dir, files[i]);
        if(path.extname(f) == '.js') {
            if(isModel(name)) {
                loadModel(f);
            } else {
                loadService(f);
            }
        }
    }
    return db_object;
}

exports.name = 'db';


var mongoose = require('mongoose');
exports.configureBeforeLaunch = function() {
    for(var id in schemes) {
        var schema = schemes[id];

        schema.model = mongoose.model(schema.name, schema.schema);
    }
}