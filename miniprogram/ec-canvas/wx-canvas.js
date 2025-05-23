function WxCanvas(ctx, canvasId, isNew, canvasNode) {
  this.ctx = ctx;
  this.canvasId = canvasId;
  this.chart = null;
  this.isNew = isNew;
  if (isNew) {
    this.canvasNode = canvasNode;
  } else {
    this._initStyle(ctx);
  }

  this._initEvent();
}

WxCanvas.prototype.getContext = function(contextType) {
  if (contextType === '2d') {
    return this.ctx;
  }
};

WxCanvas.prototype.setChart = function(chart) {
  this.chart = chart;
};

WxCanvas.prototype.attachEvent = function() {
  // noop
};

WxCanvas.prototype.detachEvent = function() {
  // noop
};

WxCanvas.prototype._initCanvas = function(zrender, ctx) {
  zrender.util.getContext = function() {
    return ctx;
  };

  zrender.util.$override('measureText', function(text, font) {
    ctx.font = font || '12px sans-serif';
    return ctx.measureText(text);
  });
};

WxCanvas.prototype._initStyle = function(ctx) {
  var styles = ['fillStyle', 'strokeStyle', 'globalAlpha',
    'textAlign', 'textBaseAlign', 'shadow', 'lineWidth',
    'lineCap', 'lineJoin', 'lineDash', 'miterLimit', 'fontSize'];

  styles.forEach(function(style) {
    Object.defineProperty(ctx, style, {
      set: function(value) {
        if (style !== 'fillStyle' && style !== 'strokeStyle' ||
          value !== 'none' && value !== null) {
          ctx['set' + style.charAt(0).toUpperCase() + style.slice(1)](value);
        }
      }
    });
  });

  ctx.createRadialGradient = function() {
    return ctx.createCircularGradient(arguments);
  };
};

WxCanvas.prototype._initEvent = function() {
  this.event = {};
  var eventNames = [{
    wxName: 'touchStart',
    ecName: 'mousedown'
  }, {
    wxName: 'touchMove',
    ecName: 'mousemove'
  }, {
    wxName: 'touchEnd',
    ecName: 'mouseup'
  }, {
    wxName: 'touchEnd',
    ecName: 'click'
  }];

  var self = this;
  eventNames.forEach(function(name) {
    self.event[name.wxName] = function(e) {
      var touch = e.touches[0];
      self.chart.getZr().handler.dispatch(name.ecName, {
        zrX: name.wxName === 'tap' ? touch.clientX : touch.x,
        zrY: name.wxName === 'tap' ? touch.clientY : touch.y
      });
    };
  });
};

Object.defineProperties(WxCanvas.prototype, {
  width: {
    set: function(w) {
      if (this.canvasNode) this.canvasNode.width = w;
    },
    get: function() {
      if (this.canvasNode)
        return this.canvasNode.width;
      return 0;
    }
  },
  height: {
    set: function(h) {
      if (this.canvasNode) this.canvasNode.height = h;
    },
    get: function() {
      if (this.canvasNode)
        return this.canvasNode.height;
      return 0;
    }
  }
});

module.exports = WxCanvas;