/**
 * 简易Markdown解析器
 * 将Markdown文本转换为小程序可以使用的对象数组
 */
function parseMarkdown(markdown) {
  if (!markdown) {
    return [];
  }

  // 按行分割
  const lines = markdown.split('\n');
  const result = [];
  let currentList = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 忽略空行
    if (!line) {
      continue;
    }

    // 处理标题
    if (line.startsWith('# ')) {
      result.push({
        type: 'heading1',
        content: line.substring(2)
      });
    } else if (line.startsWith('## ')) {
      result.push({
        type: 'heading2',
        content: line.substring(3)
      });
    } else if (line.startsWith('### ')) {
      result.push({
        type: 'heading3',
        content: line.substring(4)
      });
    }
    // 处理无序列表
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!currentList) {
        currentList = {
          type: 'unordered-list',
          items: []
        };
        result.push(currentList);
      }
      currentList.items.push(line.substring(2));
    }
    // 处理有序列表
    else if (/^\d+\.\s/.test(line)) {
      if (!currentList || currentList.type !== 'ordered-list') {
        currentList = {
          type: 'ordered-list',
          items: []
        };
        result.push(currentList);
      }
      currentList.items.push(line.substring(line.indexOf('.') + 2));
    }
    // 处理粗体和斜体
    else {
      // 处理段落，包括内联样式如粗体、斜体
      const processedText = processBoldAndItalic(line);

      if (line.startsWith('> ')) {
        // 引用块
        result.push({
          type: 'blockquote',
          content: processedText.substring(2)
        });
      } else {
        // 普通段落
        result.push({
          type: 'paragraph',
          content: processedText
        });
      }

      // 重置列表，因为段落打断了列表
      currentList = null;
    }
  }

  return result;
}

/**
 * 处理文本中的粗体和斜体标记
 * 微信小程序不支持富文本渲染，所以我们只能移除这些标记
 * 如果将来需要富文本支持，可以考虑使用wxParse等第三方库
 */
function processBoldAndItalic(text) {
  // 处理代码块
  text = text.replace(/`([^`]+)`/g, '$1');

  // 处理链接 [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');

  // 处理图片 ![alt](url) -> [图片]
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '[图片]');

  // 处理粗体
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/__(.*?)__/g, '$1');

  // 处理斜体
  text = text.replace(/\*(.*?)\*/g, '$1');
  text = text.replace(/_(.*?)_/g, '$1');

  // 处理删除线
  text = text.replace(/~~(.*?)~~/g, '$1');

  return text;
}

module.exports = {
  parseMarkdown
};
