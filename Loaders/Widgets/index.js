var widgets = {};

/**
 * This function renders widget. To be rendered it need to know .ejs file name and
 * arguments that should be passed to it.
 *
 *
 * @param widget_arguments.view file name to render views
 * @param widget_arguments.options options that should be passed to the view
 */
function widget(widget_arguments) {
    //this will be the app.locals in view
    if('ME' in widget_arguments) {
        widget_arguments.options.ME = widget_arguments.ME;
    }
    return this.renderTemplate(widget_arguments.view, widget_arguments.options);
}

/**
 * Extends function with module arguments
 * @param old_function
 * @param module
 */
function wrapFunction(old_function, module) {

    var ME = module.getFunctions();

    return function() {
        var res = old_function.apply(ME, arguments);
        //If the function is real widget it should have view member
        if(typeof res == "object") {
            if('view' in res) {
                res.ME = ME;
            }
        }
        return res;
    };
}

/**
 * Loads all widgets from given module
 * @param dir
 */
exports.load = function(dir, module) {
    //Include index.js file
    var data = require(dir);

    //Add each widget into widget list
    for(var key in data) {
        widgets[key] = wrapFunction(data[key], module);
    }
    return widgets;
};
exports.name = "widgets";

exports.configureModules = function(app) {
    //Make all widget from system accessebale in templates
    app.locals.widgets = widgets;

    //Create widget function for rendering widget
    app.locals.widget = widget;
};