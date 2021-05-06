
(function (window, document, $) {
  'use strict';

  var $doc = $(document);

  $.site = $.site || {};

  $.extend($.site, {
    _queue: {
      prepare: [],
      run: [],
      complete: []
    },

    run: function () {
      var self = this;

      this.trigger('beforerun', this);
      this.dequeue('run', function () {
        self.trigger('afterrun', self);
      });
    },

    dequeue: function (name, done) {
      var self = this,
        queue = this.getQueue(name),
        fn = queue.shift(),
        next = function () {
          self.dequeue(name, done);
        };

      if (fn) {
        fn.call(this, next);
      } else if ($.isFunction(done)) {
        done.call(this);
      }
    },

    getQueue: function (name) {
      if (!$.isArray(this._queue[name])) {
        this._queue[name] = [];
      }

      return this._queue[name];
    },

    extend: function (obj) {
      $.each(this._queue, function (name, queue) {
        if ($.isFunction(obj[name])) {
          queue.push(obj[name]);

          delete obj[name];
        }
      });

      $.extend(this, obj);

      return this;
    },

    trigger: function (name, data, $el) {
      if (typeof name === 'undefined') return;
      if (typeof $el === 'undefined') $el = $doc;

      $el.trigger(name + '.site', data);
    },

    throttle: function (func, wait) {
      var _now = Date.now || function () {
        return new Date().getTime();
      };
      var context, args, result;
      var timeout = null;
      var previous = 0;

      var later = function () {
        previous = _now();
        timeout = null;
        result = func.apply(context, args);
        context = args = null;
      };

      return function () {
        var now = _now();
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
          context = args = null;
        } else if (!timeout) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
    },

    resize: function () {
      if (document.createEvent) {
        var ev = document.createEvent('Event');
        ev.initEvent('resize', true, true);
        window.dispatchEvent(ev);
      } else {
        element = document.documentElement;
        var event = document.createEventObject();
        element.fireEvent("onresize", event);
      }
    }
  });

  // Configs
  // =======
  $.configs = $.configs || {};

  $.extend($.configs, {
    data: {},
    get: function (name) {
      var callback = function (data, name) {
        return data[name];
      }

      var data = this.data;

      for (var i = 0; i < arguments.length; i++) {
        name = arguments[i];

        data = callback(data, name);
      }

      return data;
    },

    set: function (name, value) {
      this.data[name] = value;
    },

    extend: function (name, options) {
      var value = this.get(name);
      return $.extend(true, value, options);
    }
  });

  // Colors
  // ======
  $.colors = function (name, level) {
    if (name === 'primary') {
      name = $.configs.get('site', 'primaryColor');
      if (!name) {
        name = 'red';
      }
    }

    //if (typeof $.configs.colors[name] !== 'undefined') {
    //  if (level && typeof $.configs.colors[name][level] !== 'undefined') {
    //    return $.configs.colors[name][level];
    //  }

    //  if (typeof level === 'undefined') {
    //    return $.configs.colors[name];
    //  }
    //}

    return null;
  };

  // Components
  // ==========


  $.components = $.components || {};

  $.extend($.components, {
    _components: {},

    register: function (name, obj) {
      this._components[name] = obj;
    },

    init: function (name, context, args) {
      var self = this;

      if (typeof name === 'undefined') {
        $.each(this._components, function (name) {
          self.init(name);
        });
      } else {
        context = context || document;
        args = args || [];

        var obj = this.get(name);

        if (obj) {
          switch (obj.mode) {
            case 'default':
              return this._initDefault(name, context);
            case 'init':
              return this._initComponent(name, obj, context, args);
            case 'api':
              return this._initApi(name, obj, args);
            default:
              this._initApi(name, obj, context, args);
              this._initComponent(name, obj, context, args);
              return;
          }
        }
      }
    },

    call: function (name, context) {
      var args = Array.prototype.slice.call(arguments, 2);
      var obj = this.get(name);

      context = context || document;

      return this._initComponent(name, obj, context, args);
    },

    _initApi: function (name, obj, args) {
      if (typeof obj.apiCalled === 'undefined' && $.isFunction(obj.api)) {
        obj.api.apply(obj, args);

        obj.apiCalled = true;
      }
    },

    _initComponent: function (name, obj, context, args) {
      //if ($.isFunction(obj.init)) {
      //  obj.init.apply(obj, [context].concat(args));
      //}
    },

    _initDefault: function (name, context) {
      if (!$.fn[name]) return;

      var defaults = this.getDefaults(name);

      $('[data-plugin=' + name + ']', context).each(function () {
        var $this = $(this),
          options = $.extend(true, {}, defaults, $this.data());

        $this[name](options);
      });
    },

    getDefaults: function (name) {
      var component = this.get(name);

      if (component && typeof component.defaults !== "undefined") {
        return component.defaults;
      } else {
        return {};
      }
    },

    get: function (name, property) {
      if (typeof this._components[name] !== "undefined") {
        if (typeof property !== "undefined") {
          return this._components[name][property];
        } else {
          return this._components[name];
        }
      } else {
        //console.warn('component:' + component + ' script is not loaded.');

        return undefined;
      }
    }
  });

})(window, document, jQuery);



