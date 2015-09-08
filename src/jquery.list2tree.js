/**
 * @@title
 * @@description
 *
 * Version: @@version
 * Author: @@author_name (@@author_email)
 * License: @@license
 */

(function ($, window, undefined) {
  var pluginName = 'list2tree',
    version = '@@version';

  function Plugin(element, args, existingPlugin) {
    this.name = pluginName;
    this.version = version;

    this.defaults = {};

    this.$element = $(element);

    this.init();
  }

  $.extend(Plugin.prototype, {
    init: function () {
      console.log('Lis2Tree initialised');
    }
  });

  // Create plugin in jQuery namespace.
  $.fn[pluginName] = function () {
    // Get all arguments to pass it to the constructor.
    var args = arguments;
    this.each(function () {
      // Since this plugin maybe applied to the same element multiple times,
      // we need to pass existing plugin instance to new instance to resolve
      // any existing bindings and settings.
      $.data(this, 'plugin_' + pluginName, new Plugin(this, args, $.data(this, 'plugin_' + pluginName)));
    });

    return this;
  };

}(jQuery, window));

