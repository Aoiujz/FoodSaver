// imageAI.js
// 阿里云DashScope服务配置
const API_CONFIG = {
  // 阿里云DashScope API配置
  // 在实际应用中，应该将API Key存储在服务器端
  API_KEY: 'sk-b1f1caee12d4467d964c15a473b94b64', // 请替换为你的实际API Key
  // DashScope API地址
  API_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
};

function ImageAIService() {
  // 不需要token管理，直接使用API Key
}

// 将图片转换为Base64
ImageAIService.prototype.imageToBase64 = function(filePath) {
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
ImageAIService.prototype.analyzeImage = function(imagePath) {
  return new Promise(async (resolve, reject) => {
    try {
      // 将图片转换为Base64
      const imageBase64 = await this.imageToBase64(imagePath);

      // 构建请求数据
      const requestData = {
        model: "qwen-vl-max",
        messages: [
          {
            role: "system",
            content: [
              {type: "text", text: "You are a helpful assistant."}
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              },
              {
                type: "text",
                text: "分析这张食物图片，识别出有哪些食物，以及这些食物的大致比例。另外，评估一下是否存在食物浪费的情况，如果有，请给出改进建议。"
              }
            ]
          }
        ]
      };

      // 调用阿里云DashScope API
      wx.request({
        url: API_CONFIG.API_URL,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.API_KEY}`
        },
        data: requestData,
        success: (response) => {
          if (response.statusCode === 200 && response.data) {
            resolve(response.data);
          } else {
            reject(new Error(response.data?.error?.message || '图像识别失败'));
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

const imageAIService = new ImageAIService();
module.exports = {
  imageAIService: imageAIService
};
