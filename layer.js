import $ from 'jquery';
import Events from '@flexui/events';
import * as Utils from '@flexui/utils';
import { getZIndex } from '@flexui/z-index';
import { BACKDROP } from './lib/backdrop.js';
import { FOCUS_SHIM } from './lib/focus-shim.js';

// 得到焦点类名
var LAYER_CLASS_FOCUS = '-focus';

/**
 * Layer
 *
 * @constructor
 * @export
 */
export default function Layer() {
  var context = this;

  context.destroyed = false;
  context.node = document.createElement('div');
  context.__node = $(context.node)
    // 设定 tab 索引
    .attr('tabindex', '-1')
    // 得到焦点
    .on('focusin', function() {
      if (context !== Layer.active) {
        context.focus();
      }
    });
}

// 当前得到焦点的实例
Layer.active = null;

// 锁定 tab 焦点在浮层内
Utils.doc.on('focusin', function(e) {
  var target = e.target;
  var active = Layer.active;
  var anchor = BACKDROP.anchor;

  if (anchor) {
    // 锁定焦点
    switch (target) {
      case BACKDROP.node[0]:
        if (active) {
          active.focus();
        } else {
          anchor.focus();
        }
        break;
      case FOCUS_SHIM.node[0]:
        anchor.focus();
        break;
    }
  } else if (active &&
    target !== active.node &&
    !active.node.contains(target)) {
    // 焦点不在浮层让浮层失焦
    active.blur();
  }
});

// 原型方法
Utils.inherits(Layer, Events, {
  /**
   * 浮层 DOM 元素节点
   *
   * @public
   * @readonly
   */
  node: null,
  /**
   * 判断对话框是否删除
   *
   * @public
   * @readonly
   */
  destroyed: true,
  /**
   * 判断对话框是否显示
   *
   * @public
   * @readonly
   */
  open: false,
  /**
   * 是否是模态窗口
   *
   * @public
   * @readonly
   */
  modal: false,
  /**
   * 内部的 HTML 字符串
   *
   * @public
   * @property
   */
  innerHTML: '',
  /**
   * CSS 类名
   * 只在浮层未初始化前可设置，之后不能更改
   *
   * @public
   * @property
   */
  className: 'ui-layer',
  /**
   * 构造函数
   *
   * @public
   * @readonly
   */
  constructor: Layer,
  /**
   * 让浮层获取焦点
   *
   * @public
   */
  focus: function() {
    var context = this;

    // 销毁，未打开和已经得到焦点不做处理
    if (context.destroyed || !context.open) {
      return context;
    }

    // 激活实例
    var active = Layer.active;

    // 先让上一个激活实例失去焦点
    if (active && active !== context) {
      active.blur();
    }

    // 浮层
    var node = context.node;
    var layer = context.__node;
    var focused = context.__getActive();

    // 检查焦点是否在浮层里面
    if (node !== focused && !node.contains(focused)) {
      // 自动聚焦
      context.__focus(layer.find('[autofocus]')[0] || node);
    }

    // 非激活状态刷新浮层状态
    if (Layer.active !== context) {
      var index = context.zIndex = getZIndex(true);

      // 刷新遮罩
      if (context.modal && context !== BACKDROP.anchor) {
        // 刷新遮罩位置
        context.__backdrop('show');
        // 刷新遮罩层级
        context.__backdrop('z-index', index);
      }

      // 设置浮层层级
      layer.css('zIndex', index);
      // 添加激活类名
      layer.addClass(context.className + LAYER_CLASS_FOCUS);
      // 触发事件
      context.emit('focus');

      // 保存当前激活实例
      Layer.active = context;
    }

    return context;
  },
  /**
   * 让浮层失去焦点。将焦点退还给之前的元素，照顾视力障碍用户
   *
   * @public
   */
  blur: function() {
    var context = this;

    // 销毁和未打开不做处理
    if (context.destroyed || !context.open) {
      return context;
    }

    if (context === Layer.active) {
      // 清理激活状态
      Layer.active = null;

      // 移除类名
      context.__node.removeClass(context.className + LAYER_CLASS_FOCUS);
      // 触发失去焦点事件
      context.emit('blur');
    }

    return context;
  },
  /**
   * 对元素安全聚焦
   *
   * @private
   * @param {HTMLElement} element
   */
  __focus: function(element) {
    // 防止 iframe 跨域无权限报错
    // 防止 IE 不可见元素报错
    try {
      // ie11 bug: iframe 页面点击会跳到顶部
      if (!/^iframe$/i.test(element.nodeName)) {
        element.focus();
      }
    } catch (e) {
      // error
    }
  },
  /**
   * 获取当前焦点的元素
   *
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
  },
  /**
   * 智能遮罩操作方法
   *
   * @private
   * @param {String} method
   * @param {any} value
   */
  __backdrop: function(method, value) {
    var context = this;

    switch (method) {
      case 'show':
      case 'hide':
        // 遮罩层
        if (context.modal) {
          BACKDROP[method](context);
        }

        // 焦点锁定层
        FOCUS_SHIM[method](context);
        break;
      case 'z-index':
        if (context.modal) {
          BACKDROP.zIndex(value);
        }
        break;
    }
  }
});
