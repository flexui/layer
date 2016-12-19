import $ from 'jquery';
import { BACKDROP } from './backdrop.js';

// 焦点锁定层
export var TAB_LOCK = {
  // 锁定层
  node: $('<div tabindex="0"></div>').css({
    position: 'fixed',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    opacity: 0
  }),
  /**
   * 显示焦点锁定层
   *
   * @param {Layer} anchor
   */
  show: function(anchor) {
    if (BACKDROP.anchor) {
      TAB_LOCK.node.insertAfter(anchor.node);
    }
  },
  /**
   * 隐藏焦点锁定层
   */
  hide: function() {
    if (!BACKDROP.anchor) {
      TAB_LOCK.node.remove();
    }
  }
};
