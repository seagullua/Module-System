var root_path = "";
var verbose = false;
var fs = require('fs');
var path = require('path');


function ModuleCache(root) {
    var cache = {};
//    var function_cache = function(){
//        parent.onCall(arguments);
//    };
    var function_cache = {};

    function loadModule(name) {
        if(name != '_') {
            var module = new Module(path.join(root, name));
            if(module.isValid()) {
                cache[name] = module;
                module.init();
                function_cache[name] = module.getFunctions();
            } else {
                cache[name] = null;
            }
        }
    }

    this.getModule = function(name) {
        if(!(name in cache)) {
            loadModule(name);
        }
        return cache[name];
    }

    this.getFunctions = function() {
        return function_cache;
    }
}

function loadDirCode(dir) {
    var result = {};
    var index_file = path.join(dir, 'index.js');

    if(verbose) {
        console.log("[M] Read Dir: ", dir);
    }
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

    return result;
}

function Module(dir) {
    if(verbose) {
        console.log("[M] Loading: ", dir);
    }
    var index_file = path.join(dir, 'launch.js');
    var is_loaded = fs.existsSync(dir);
    var submodules = new ModuleCache(dir);
    var functions = submodules.getFunctions();

    if(!is_loaded) {
        console.error('[Module] Not found: ', dir);
    }

    var dirname = dir;
    this.init = function() {
        var dir = path.join(dirname, '_');
        var index = path.join(dirname, 'index.js');
        if(fs.existsSync(index)){
            if(verbose) {
                console.log("[M] Module index.js: ", index);
            }
            var module = require(index);

            for(var key in module) {
                functions[key] = module[key];
            }
        }
        //console.log(dirname, functions);
        if(!fs.existsSync(dir)) {
            return;
        }
        var files = fs.readdirSync(dir);
        for(var i=0; i<files.length; ++i) {
            var file = files[i];
            if(file != 'frontend') {
                var full_path = path.join(dir, files[i]);
                if(fs.statSync(full_path).isDirectory()) {
                    var name = path.basename(file);
                    functions[name] = loadDirCode(full_path);
                }
            }
        }

    }

    this.isValid = function() {
        return is_loaded;
    }

    this.getModule = function(name) {
        return submodules.getModule(name);
    }

    this.getFunctions = function() {
        //console.log(dirname, functions);
        return functions;
    }
}

var cache;
var quick_cache = {};

function rootModule(name) {
    if(!(name in global)) {
        global[name] = cache.getModule(name).getFunctions();
    }
}

global.include = function(name) {

    if(name in quick_cache) {
        return quick_cache[name];
    }

    if(!cache) {
        cache = new ModuleCache(root_path);
    }
    var module = cache;
    var names = name.split('/');
    rootModule(names[0]);
    for(var i=0; i<names.length; ++i) {
        if(module) {
            module = module.getModule(names[i]);
        }
    }

    var res;
    if(module) {
        res = module.getFunctions();
    }

    quick_cache[name] = res;
    return res;
}

/**
 * Sets the path where modules are located
 * @param path
 */
function setRootPath(path) {
    root_path = path;
}

function makeVerbose() {
    verbose = true;
}

module.exports = {
    setRootPath: setRootPath,
    makeVerbose: makeVerbose
};
