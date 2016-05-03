/**
 * @@title
 * @@description
 *
 * Version: @@version
 * Author: @@author_name (@@author_email)
 * License: @@license
 */

(function ($) {
  var pluginName = 'list2tree',
    version = '@@version';

  function Plugin(element, options) {
    this.name = pluginName;
    this.version = version;

    this.STATE_COLLAPSED = 'collapsed';
    this.STATE_EXPANDED = 'expanded';

    this.CLASS_LEAF_COLLAPSED = 'js-list2tree-leaf-collapsed';
    this.CLASS_TRIGGER_COLLAPSED = 'js-list2tree-trigger-collapsed';
    this.CLASS_TRIGGER_EXPANDED = 'js-list2tree-trigger-expanded';
    this.CLASS_DEPTH = 'js-list2tree-leaf-depth';
    this.CLASS_TRIGGER = 'js-list2tree-trigger';

    this.TRIGGER_POSITION_BEFORE = 'before';
    this.TRIGGER_POSITION_AFTER = 'after';

    this.options = $.extend({}, {
      leafSelector: '.js-list2tree-leaf',
      prefix: '-',
      wrapperDepth: 0,
      depthClass: 'leaf-depth',
      triggerExpandedClass: 'trigger-expanded',
      triggerCollapsedClass: 'trigger-collapsed',
      triggerPosition: this.TRIGGER_POSITION_BEFORE,
      state: this.STATE_EXPANDED,
      removePrefix: true
    }, options);

    this.$element = $(element);

    this.init();
  }

  $.extend(Plugin.prototype, {
    init: function () {
      var self = this;
      // Process depths of all elements. Depths are used for all structural
      // interactions.
      self.processDepths();

      if (self.options.removePrefix) {
        self.removePrefixes();
      }

      // Attach triggers to all parents.
      self.getAllParents().each(function () {
        var $trigger = self.attachTrigger($(this));
        if (self.options.state === self.STATE_COLLAPSED) {
          $trigger.trigger('click');
        }
      });
    },
    attachTrigger: function ($leaf) {
      var self = this;
      var $trigger = self.isExpanded($leaf) ? self.renderTrigger($leaf, self.STATE_EXPANDED) : self.renderTrigger($leaf, self.STATE_COLLAPSED);

      $trigger.on('click', function () {
        var $this = $(this);
        var $currentLeaf = $this.parent();
        if (self.isExpanded($currentLeaf)) {
          // Collapse all children that are parents.
          self.getChildren($currentLeaf).each(function () {
            var $this = $(this);
            if (self.isParent($this) && self.isExpanded($this)) {
              self.getTrigger($this).trigger('click');
            }
          });
          self.collapse($currentLeaf);
          self.renderTrigger($currentLeaf, self.STATE_COLLAPSED);
        }
        else {
          self.expand($currentLeaf);
          self.renderTrigger($currentLeaf, self.STATE_EXPANDED);
        }
      });

      return $trigger;
    },
    renderTrigger: function ($leaf, state) {
      var self = this;
      var $trigger = self.getTrigger($leaf);

      var classes = [
        self.CLASS_TRIGGER,
        state === this.STATE_COLLAPSED ? self.CLASS_TRIGGER_COLLAPSED : self.CLASS_TRIGGER_EXPANDED,
        state === this.STATE_COLLAPSED ? self.options.triggerCollapsedClass : self.options.triggerExpandedClass
      ];

      if ($trigger.length === 0) {
        $trigger = $('<span class="' + classes.join(' ') + '"></span>');
        if (self.options.triggerPosition === self.TRIGGER_POSITION_BEFORE) {
          $trigger.prependTo($leaf);
        }
        else {
          $trigger.appendTo($leaf);
        }
      }
      else {
        $trigger.attr('class', classes.join(' '));
      }

      return $trigger;
    },
    getTrigger: function ($leaf) {
      return $leaf.find('.' + this.CLASS_TRIGGER);
    },
    isCollapsed: function ($leaf) {
      return $leaf.hasClass(this.CLASS_LEAF_COLLAPSED);
    },
    isExpanded: function ($leaf) {
      return !this.isCollapsed($leaf);
    },
    expand: function ($leaf) {
      this.getChildren($leaf).show();
      $leaf.removeClass(this.CLASS_LEAF_COLLAPSED);
    },
    collapse: function ($leaf) {
      this.getChildrenAll($leaf).hide();
      $leaf.addClass(this.CLASS_LEAF_COLLAPSED);
    },
    isChecked: function ($el) {
      return $el.find('input[type="checkbox"]').is(':checked');
    },
    processDepths: function () {
      var self = this;
      this.getLeaves().each(function () {
        var $el = $(this);
        var elementDepth = self.getDepthFromText(self.getText($el), self.options.prefix);
        $el.addClass(self.CLASS_DEPTH + '-' + elementDepth);
        $el.addClass(self.options.depthClass + '-' + elementDepth);
      });
    },
    removePrefixes: function () {
      var self = this;
      this.getLeaves().each(function () {
        // console.log($(this));
        // $(this).css('border', 'solid 1px red');
        var string = self.getText($(this));
        while (string.indexOf(self.options.prefix) === 0) {
          string = string.substr(self.options.prefix.length);
        }
        self.setText($(this), string);
      });
    },
    getLeaves: function () {
      return this.$element.find(this.options.leafSelector);
    },
    // Get all parent elements that have children.
    getAllParents: function () {
      var self = this;
      return self.getLeaves().filter(function () {
        return self.isParent($(this));
      });
    },
    isParent: function ($el) {
      return this.getChildrenAll($el).length > 0;
    },
    // Get only immediate children.
    getChildren: function ($el) {
      var self = this;
      var $children = self.getChildrenAll($el);
      var depth = self.getDepth($el);
      $children = $children.filter(function () {
        return self.getDepth($(this)) === depth + 1;
      });

      return $children;
    },
    // Get all children with grand children etc.
    getChildrenAll: function ($el) {
      var self = this;
      var $children = $();
      var elementDepth = self.getDepth($el);
      var $sibling = $el.next();

      while ($sibling.length > 0) {
        var siblingDepth = self.getDepth($sibling);
        if (siblingDepth <= elementDepth) {
          break;
        }
        $children = $children.add($sibling);
        $sibling = $sibling.next();
      }

      return $children;
    },
    getDepth: function ($el) {
      var depth = 0;
      var re = new RegExp(this.CLASS_DEPTH + '-([0-9]+)', 'i');
      var classes = $el.attr('class').split(' ');
      for (var i in classes) {
        if (classes.hasOwnProperty(i)) {
          var match = classes[i].match(re);
          if (match && match.length > 1) {
            depth = parseInt(match[1], 10);
            break;
          }
        }
      }
      return depth;
    },
    getText: function ($el) {
      return $el.find('label').text();
    },
    setText: function ($el, text) {
      $el.find('label').text(text);
    },
    getDepthFromText: function (string, prefix) {
      var count = 0;
      while (string.indexOf(prefix) === 0) {
        count++;
        string = string.substr(prefix.length);
      }

      return count;
    }
  });

  // Create plugin in jQuery namespace.
  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' +
          pluginName, new Plugin(this, options));
      }
    });
  };

}(jQuery));
