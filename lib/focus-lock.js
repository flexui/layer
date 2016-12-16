import $ from 'jquery';

// 焦点锁定
export var FOCUS_LOCK = {
  // 要锁定的个数
  count: 0,
  // 锁定层
  node: $('<div tabindex="0"></div>').css({
    width: 0,
    height: 0,
    opacity: 0
  }),
  /**
   * 添加焦点锁定层
   *
   * @param {Layer} anchor
   */
  inc: function(anchor) {
    ++FOCUS_LOCK.count;

    FOCUS_LOCK.node
      .insertAfter(anchor.node);
  },
  /**
   * 少数焦点锁定
   */
  dec: function() {
    FOCUS_LOCK.count = Math.max(0, --FOCUS_LOCK.count);

    if (!FOCUS_LOCK.count) {
      FOCUS_LOCK.node.remove();
    }
  }
};
