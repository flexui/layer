(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
  typeof define === 'function' && define.amd ? define('layer', ['jquery'], factory) :
  (global.Layer = factory(global.jQuery));
}(this, (function ($) { 'use strict';

  $ = 'default' in $ ? $['default'] : $;

  var AP = Array.prototype;


  /**
   * 获取数据类型
   *
   * @export
   * @param {any} value
   * @returns
   */


  /**
   * 函数判定
   *
   * @export
   * @param {any} value
   * @returns
   */


  /**
   * 字符串判定
   *
   * @export
   * @param {any} value
   * @returns
   */


  /**
   * 数字判定
   *
   * @export
   * @param {any} value
   * @returns
   */


  /**
   * NaN判定
   *
   * @export
   * @param {any} value
   * @returns
   */

  // jquery 对象
  var win = $(window);
  var doc = $(document);

  /**
   * 属性拷贝
   *
   * @export
   * @param {Object} target 目标对象
   * @param {Object} seed 继承对象
   * @param {Array} list 名单
   * @param {Boolean} isWhite 是否是白名单
   */
  function mix(target, seed, list, isWhite) {
    if (!Array.isArray(list)) {
      list = false;
    }

    var index;

    // Copy "all" properties including inherited ones.
    for (var prop in seed) {
      if (seed.hasOwnProperty(prop)) {
        // 检测白名单
        if (list) {
          index = list.indexOf(prop);

          // 区分黑白名单
          if (isWhite ? index === -1 : index !== -1) {
            continue;
          }
        }

        // 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除
        if (prop !== 'prototype') {
          target[prop] = seed[prop];
        }
      }
    }
  }

  /**
   * 继承
   *
   * @export
   * @param {Class} ctor
   * @param {Class} superCtor
   * @param {Object} properties
   * @returns {ctor}
   */
  function inherits(ctor, superCtor, properties) {
    if (ctor.setPrototypeOf) {
      ctor.setPrototypeOf(superCtor.prototype);
    } else if (ctor.__proto__) {
      ctor.__proto__ = superCtor.prototype;
    } else {
      // constructor
      function Ctor() {}

      // prototype
      Ctor.prototype = superCtor.prototype;
      ctor.prototype = new Ctor();
    }

    ctor.prototype.constructor = ctor;

    // 混合属性
    mix(ctor, properties);

    return ctor;
  }

  /**
   * 高性能 apply
   *
   * @param  {Function} fn
   * @param  {Any} context
   * @param  {Array} args
   * call is faster than apply, optimize less than 6 args
   * https://github.com/micro-js/apply
   * http://blog.csdn.net/zhengyinhui100/article/details/7837127
   */
  function apply(fn, context, args) {
    switch (args.length) {
      // faster
      case 0:
        return fn.call(context);
      case 1:
        return fn.call(context, args[0]);
      case 2:
        return fn.call(context, args[0], args[1]);
      case 3:
        return fn.call(context, args[0], args[1], args[2]);
      default:
        // slower
        return fn.apply(context, args);
    }
  }

  var slice = AP.slice;

  function Events() {
    // Keep this empty so it's easier to inherit from
    // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
  }

  Events.prototype = {
    on: function(name, listener, context) {
      var self = this;
      var e = self.e || (self.e = {});

      context = arguments.length < 3 ? self : context;

      (e[name] || (e[name] = [])).push({
        fn: listener,
        context: context
      });

      return self;
    },
    once: function(name, listener, context) {
      var self = this;

      function feedback() {
        self.off(name, feedback);
        apply(listener, this, arguments);
      }

      return self.on(name, feedback, context);
    },
    emit: function(name) {
      var context = this;
      var data = slice.call(arguments, 1);
      var e = context.e || (context.e = {});
      var listeners = e[name] || [];
      var listener;

      // emit events
      for (var i = 0, length = listeners.length; i < length; i++) {
        listener = listeners[i];

        apply(listener.fn, listener.context, data);
      }

      return context;
    },
    off: function(name, listener, context) {
      var self = this;
      var e = self.e || (self.e = {});
      var length = arguments.length;

      switch (length) {
        case 0:
          self.e = {};
          break;
        case 1:
          delete e[name];
          break;
        default:
          if (listener) {
            var listeners = e[name];

            if (listeners) {
              context = length < 3 ? self : context;
              length = listeners.length;

              for (var i = 0; i < length; i++) {
                if (evts[i].fn === listener && evts[i].fn.context === context) {
                  listeners.splice(i, 1);
                  break;
                }
              }

              // Remove event from queue to prevent memory leak
              // Suggested by https://github.com/lazd
              // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910
              if (!listeners.length) {
                delete e[name];
              }
            }
          }
          break;
      }

      return self;
    }
  };

  var ZINDEX = 1024;

  var BACKDROP = {
    // 遮罩分配
    alloc: [],
    // 遮罩节点
    node: $('<div tabindex="0"></div>').css({
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      userSelect: 'none'
    }),
    // 锁定 tab 焦点层
    shim: $('<div tabindex="0"></div>').css({
      width: 0,
      height: 0,
      opacity: 0
    }),
    /**
     * 设置弹窗层级
     */
    zIndex: function(zIndex) {
      // 最小为 0
      zIndex = Math.max(0, --zIndex);

      // 设定 z-index
      BACKDROP.node.css('z-index', zIndex);
    },
    /**
     * 依附实例
     * @param {Dialog} anchor 定位弹窗实例
     */
    attach: function(anchor) {
      var node = anchor.node;
      var className = anchor.className + '-backdrop';

      BACKDROP.node
        .addClass(className)
        .insertBefore(node);

      BACKDROP.shim.insertAfter(node);
    },
    /**
     * 显示遮罩
     * @param {Dialog} anchor 定位弹窗实例
     */
    show: function(anchor) {
      var alloc = BACKDROP.alloc;

      if (alloc.indexOf(anchor) === -1) {
        BACKDROP.attach(anchor);
        alloc.push(anchor);
      }
    },
    /**
     * 隐藏遮罩
     * @param {Dialog} anchor 定位弹窗实例
     */
    hide: function(anchor) {
      var alloc = BACKDROP.alloc;

      BACKDROP.alloc = alloc.filter(function(item) {
        return anchor !== item;
      });

      var length = alloc.length;

      if (length === 0) {
        BACKDROP.node.remove();
        BACKDROP.shim.remove();
      } else {
        anchor = alloc[length - 1];

        BACKDROP.zIndex(anchor.zIndex);
        BACKDROP.attach(anchor);
      }
    }
  };

  /**
   * Layer
   *
   * @constructor
   * @export
   */
  function Layer() {
    var context = this;

    context.destroyed = false;
    context.node = document.createElement('div');
    context.__node = $(context.node)
      .attr('tabindex', '-1')
      .css({
        display: 'none',
        position: 'absolute',
        outline: 0
      });
  }

  // 当前得到焦点的实例
  Layer.active = null;
  // 层级
  Layer.zIndex = ZINDEX;
  // 锁屏遮罩
  Layer.backdrop = BACKDROP.node;

  // 锁定 tab 焦点在弹窗内
  doc.on('focusin', function(e) {
    var active = Layer.active;

    if (active && active.modal) {
      var target = e.target;
      var node = active.node;

      if (target !== node && !node.contains(target)) {
        active.focus();
      }
    }
  });

  // 原型方法
  inherits(Layer, Events, {
    /**
     * 浮层 DOM 元素节点
     * @public
     * @readonly
     */
    node: null,
    /**
     * 判断对话框是否删除
     * @public
     * @readonly
     */
    destroyed: true,
    /**
     * 判断对话框是否显示
     * @public
     * @readonly
     */
    open: false,
    /**
     * 是否自动聚焦
     * @public
     * @property
     */
    autofocus: true,
    /**
     * 是否是模态窗口
     * @public
     * @property
     */
    modal: false,
    /**
     * 内部的 HTML 字符串
     * @public
     * @property
     */
    innerHTML: '',
    /**
     * CSS 类名
     * @public
     * @property
     */
    className: 'ui-layer',
    /**
     * 构造函数
     * @public
     * @readonly
     */
    constructor: Layer,
    /**
     * 让浮层获取焦点
     * @public
     */
    focus: function() {
      var context = this;

      // 销毁，未打开和已经得到焦点不做处理
      if (context.destroyed || !context.open) {
        return context;
      }

      var node = context.node;
      var layer = context.__node;
      var active = Layer.active;

      if (active && active !== context) {
        active.blur(false);
      }

      // 检查焦点是否在浮层里面
      if (!layer.contains(context.__getActive())) {
        var autofocus = layer.find('[autofocus]')[0];

        if (!context.__autofocus && autofocus) {
          context.__autofocus = true;
        } else {
          autofocus = node;
        }

        // 获取焦点
        context.__focus(autofocus);
      }

      // 非激活状态才做处理
      if (active !== context) {
        var index = context.zIndex = Layer.zIndex++;

        // 设置遮罩层级
        Backdrop.zIndex(index);
        // 设置弹窗层级
        layer.css('zIndex', index);
        // 添加激活类名
        layer.addClass(context.className + '-focus');
        // 触发事件
        context.emit('focus');

        // 保存当前激活实例
        Layer.active = context;
      }

      return context;
    },
    /**
     * 让浮层失去焦点。将焦点退还给之前的元素，照顾视力障碍用户
     * @public
     */
    blur: function() {
      var context = this;

      // 销毁和未打开不做处理
      if (context.destroyed || !context.open) {
        return context;
      }

      var isBlur = arguments[0];
      var activeElement = context.__activeElement;

      if (isBlur !== false) {
        context.__focus(activeElement);
      }

      context.__autofocus = false;

      context.__node.removeClass(context.className + '-focus');
      context.emit('blur');

      return context;
    },
    /**
     * 对元素安全聚焦
     * @private
     * @param {HTMLElement} element
     */
    __focus: function(element) {
      // 防止 iframe 跨域无权限报错
      // 防止 IE 不可见元素报错
      try {
        // ie11 bug: iframe 页面点击会跳到顶部
        if (this.autofocus && !/^iframe$/i.test(element.nodeName)) {
          element.focus();
        }
      } catch (e) {
        // error
      }
    },
    /**
     * 获取当前焦点的元素
     * @private
     */
    __getActive: function() {
      try {
        // try: ie8~9, iframe #26
        var activeElement = document.activeElement;
        var contentDocument = activeElement.contentDocument;
        var element = contentDocument && contentDocument.activeElement || activeElement;

        return element;
      } catch (e) {
        // error
      }
    }
  });

  return Layer;

})));
