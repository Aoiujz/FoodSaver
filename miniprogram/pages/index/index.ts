// index.ts
const { imageAIService } = require('../../utils/baiduAI')
import towxmlUtil from '../../utils/towxml-util';

// 获取应用实例
const app = getApp<IAppOption>()

Component({
  data: {
    tempImagePath: '', // 临时图片路径
    isAnalyzing: false, // 是否正在分析
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
        const result = await imageAIService.analyzeImage(this.data.tempImagePath)

        // 获取Markdown格式的内容
        const markdownContent = result.choices[0].message.content

        // 使用towxml解析Markdown内容
        const parsedContent = towxmlUtil.parseMd(markdownContent, {
          theme: 'light',
          highlight: true
        })

        this.setData({
          analysisResult: parsedContent, // towxml需要使用article作为数据字段名
          isAnalyzing: false
        })

      } catch (error) {
        console.error('分析失败:', error)
        wx.showToast({
          title: '分析失败，请重试',
          icon: 'error'
        })
        this.setData({ isAnalyzing: false })
      }
    },

    // 重新开始
    restart() {
      this.setData({
        tempImagePath: '',
        article: null,
        isAnalyzing: false
      })
    }
  },
})
