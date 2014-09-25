function TranslationCache() {
    var storage = {};

    this.add = function(lang, map) {
        for(var lang_id in storage) {
            var one_language = storage[lang_id];
            for(var key in one_language) {
                if(!(key in map)) {
                    map[key] = one_language[key];
                }
            }
        }

        storage[lang] = map;
    }

    this.exportLocale = function(locale) {
        for(var lang in storage) {
            if(!(lang in locale)) {
                locale[lang] = {};
            }
            var target = locale[lang];

            var source = storage[lang];
            for(var key in source) {
                target[key] = source[key];
            }
        }
    }
}

var i18n = require("i18n");
var Config = include("Core/Config");

var fse = require('fs-extra');
var path = require('path');

exports.load = function(dir) {
    var cache = new TranslationCache();

    var supported_localed = Config.locale.supported;
    for(var i=0; i<supported_localed.length; ++i) {
        var lang = supported_localed[i];
        var file_name = path.join(dir, lang + ".json");
        if(fse.existsSync(file_name)) {
            var tr = fse.readJSONSync(file_name);
            cache.add(lang, tr);
        }
    }

    cache.exportLocale(i18n.locales);
}
exports.name = "locale";