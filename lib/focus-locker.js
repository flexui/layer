import $ from 'jquery';

export var FOCUS_LOCKER = {
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
    ++count;

    FOCUS_LOCKER.node
      .insertAfter(anchor.node);
  },
  /**
   * 少数焦点锁定
   */
  dec: function() {
    count = Math.max(0, --count);

    if (!count) {
      FOCUS_LOCKER.node.remove();
    }
  }
};
