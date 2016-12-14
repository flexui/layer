import $ from 'jquery';

export var BACKDROP = {
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
    var index = alloc.indexOf(anchor);

    // 不存在或者不在队尾重新刷新遮罩位置和缓存队列
    if (index === -1 || index !== alloc.length - 1) {
      // 跟随元素
      BACKDROP.attach(anchor);
      // 放置缓存到队尾
      alloc.push(anchor);
    }
  },
  /**
   * 隐藏遮罩
   * @param {Dialog} anchor 定位弹窗实例
   */
  hide: function(anchor) {
    BACKDROP.alloc = BACKDROP.alloc.filter(function(item) {
      return anchor !== item;
    });

    var length = BACKDROP.alloc.length;

    if (length === 0) {
      BACKDROP.node.remove();
      BACKDROP.shim.remove();
    } else {
      anchor = BACKDROP.alloc[length - 1];

      BACKDROP.zIndex(anchor.zIndex);
      BACKDROP.attach(anchor);
    }
  }
};
