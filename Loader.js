var root_path = "";
var verbose = false;
var fs = require('fs');
var path = require('path');

/**
 * The list of functions to be called to init modules
 * @type {{modules: Array, routers: Array, error_handlers: Array}}
 */
var launchers = {
    modules: [],
    routers: [],
    error_handlers: []
};

/**
 * Different loaders for different paths
 * @type {{}}
 */
var loaders = {};
var default_loader;
/**
 * Module names should be uppercased
 * @param name
 */
function isModuleName(name) {
    var first_letter = name[0];
    return name != '_' && first_letter && first_letter == first_letter.toUpperCase();
}

function ModuleCache(root, package_name) {
    var cache = {};
    var function_cache = {};

    function loadModule(name) {
        if(isModuleName(name)) {
            var module_name = name;
            if(package_name) {
                module_name = package_name + "/" + name;
            }
            var module = new Module(path.join(root, name), module_name);
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

function Module(dir, module_name) {
    if(verbose) {
        console.log("[M] Loading: ", dir);
    }

    var index_file = path.join(dir, 'launch.js');
    var is_loaded = fs.existsSync(dir);
    var submodules = new ModuleCache(dir, module_name);
    var functions = submodules.getFunctions();

    if(!is_loaded) {
        console.error('[Module] Not found: ', dir);
    }

    var dirname = dir;
    var me = this;
    this.getName = function() {
        return module_name;
    }

    this.init = function() {
        var dir = path.join(dirname, '_');
        var index = path.join(dirname, 'index.js');
        if(fs.existsSync(index)){
            if(verbose) {
                console.log("[M] Module index.js: ", index);
            }
            var module = require(index);

            for(var key in module) {
                var func = module[key];
                if(key == "configureModules") {
                    launchers.modules.push(func);
                } else if(key == "configureRouters") {
                    launchers.routers.push(func);
                } else if(key == "configureErrorHandlers") {
                    launchers.error_handlers.push(func);
                } else {
                    functions[key] = func;
                }
            }
        }

        //Load module subfolders
        function loadJSFiles(dir) {
            if(!fs.existsSync(dir)) {
                return;
            }
            var files = fs.readdirSync(dir);
            for(var i=0; i<files.length; ++i) {
                var file = files[i];
                //console.log(file);
                if(!isModuleName(file)) {
                    var full_path = path.join(dir, files[i]);
                    if(fs.statSync(full_path).isDirectory()) {
                        var loaded;
                        var name = path.basename(file);
                        if(file in loaders) {
                            var loader = loaders[file];
                            loaded = loader.load(full_path, me);
                            if('name' in loader && loader.name) {
                                name = loader.name;
                            }
                        } else {
                            loaded = default_loader.load(full_path, me);
                        }
                        if(loaded) {
                            functions[name] = loaded;
                        }
                    }
                }
            }
        }

        //From root
        loadJSFiles(dirname);
        //From _ folder
        loadJSFiles(dir);
    }

    this.isValid = function() {
        return is_loaded;
    }

    this.getModule = function(name) {
        return submodules.getModule(name);
    }

    this.getFunctions = function() {
        return functions;
    }

    this.getRootPath = function() {
        return root_path;
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

    console.log("M: ",name);
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

function setPathLoader(path_name, module_name) {
    loaders[path_name] = include(module_name);
}

function makeVerbose() {
    verbose = true;
}

function load() {
    default_loader = include('System/Loaders/Default');
    setPathLoader('_', 'System/Loaders/None');
    setPathLoader('frontend_js', 'System/Loaders/JS');
    setPathLoader('frontend_less', 'System/Loaders/Less');
    setPathLoader('frontend_files', 'System/Loaders/Images');
    setPathLoader('views', 'System/Loaders/View');
    setPathLoader('locales', 'System/Loaders/Locale');
}

function configureModules(app) {
    for(var i=0; i<launchers.modules.length; ++i) {
        launchers.modules[i](app);
    }
}

function configureRouters(app) {
    for(var i=0; i<launchers.routers.length; ++i) {
        launchers.routers[i](app);
    }
}

function configureErrorHandlers(app) {
    var length = launchers.error_handlers.length;
    for(var i=0; i<length; ++i) {
        launchers.error_handlers[length-i-1](app);
    }
}

module.exports = {
    setRootPath: setRootPath,
    makeVerbose: makeVerbose,
    setPathLoader: setPathLoader,
    load: load,
    configureModules: configureModules,
    configureRouters: configureRouters,
    configureErrorHandlers: configureErrorHandlers
};
