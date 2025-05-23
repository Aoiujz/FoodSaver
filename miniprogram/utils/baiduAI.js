
// baiduAI.js
// 百度AI服务配置
const BAIDU_API = {
  // 这里使用百度AI的测试API Key和Secret Key
  // 在实际应用中，应该将这些密钥存储在服务器端
  API_KEY: 'vVqUTWaq0PoZ5Pyz1THQ7Cxx',
  SECRET_KEY: 'YQRGnsJD1AqJ7ngyd0QLCRRyWmgbHC6J',
  // 百度AI图像识别API地址
  TOKEN_URL: 'https://aip.baidubce.com/oauth/2.0/token',
  IMAGE_CLASSIFY_URL: 'https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general'
};

function BaiduAIService() {
  this.accessToken = '';
  this.tokenExpireTime = 0;
}

// 获取access token
BaiduAIService.prototype.getAccessToken = function() {
  return new Promise((resolve, reject) => {
    // 如果token未过期，直接返回
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      resolve(this.accessToken);
      return;
    }

    wx.request({
      url: `${BAIDU_API.TOKEN_URL}?grant_type=client_credentials&client_id=${BAIDU_API.API_KEY}&client_secret=${BAIDU_API.SECRET_KEY}`,
      method: 'POST',
      success: (response) => {
        if (response.data.access_token) {
          this.accessToken = response.data.access_token;
          // token有效期30天，这里设置为29天以确保安全
          this.tokenExpireTime = Date.now() + 29 * 24 * 60 * 60 * 1000;
          resolve(this.accessToken);
        } else {
          reject(new Error('Failed to get access token'));
        }
      },
      fail: (error) => {
        console.error('获取access token失败:', error);
        reject(error);
      }
    });
  });
};

// 将图片转换为Base64
BaiduAIService.prototype.imageToBase64 = function(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const fileContent = wx.getFileSystemManager().readFileSync(filePath);
      const base64 = wx.arrayBufferToBase64(fileContent);
      resolve(base64);
    } catch (error) {
      console.error('图片转Base64失败:', error);
      reject(error);
    }
  });
};

// 分析图片
BaiduAIService.prototype.analyzeImage = function(imagePath) {
  return new Promise(async (resolve, reject) => {
    try {
      // 获取access token
      const token = await this.getAccessToken();
      
      // 将图片转换为Base64
      const imageBase64 = await this.imageToBase64(imagePath);

      // 调用百度AI图像识别API
      wx.request({
        url: `${BAIDU_API.IMAGE_CLASSIFY_URL}?access_token=${token}`,
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
          image: imageBase64
        },
        success: (response) => {
          if (response.data.error_code) {
            reject(new Error(response.data.error_msg || '图像识别失败'));
          } else {
            resolve(this.processRecognitionResult(response.data));
          }
        },
        fail: (error) => {
          console.error('图像分析失败:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('图像分析失败:', error);
      reject(error);
    }
  });
};

// 处理识别结果
BaiduAIService.prototype.processRecognitionResult = function(rawResult) {
  try {
    const result = {
      items: [],
      wasteLevel: '',
      suggestions: ''
    };

    // 处理识别到的物体
    if (rawResult.result && Array.isArray(rawResult.result)) {
      // 过滤出食物相关的结果
      const foodItems = rawResult.result.filter(item => {
        // 这里可以添加更多食物相关的关键词
        const foodKeywords = ['食物', '菜', '饭', '肉', '蔬菜', '水果', '面'];
        return foodKeywords.some(keyword => item.keyword.includes(keyword));
      });

      // 计算每种食物的占比
      const total = foodItems.reduce((sum, item) => sum + item.score, 0);
      result.items = foodItems.map(item => ({
        name: item.keyword,
        percentage: Math.round((item.score / total) * 100)
      }));

      // 根据识别结果评估浪费程度
      const wasteScore = this.calculateWasteScore(foodItems);
      result.wasteLevel = this.getWasteLevel(wasteScore);
      result.suggestions = this.generateSuggestions(result.wasteLevel, result.items);
    }

    return result;
  } catch (error) {
    console.error('处理识别结果失败:', error);
    throw error;
  }
};

// 计算浪费分数
BaiduAIService.prototype.calculateWasteScore = function(foodItems) {
  // 这里可以根据实际需求设计更复杂的评分算法
  const totalScore = foodItems.reduce((sum, item) => sum + item.score, 0);
  return totalScore / foodItems.length;
};

// 获取浪费等级
BaiduAIService.prototype.getWasteLevel = function(score) {
  if (score > 0.8) {
    return '严重浪费';
  } else if (score > 0.5) {
    return '中等浪费';
  } else if (score > 0.3) {
    return '轻微浪费';
  } else {
    return '浪费程度较低';
  }
};

// 生成建议
BaiduAIService.prototype.generateSuggestions = function(wasteLevel, items) {
  let suggestions = '';

  switch (wasteLevel) {
    case '严重浪费':
      suggestions = '建议：\n1. 点餐时要根据实际需求，避免过量点餐\n2. 剩余食物可以打包带回家\n3. 建议将食物分小份储存，按需取用';
      break;
    case '中等浪费':
      suggestions = '建议：\n1. 可以将剩余食物放入冰箱保存\n2. 下次点餐时适当减少份量\n3. 建议与他人分享食物';
      break;
    case '轻微浪费':
      suggestions = '建议：\n1. 继续保持适量点餐的好习惯\n2. 可以将剩余食物打包带走\n3. 建议记录日常用餐量，帮助估算所需份量';
      break;
    default:
      suggestions = '做得很好！继续保持节约的好习惯。';
  }

  // 根据识别到的食物类型添加特定建议
  if (items.some(item => item.name.includes('米饭'))) {
    suggestions += '\n\n关于米饭：可以用剩余的米饭制作炒饭，营养美味。';
  }
  if (items.some(item => item.name.includes('蔬菜'))) {
    suggestions += '\n\n关于蔬菜：建议将剩余的蔬菜制作成沙拉或煲汤。';
  }
  if (items.some(item => item.name.includes('肉'))) {
    suggestions += '\n\n关于肉类：剩余的肉类可以切片冷藏，第二天可以用来做三明治。';
  }

  return suggestions;
};

const baiduAIService = new BaiduAIService();
module.exports = {
  baiduAIService: baiduAIService
};