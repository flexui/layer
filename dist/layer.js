(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery')) :
  typeof define === 'function' && define.amd ? define('layer', ['jquery'], factory) :
  (factory(global.jQuery));
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

  // 导出类型判定接口
  /**
   * 属性拷贝
   *
   * @export
   * @param {Object} target 目标对象
   * @param {Object} seed 继承对象
   * @param {Array} whiteList 白名单
   */
  function mix(target, seed, whiteList) {
    if (!Array.isArray(whiteList)) {
      whiteList = false;
    }

    // Copy "all" properties including inherited ones.
    for (var prop in seed) {
      if (seed.hasOwnProperty(prop)) {
        // 检测白名单
        if (whiteList && whiteList.indexOf(prop) === -1) continue;

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

  function Layer() {

  }

  Layer.ZINDEX = ZINDEX;
  Layer.BACKDROP = BACKDROP;

  inherits(Layer, Events, {

  });

})));