(function (window, document, $) {
  'use strict';

  var $body = $(document.body);

  // configs setup
  // =============


  window.Site = $.site.extend({
    run: function (next) {
      $('html').removeClass('before-run').addClass('after-run');

      // polyfill
      this.polyfillIEWidth();

      // Menubar setup
      // =============
      $.site.menu.init();

      $(".site-menubar").on('changing.site.menubar', function () {
        $('[data-toggle="menubar"]').each(function () {
          var $this = $(this);
          var $hamburger = $(this).find('.hamburger');

          function toggle($el) {
            $el.toggleClass('hided', !$.site.menubar.opened);
            $el.toggleClass('unfolded', !$.site.menubar.folded);
          }
          if ($hamburger.length > 0) {
            toggle($hamburger);
          } else {
            toggle($this);
          }
        });

        // $.site.menu.refresh();
      });

      $(document).on('click', '[data-toggle="collapse"]', function (e) {
        var $trigger = $(e.target);
        if (!$trigger.is('[data-toggle="collapse"]')) {
          $trigger = $trigger.parents('[data-toggle="collapse"]');
        }
        var href;
        var target = $trigger.attr('data-target') || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '');
        var $target = $(target);
        if ($target.hasClass('navbar-search-overlap')) {
          $target.find('input').focus();

          e.preventDefault();
        } else if ($target.attr('id') === 'site-navbar-collapse') {
          var isOpen = !$trigger.hasClass('collapsed');
          $body.addClass('site-navbar-collapsing');

          $body.toggleClass('site-navbar-collapse-show', isOpen);

          setTimeout(function () {
            $body.removeClass('site-navbar-collapsing');
          }, 350);

          if (isOpen) {
            $.site.menubar.scrollable.update();
          }
        }
      });

      $(document).on('click', '[data-toggle="menubar"]', function () {
        $.site.menubar.toggle();

        return false;
      });

      $.site.menubar.init();

      Breakpoints.on('change', function () {
        $.site.menubar.change();
      });

      // Gridmenu setup
      // =============
      $(document).on('click', '[data-toggle="gridmenu"]', function () {
        var $this = $(this);
        var active = $this.hasClass('active');

        $body.toggleClass('site-gridmenu-active', !active);

        if (active) {
          $this.removeClass('active')
            .attr('aria-expanded', false);
        } else {
          $this.addClass('active')
            .attr('aria-expanded', true);
        }
      });

      // Sidebar setup
      // =============
      //$.site.sidebar.init();

      // Tooltip setup
      // =============
      $(document).tooltip({
        selector: '[data-tooltip=true]',
        container: 'body'
      });

      $('[data-toggle="tooltip"]').tooltip();
      $('[data-toggle="popover"]').popover();

      // Fullscreen
      // ==========
      $(document).on('click', '[data-toggle="fullscreen"]', function () {
        if (screenfull.enabled) {
          screenfull.toggle();
        }

        return false;
      });



      // Dropdown menu setup
      // ===================
      $body.on('click', '.dropdown-menu-media', function (e) {
        e.stopPropagation();
      });


      // Page Animate setup
      // ==================
      this.loadAnimate(function () {
        $('.animsition').css({
          "animation-duration": '0s'
        });
        next();
      });

      // Mega navbar setup
      // =================
      $(document).on('click', '.navbar-mega .dropdown-menu', function (e) {
        e.stopPropagation();
      });


      $(document).on('show.bs.dropdown', function (e) {
        var $target = $(e.target);
        var $trigger = e.relatedTarget ? $(e.relatedTarget) : $target.children('[data-toggle="dropdown"]');

        var animation = $trigger.data('animation');
        if (animation) {
          var $menu = $target.children('.dropdown-menu');
          $menu.addClass('animation-' + animation);

          $menu.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            $menu.removeClass('animation-' + animation);
          });
        }
      });

      $(document).on('shown.bs.dropdown', function (e) {
        var $target = $(e.target);
        var $menu = $target.find('.dropdown-menu-media > .list-group');

        if ($menu.length > 0) {
          var api = $menu.data('asScrollable');
          if (api) {
            api.update();
          } else {
            var defaults = $.components.getDefaults("scrollable");
            $menu.asScrollable(defaults);
          }
        }
      });

      // handleSidebar setup
      // ===================
      $(document).on('click', '.page-aside-switch', function () {
        var isOpen = $('.page-aside').hasClass('open');

        if (isOpen) {
          $('.page-aside').removeClass('open');
        } else {
          $('.page-aside').addClass('open');
        }
      });

      // Init Loaded Components
      // ======================
      $.components.init();


    },

    polyfillIEWidth: function () {
      if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
        var msViewportStyle = document.createElement('style');
        msViewportStyle.appendChild(
          document.createTextNode(
            '@-ms-viewport{width:auto!important}'
          )
        );
        document.querySelector('head').appendChild(msViewportStyle);
      }
    },

    loadAnimate: function (callback) {
      return $.components.call("animsition", document, callback);
    },


  });

})(window, document, jQuery);


