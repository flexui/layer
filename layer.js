import $ from 'jquery';
import Events from '@flexui/events';
import * as Utils from '@flexui/utils';
import { getZIndex } from '@flexui/z-index';
import { BACKDROP } from './lib/backdrop.js';
import { TAB_LOCK } from './lib/tab-lock.js';

// 导出接口
export * from './lib/backdrop.js';
export * from './lib/tab-lock.js';

/**
 * Layer
 *
 * @constructor
 * @export
 */
export function Layer() {
  var context = this;

  context.destroyed = false;
  context.node = document.createElement('div');
  context.__node = $(context.node)
    // 设定 tab 索引
    .attr('tabindex', '0')
    // 得到焦点
    .on('focusin', function() {
      if (context !== Layer.active) {
        context.focus();
      }
    });
}

// 当前得到焦点的实例
Layer.active = null;

// 锁定 tab 焦点在弹窗内
Utils.doc.on('focusin', function(e) {
  var target = e.target;
  var active = Layer.active;
  var anchor = BACKDROP.anchor;

  // 焦点不在弹窗让焦点失去焦点
  if (active && active !== anchor &&
    target !== active.node && !active.node.contains(target)) {
    active.blur(false);
  }

  // 锁定焦点
  if (anchor && anchor.open &&
    (target === BACKDROP.node[0] || target === TAB_LOCK.node[0])) {
    e.preventDefault();
    anchor.focus();
  }
});

/**
 * 清理激活状态
 *
 * @param {Layer} context
 */
Layer.cleanActive = function(context) {
  if (Layer.active === context) {
    Layer.active = null;
  }
};

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
      active.blur(false);
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
        BACKDROP.show(context);
        // 刷新遮罩层级
        BACKDROP.zIndex(index);
      }

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
   *
   * @public
   */
  blur: function() {
    var context = this;

    // 销毁和未打开不做处理
    if (context.destroyed || !context.open) {
      return context;
    }

    var isBlur = arguments[0];

    // 清理激活状态
    Layer.cleanActive(context);

    if (isBlur !== false) {
      context.__focus(context.__activeElement);
    }

    context.__node.removeClass(context.className + '-focus');
    context.emit('blur');

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
  }
});
