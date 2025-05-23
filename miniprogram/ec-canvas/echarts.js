
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// 这是一个简化版的echarts.js文件，仅包含饼图所需的基本功能
// 实际项目中应该使用完整的echarts.min.js文件

function init(canvas, width, height, dpr) {
  // 创建一个简单的图表对象
  const chart = {
    canvas: canvas,
    width: width,
    height: height,
    dpr: dpr,
    options: null,
    
    // 设置图表配置
    setOption: function(options) {
      this.options = options;
      this._render();
    },
    
    // 渲染图表
    _render: function() {
      if (!this.options || !this.options.series || !this.options.series.length) {
        return;
      }
      
      const ctx = this.canvas.ctx;
      const series = this.options.series[0];
      
      if (series.type !== 'pie') {
        console.error('只支持饼图类型');
        return;
      }
      
      const data = series.data;
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      const radius = Math.min(this.width, this.height) / 2 * 0.8;
      
      let startAngle = 0;
      
      // 清空画布
      ctx.clearRect(0, 0, this.width, this.height);
      
      // 绘制饼图
      data.forEach((item, index) => {
        const value = item.value;
        const name = item.name;
        const percentage = value / data.reduce((sum, d) => sum + d.value, 0);
        const endAngle = startAngle + percentage * Math.PI * 2;
        
        // 设置颜色
        const colors = ['#1aad19', '#2f86f6', '#ff943e', '#ff3e3e', '#8a3eff', '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];
        const color = item.itemStyle && item.itemStyle.color ? item.itemStyle.color : colors[index % colors.length];
        
        // 绘制扇形
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        
        // 绘制标签
        if (series.label && series.label.show !== false) {
          const midAngle = (startAngle + endAngle) / 2;
          const labelRadius = radius * 0.7;
          const x = centerX + Math.cos(midAngle) * labelRadius;
          const y = centerY + Math.sin(midAngle) * labelRadius;
          
          ctx.fillStyle = '#fff';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${name}: ${(percentage * 100).toFixed(0)}%`, x, y);
        }
        
        startAngle = endAngle;
      });
    },
    
    // 获取ZRender实例（简化版）
    getZr: function() {
      return {
        handler: {
          dispatch: function() {},
          processGesture: function() {}
        }
      };
    },
    
    // 重新调整大小
    resize: function() {
      this._render();
    }
  };
  
  return chart;
}

// 注册预处理器
function registerPreprocessor(processor) {
  // 简化版不实现
}

// 设置Canvas创建器
function setCanvasCreator(creator) {
  // 简化版不实现
}

module.exports = {
  init: init,
  registerPreprocessor: registerPreprocessor,
  setCanvasCreator: setCanvasCreator
};