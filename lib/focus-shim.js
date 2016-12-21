import $ from 'jquery';
import { BACKDROP } from './backdrop.js';

// 焦点锁定层
export var FOCUS_SHIM = {
  // 锁定层
  node: $('<div tabindex="0"></div>').css({
    top: 0,
    left: 0,
    zIndex: -1,
    position: 'fixed',
    visibility: 'hidden'
  }),
  /**
   * 显示焦点锁定层
   *
   * @param {Layer} anchor
   */
  show: function(anchor) {
    if (BACKDROP.anchor) {
      FOCUS_SHIM.node.insertAfter(anchor.node);
    }
  },
  /**
   * 隐藏焦点锁定层
   */
  hide: function() {
    if (!BACKDROP.anchor) {
      FOCUS_SHIM.node.remove();
    }
  }
};
