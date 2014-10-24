//db/User.js
//db/lowercase.js
//exports.name = "User";
//exports.schema = new Schema({...});
//db.User.add({...});
//db.User.schema.add({});
//db.User().update()
//db.findUserById()

var schemes = [];

var Config = include('Core/Config');



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
            };
            func.schema = schema.schema;
            func.name = schema.name;
            func.add = function(option) {
                schema.schema.add(option);
            };
            db_object[schema.name] = func;
            if(!schema.noModel) {
                schemes.push(schema);
            }

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
};

exports.name = 'db';


var mongoose = require('mongoose');

/**
 * Saves the schema for future view
 * @param name
 * @param schema
 */
function saveDebugSchema(name, schema) {
    var cache = [];

    function fix_circular(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        //Nested schemas export
        if(Array.isArray(value)) {
            if(value.length == 1 && 'tree' in value[0]) {
                return [value[0].tree];
            }
            return null;
        }
        return value;
    }

    var file_name = path.join(Config.rootPath, Config.dbSettings.debug.schemasFolder, name+".json");

    console.log(name, schema.tree);
    fs.writeFile(file_name, JSON.stringify(schema.tree, fix_circular, 4));
}

exports.configureBeforeLaunch = function() {
    var schemas_debug_enabled = Config.dbSettings.debug.generateSchemas;

    for(var id in schemes) {
        var schema = schemes[id];
        schema.model = mongoose.model(schema.name, schema.schema);
        if(schemas_debug_enabled) {
            saveDebugSchema(schema.name, schema.schema);
        }
    }

    mongoose.connect('mongodb://'+Config.dbSettings.host+'/'+Config.dbSettings.db);
    var db = mongoose.connection;

    db.on('error', function (err) {
        console.log('connection error:', err.message);
    });

    db.once('open', function callback () {
        console.log("Connected to DB!");
    });
};