(function (window, document, $) {
  'use strict';

  $.site.menu = {
    speed: 250,
    accordion: true, // A setting that changes the collapsible behavior to expandable instead of the default accordion style

    init: function () {
      this.$instance = $('.site-menu');

      this.bind();
    },

    bind: function () {
      var self = this;

      this.$instance.on('mouseenter.site.menu', '.site-menu-item', function () {
        if ($.site.menubar.folded === true && $(this).is('.has-sub')) {
          var $sub = $(this).children('.site-menu-sub');
          self.position($(this), $sub);
        }

        $(this).addClass('hover');
      }).on('mouseleave.site.menu', '.site-menu-item', function () {
        $(this).removeClass('hover');
      }).on('deactive.site.menu', '.site-menu-item.active', function (e) {
        var $item = $(this);

        $item.removeClass('active');

        e.stopPropagation();
      }).on('active.site.menu', '.site-menu-item', function (e) {
        var $item = $(this);

        $item.addClass('active');

        e.stopPropagation();
      }).on('open.site.menu', '.site-menu-item', function (e) {
        var $item = $(this);

        self.expand($item, function () {
          $item.addClass('open');
        });

        if (self.accordion) {
          $item.siblings('.open').trigger('close.site.menu');
        }

        e.stopPropagation();
      }).on('close.site.menu', '.site-menu-item.open', function (e) {
        var $item = $(this);

        self.collapse($item, function () {
          $item.removeClass('open');
        });

        e.stopPropagation();
      }).on('click.site.menu', '.site-menu-item', function (e) {
        if ($(this).is('.has-sub')) {
          e.preventDefault();

          if ($(this).is('.open')) {
            $(this).trigger('close.site.menu');
          } else {
            $(this).trigger('open.site.menu');
          }
        } else {
          if (!$(this).is('.active')) {
            $(this).siblings('.active').trigger('deactive.site.menu');
            $(this).trigger('active.site.menu');
          }
        }

        e.stopPropagation();
      });
    },

    collapse: function ($item, callback) {
      var self = this;
      var $sub = $item.children('.site-menu-sub');

      $sub.show().slideUp(this.speed, function () {
        $(this).css('display', '');

        $(this).find('> .site-menu-item').removeClass('is-shown');

        if (callback) {
          callback();
        }

        self.$instance.trigger('collapsed.site.menu');
      });
    },

    expand: function ($item, callback) {
      var self = this;
      var $sub = $item.children('.site-menu-sub');
      var $children = $sub.children('.site-menu-item').addClass('is-hidden');

      $sub.hide().slideDown(this.speed, function () {
        $(this).css('display', '');

        if (callback) {
          callback();
        }

        self.$instance.trigger('expanded.site.menu');
      });

      setTimeout(function () {
        $children.addClass('is-shown');
        $children.removeClass('is-hidden');
      }, 0);
    },

    refresh: function () {
      this.$instance.find('.open').removeClass('open');
    },

    position: function ($item, $dropdown) {
      var offsetTop = $item.position().top,
        dropdownHeight = $dropdown.outerHeight(),
        menubarHeight = $('.site-menubar').outerHeight();

      if ((offsetTop + dropdownHeight > menubarHeight) && (offsetTop > menubarHeight / 2)) {
        $dropdown.addClass('site-menu-sub-up');
      } else {
        $dropdown.removeClass('site-menu-sub-up');
      }
    }
  };
})(window, document, jQuery);



