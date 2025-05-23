// imageAI.js
// 阿里云DashScope服务配置
const API_CONFIG = {
    // 阿里云DashScope API配置
    // 在实际应用中，应该将API Key存储在服务器端
    API_KEY: 'DashScope API Key', // 请替换为你的实际API Key
    // DashScope API地址
    API_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
};

function ImageAIService() {
    // 不需要token管理，直接使用API Key
}

// 将图片转换为Base64
ImageAIService.prototype.imageToBase64 = function (filePath) {
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
ImageAIService.prototype.analyzeImage = function (imagePath) {
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
                            {
                                type: "text", text: `
你是一位专家级的图像分析助手，擅长识别食物图片并评估食物浪费。用户上传的是厨余垃圾照片。请你：

1. **判断图片中有哪些食物残余或垃圾，并列出**；
2. **分析这些是否属于可避免的食物浪费**（例如：未吃完的饭菜、整块仍可食用的食物）；
3. **给出食物浪费的简要分析报告**，包括：
    - 浪费的类型
    - 可能的原因
    - 减少浪费的建议
4. **使用简洁、清晰、人性化的语言**，适合普通用户阅读。

⚠️ 如果图片不清晰或无法判断，请说明原因。如果用户上传的图片不符合要求，请礼貌地告知用户，并建议他们重新上传清晰的图片。
请注意，用户可能会上传多种类型的图片，包括非食物图片，因此请确保你的分析是基于食物图片的。
              `}
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
