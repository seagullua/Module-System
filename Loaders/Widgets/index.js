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
    return this.renderTemplate(widget_arguments.view, widget_arguments.options);
}

/**
 * Loads all widgets from given module
 * @param dir
 */
exports.load = function(dir) {
    //Include index.js file
    var data = require(dir);

    //Add each widget into widget list
    for(var key in data) {
        widgets[key] = data[key];
    }
    return widgets;
};
exports.name = "widgets";

exports.configureModules = function(app) {
    //Make all widget from system accessebale in templates
    app.locals.widgets = widgets;

    //Create widget function for rendering widget
    app.locals.widget = widget;
}