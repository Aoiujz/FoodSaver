/**
 * towxml工具类，用于处理Markdown内容
 */
import towxml from '../towxml/index';

/**
 * 将Markdown文本转换为towxml所需格式
 * @param {string} markdown - Markdown格式文本
 * @param {object} options - 配置选项
 * @returns {object} - towxml数据
 */
function parseMd(markdown, options = {}) {
  const defaultOptions = {
    theme: 'light',    // 主题，可选：'light'、'dark'
    highlight: true,   // 是否代码高亮
    linenumber: true,  // 代码块是否显示行号
    parse: {},         // 解析选项
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    // 调用towxml库解析Markdown
    return towxml(markdown, 'markdown', finalOptions);
  } catch (error) {
    console.error('解析Markdown失败:', error);
    return towxml('解析内容失败，请重试', 'markdown', finalOptions);
  }
}

export default {
  parseMd
};
