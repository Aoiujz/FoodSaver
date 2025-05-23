// index.ts
const { baiduAIService } = require('../../utils/baiduAI')
const echarts = require('../../ec-canvas/echarts')

// 获取应用实例
const app = getApp<IAppOption>()

Component({
  data: {
    tempImagePath: '', // 临时图片路径
    isAnalyzing: false, // 是否正在分析
    analysisResult: null, // 分析结果
    chartWidth: 300, // 默认图表宽度
    ec: {
      lazyLoad: true // 延迟加载
    }
  },

  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      wx.getSystemInfo({
        success: (res) => {
          const windowWidth = res.windowWidth
          this.setData({
            chartWidth: windowWidth - 60 // 考虑padding的宽度
          })
        }
      })
    }
  },

  methods: {
    // 拍照功能
    async takePhoto() {
      try {
        const res = await wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: ['camera'],
          sizeType: ['compressed']
        })
        
        this.setData({
          tempImagePath: res.tempFiles[0].tempFilePath
        })
      } catch (error) {
        wx.showToast({
          title: '拍照失败',
          icon: 'error'
        })
      }
    },

    // 从相册选择
    async chooseFromAlbum() {
      try {
        const res = await wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: ['album'],
          sizeType: ['compressed']
        })
        
        this.setData({
          tempImagePath: res.tempFiles[0].tempFilePath
        })
      } catch (error) {
        wx.showToast({
          title: '选择图片失败',
          icon: 'error'
        })
      }
    },

    // 重新选择图片
    reselect() {
      this.setData({
        tempImagePath: '',
        analysisResult: null
      })
    },

    // 分析图片
    async analyzeImage() {
      if (!this.data.tempImagePath) {
        wx.showToast({
          title: '请先选择图片',
          icon: 'none'
        })
        return
      }

      this.setData({ isAnalyzing: true })

      try {
        // 调用百度AI服务分析图片
        const result = await baiduAIService.analyzeImage(this.data.tempImagePath)
        
        // 处理分析结果
        const processedResult = this.processAnalysisResult(result)
        
        this.setData({
          analysisResult: processedResult,
          isAnalyzing: false
        })

        // 初始化图表
        setTimeout(() => {
          this.initChart(processedResult.items);
        }, 100);
      } catch (error) {
        console.error('分析失败:', error)
        wx.showToast({
          title: '分析失败，请重试',
          icon: 'error'
        })
        this.setData({ isAnalyzing: false })
      }
    },

    // 处理分析结果
    processAnalysisResult(rawResult: any) {
      if (!rawResult || !rawResult.items) {
        wx.showToast({
          title: '数据分析失败',
          icon: 'none'
        });
        return {
          items: [],
          wasteLevel: '未知',
          suggestions: '无法分析数据，请重试'
        };
      }

      // 计算总百分比用于归一化
      const total = rawResult.items.reduce((sum, item) => sum + item.score, 0);
      
      // 转换数据格式
      const items = rawResult.items.map(item => ({
        name: item.keyword,
        percentage: Math.round((item.score / total) * 100)
      }));

      // 根据浪费程度生成建议
      const wasteScore = items.reduce((sum, item) => sum + item.percentage, 0) / items.length;
      let wasteLevel, suggestions;
      
      if (wasteScore > 70) {
        wasteLevel = '严重浪费';
        suggestions = '建议：\n1. 减少食物份量\n2. 合理规划用餐量\n3. 剩余食物可考虑捐赠';
      } else if (wasteScore > 40) {
        wasteLevel = '中等浪费';
        suggestions = '建议：\n1. 适量减少点餐\n2. 剩余食物可打包保存';
      } else {
        wasteLevel = '轻微浪费';
        suggestions = '建议继续保持良好的饮食习惯';
      }

      return { items, wasteLevel, suggestions };
    },

    // 初始化图表
    initChart(items: Array<{ name: string, percentage: number }>) {
      const ecComponent = this.selectComponent('#mychart-dom-pie');
      if (ecComponent) {
        ecComponent.init((canvas, width, height, dpr) => {
          const chart = echarts.init(canvas, null, {
            width: width,
            height: height,
            devicePixelRatio: dpr
          });

          const option = {
            backgroundColor: '#ffffff',
            series: [{
              label: {
                show: true,
                position: 'outer',
                formatter: '{b}: {d}%'
              },
              type: 'pie',
              center: ['50%', '50%'],
              radius: ['30%', '60%'],
              data: items.map(item => ({
                name: item.name,
                value: item.percentage,
                itemStyle: {
                  color: this.getChartColor(item.name)
                }
              }))
            }]
          };

          chart.setOption(option);
          return chart;
        });
      }
    },

    // 获取图表颜色
    getChartColor(name: string): string {
      const colorMap = {
        '米饭': '#1aad19',
        '蔬菜': '#2f86f6',
        '肉类': '#ff943e',
        '面食': '#ff3e3e',
        '水果': '#8a3eff'
      };
      return colorMap[name] || '#5470c6';
    },

    // 重新开始
    restart() {
      this.setData({
        tempImagePath: '',
        analysisResult: null,
        isAnalyzing: false
      })
    }
  },
})