(function (window, document, $) {
  'use strict';

  var $body = $('body');

  $.site.menubar = {
    opened: null,
    folded: null,
    top: false,
    $instance: null,
    auto: true,
    scrollable: {
      api: null,

      init: function () {
        // this.api = $.site.menubar.$instance.children('.site-menubar-body').asScrollable({
        //   namespace: 'scrollable',
        //   skin: 'scrollable-inverse',
        //   direction: 'vertical',
        //   contentSelector: '>',
        //   containerSelector: '>'
        // }).data('asScrollable');
      },

      update: function () {
        if (this.api) {
          this.api.update();
        }
      },

      enable: function () {
        if (!this.api) {
          this.init();
        }
        if (this.api) {
          this.api.enable();
        }
      },

      disable: function () {
        if (this.api) {
          this.api.disable();
        }
      }
    },

    hoverscroll: {
      api: null,

      init: function () {
        // this.api = $.site.menubar.$instance.children('.site-menubar-body').asHoverScroll({
        //   namespace: 'hoverscorll',
        //   direction: 'vertical',
        //   list: '.site-menu',
        //   item: '> li',
        //   exception: '.site-menu-sub',
        //   fixed: false,
        //   boundary: 60,
        //   onEnter: function () {
        //     //$(this).siblings().removeClass('hover');
        //     //$(this).addClass('hover');
        //   },
        //   onLeave: function () {
        //     //$(this).removeClass('hover');
        //   }
        // }).data('asHoverScroll');
      },

      update: function () {
        if (this.api) {
          this.api.update();
        }
      },

      enable: function () {
        if (!this.api) {
          this.init();
        }
        if (this.api) {
          this.api.enable();
        }
      },

      disable: function () {
        if (this.api) {
          this.api.disable();
        }
      }
    },

    init: function () {
      this.$instance = $(".site-menubar");

      var self = this;

      if ($body.is('.site-menubar-top')) {
        this.top = true;
      }

      if ($body.data('autoMenubar') === false) {
        if ($body.hasClass('site-menubar-fold')) {
          this.auto = 'fold';
        } else if ($body.hasClass('site-menubar-unfold')) {
          this.auto = 'unfold';
        }
      }

      // bind events
      /* $.site.menu.$instance.on('collapsed expanded', function(e){
           self.update();
       });*/

      this.$instance.on('changed.site.menubar', function () {
        self.update();
      });

      this.change();
    },

    change: function () {
      var breakpoint = Breakpoints.current();
      if (this.auto !== true) {
        switch (this.auto) {
          case 'fold':
            this.reset();
            if (breakpoint.name == 'xs') {
              this.hide();
            } else {
              this.fold();
            }
            return;
          case 'unfold':
            this.reset();
            if (breakpoint.name == 'xs') {
              this.hide();
            } else {
              this.unfold();
            }
            return;
        }
      }

      this.reset();

      if (breakpoint) {
        switch (breakpoint.name) {
          case 'lg':
            this.unfold();
            break;
          case 'md':
          case 'sm':
            this.fold();
            break;
          case 'xs':
            this.hide();
            break;
        }
      }
    },

    animate: function (doing, callback) {
      var self = this;
      $body.addClass('site-menubar-changing');

      doing.call(self);
      this.$instance.trigger('changing.site.menubar');

      setTimeout(function () {
        callback.call(self);
        $body.removeClass('site-menubar-changing');

        self.$instance.trigger('changed.site.menubar');
      }, 500);
    },

    reset: function () {
      this.opened = null;
      this.folded = null;
      $body.removeClass('site-menubar-hide site-menubar-open site-menubar-fold site-menubar-unfold');
    },

    open: function () {
      if (this.opened !== true) {
        this.animate(function () {
          $body.removeClass('site-menubar-hide').addClass('site-menubar-open site-menubar-unfold');
          this.opened = true;

        }, function () {
          this.scrollable.enable();
        });
      }
    },

    hide: function () {
      this.hoverscroll.disable();

      if (this.opened !== false) {
        this.animate(function () {
          $body.removeClass('site-menubar-open').addClass('site-menubar-hide site-menubar-unfold');
          this.opened = false;

        }, function () {
          this.scrollable.enable();
        });
      }
    },

    unfold: function () {
      this.hoverscroll.disable();

      if (this.folded !== false) {
        this.animate(function () {
          $body.removeClass('site-menubar-fold').addClass('site-menubar-unfold');
          this.folded = false;

        }, function () {
          this.scrollable.enable();

          if (this.folded !== null) {
            $.site.resize();
          }
        });
      }
    },

    fold: function () {
      this.scrollable.disable();

      if (this.folded !== true) {
        this.animate(function () {
          $body.removeClass('site-menubar-unfold').addClass('site-menubar-fold');
          this.folded = true;

        }, function () {
          this.hoverscroll.enable();

          if (this.folded !== null) {
            $.site.resize();
          }
        });
      }
    },

    toggle: function () {
      var breakpoint = Breakpoints.current();
      var folded = this.folded;
      var opened = this.opened;

      switch (breakpoint.name) {
        case 'lg':
          if (folded === null || folded === false) {
            this.fold();
          } else {
            this.unfold();
          }
          break;
        case 'md':
        case 'sm':
          if (folded === null || folded === true) {
            this.unfold();
          } else {
            this.fold();
          }
          break;
        case 'xs':
          if (opened === null || opened === false) {
            this.open();
          } else {
            this.hide();
          }
          break;
      }
    },

    update: function () {
      this.scrollable.update();
      this.hoverscroll.update();
    }
  };
})(window, document, jQuery);


$.components.register("pieProgress", {
  mode: "init",
  defaults: {
    namespace: "pie-progress",
    speed: 30,
    classes: {
      svg: "pie-progress-svg",
      element: "pie-progress",
      number: "pie-progress-number",
      content: "pie-progress-content"
    }
  },
  init: function (context) {
    if (!$.fn.asPieProgress) return;

    var defaults = $.components.getDefaults("pieProgress");

    $('[data-plugin="pieProgress"]', context).each(function () {
      var $this = $(this),
        options = $this.data();

      options = $.extend(true, {}, defaults, options);

      $this.asPieProgress(options);
    });
  }
});




$('.clickable').on('click', 'td:not(.not-clickable)', function () {
  window.location = $(this).closest('tr').data('url');
});


