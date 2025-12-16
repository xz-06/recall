// 本地开发环境 - 获取单个回忆详情
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const filename = req.query.file;
    
    if (!filename) {
      return res.status(400).json({ error: '缺少文件名参数' });
    }

    const filepath = path.join(__dirname, '../../docs/memories', filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: '回忆不存在' });
    }

    const content = fs.readFileSync(filepath, 'utf8');
    
    // 解析Markdown内容
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const dateMatch = content.match(/\*\*日期\*\*:\s+(.+)$/m);
    const authorMatch = content.match(/\*\*记录人\*\*:\s+(.+)$/m);
    
    // 提取正文内容（去掉元数据）
    let bodyContent = content;
    if (titleMatch) {
      bodyContent = bodyContent.replace(/^#\s+.+$/m, '');
    }
    bodyContent = bodyContent.replace(/\*\*日期\*\*:\s+.+$/m, '');
    if (authorMatch) {
      bodyContent = bodyContent.replace(/\*\*记录人\*\*:\s+.+$/m, '');
    }
    bodyContent = bodyContent.replace(/^---$/m, '').trim();
    
    res.json({
      filename: filename,
      title: titleMatch ? titleMatch[1] : filename.replace('.md', ''),
      date: dateMatch ? dateMatch[1] : '',
      author: authorMatch ? authorMatch[1] : '',
      content: bodyContent
    });
  } catch (error) {
    console.error('获取回忆详情失败:', error);
    res.status(500).json({ error: '获取失败', details: error.message });
  }
});

module.exports = router;

