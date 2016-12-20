import $ from 'jquery';

export var BACKDROP = {
  // 遮罩分配
  alloc: [],
  // 当前依附实例
  anchor: null,
  // 遮罩节点
  node: $('<div tabindex="0"></div>').css({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  }),
  /**
   * 设置浮层层级
   */
  zIndex: function(zIndex) {
    // 最小为 0
    zIndex = Math.max(0, --zIndex);

    // 设定 z-index
    BACKDROP.node.css('z-index', zIndex);
  },
  /**
   * 依附实例
   *
   * @param {Layer} anchor 定位浮层实例
   */
  attach: function(anchor) {
    var node = anchor.node;
    var className = anchor.className + '-backdrop';

    BACKDROP.node
      .attr('class', className)
      .insertBefore(node);

    // 当前依附实例
    BACKDROP.anchor = anchor;
  },
  /**
   * 显示遮罩
   *
   * @param {Layer} anchor 定位浮层实例
   */
  show: function(anchor) {
    var alloc = BACKDROP.alloc;
    var index = alloc.indexOf(anchor);

    // 跟随元素
    BACKDROP.attach(anchor);

    // 不存在或者不在队尾重新刷新遮罩位置和缓存队列
    if (index === -1 || index !== alloc.length - 1) {
      // 放置缓存到队尾
      alloc.push(anchor);
    }
  },
  /**
   * 隐藏遮罩
   *
   * @param {Layer} anchor 定位浮层实例
   */
  hide: function(anchor) {
    BACKDROP.alloc = BACKDROP.alloc.filter(function(item) {
      return anchor !== item;
    });

    var length = BACKDROP.alloc.length;

    if (!length) {
      BACKDROP.node.remove();

      // 清空当前依附实例
      BACKDROP.anchor = null;
    } else {
      anchor = BACKDROP.alloc[length - 1];

      BACKDROP.zIndex(anchor.zIndex);
      BACKDROP.attach(anchor);
    }
  }
};
