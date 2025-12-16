const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB限制
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只支持图片格式：jpeg, jpg, png, gif, webp'));
    }
  }
});

// 上传回忆（文本 + 图片）
router.post('/memory', upload.array('images', 10), async (req, res) => {
  try {
    const { title, content, date, author } = req.body;
    
    if (!title || !date) {
      return res.status(400).json({ error: '标题和日期是必填项' });
    }

    // 生成文件名（使用日期和标题）
    const safeTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').substring(0, 50);
    const dateStr = date.replace(/-/g, '');
    const filename = `${dateStr}-${safeTitle}.md`;
    const filepath = path.join(__dirname, '../../docs/memories', filename);

    // 处理上传的图片
    const imageRefs = [];
    if (req.files && req.files.length > 0) {
      const imagesDir = path.join(__dirname, '../../docs/images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      for (const file of req.files) {
        const imageFilename = `${Date.now()}-${file.originalname}`;
        const imageDest = path.join(imagesDir, imageFilename);
        fs.renameSync(file.path, imageDest);
        imageRefs.push(`images/${imageFilename}`);
      }
    }

    // 生成Markdown内容
    let markdown = `# ${title}\n\n`;
    markdown += `**日期**: ${date}\n\n`;
    if (author) {
      markdown += `**记录人**: ${author}\n\n`;
    }
    markdown += `---\n\n`;
    
    if (content) {
      markdown += `${content}\n\n`;
    }

    if (imageRefs.length > 0) {
      markdown += `## 📸 照片\n\n`;
      imageRefs.forEach(img => {
        markdown += `![图片](${img})\n\n`;
      });
    }

    markdown += `\n---\n\n`;
    markdown += `*创建时间: ${new Date().toLocaleString('zh-CN')}*\n`;

    // 写入Markdown文件
    fs.writeFileSync(filepath, markdown, 'utf8');

    // 更新导航文件
    updateNavigation();

    // 重新构建MkDocs（异步执行，不阻塞响应）
    rebuildMkDocs();

    res.json({ 
      success: true, 
      message: '回忆已添加',
      filename: filename,
      path: `/memories/${filename}`
    });
  } catch (error) {
    console.error('上传失败:', error);
    res.status(500).json({ error: '上传失败', details: error.message });
  }
});

// 更新导航文件
function updateNavigation() {
  try {
    const memoriesDir = path.join(__dirname, '../../docs/memories');
    const files = fs.readdirSync(memoriesDir)
      .filter(file => file.endsWith('.md') && file !== 'index.md' && file !== 'by-date.md')
      .sort()
      .reverse()
      .slice(0, 10); // 只显示最新10条

    // 更新by-date.md
    let byDateContent = `# 按时间排序的回忆\n\n`;
    byDateContent += `这里按时间顺序展示我们的所有回忆，最新的在最前面。\n\n---\n\n`;
    
    files.forEach(file => {
      const filepath = path.join(memoriesDir, file);
      const content = fs.readFileSync(filepath, 'utf8');
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const dateMatch = content.match(/\*\*日期\*\*:\s+(.+)$/m);
      
      if (titleMatch && dateMatch) {
        byDateContent += `## ${dateMatch[1]} - ${titleMatch[1]}\n\n`;
        byDateContent += `[查看详情 →](${file})\n\n---\n\n`;
      }
    });

    fs.writeFileSync(path.join(memoriesDir, 'by-date.md'), byDateContent, 'utf8');
  } catch (error) {
    console.error('更新导航失败:', error);
  }
}

// 重新构建MkDocs
function rebuildMkDocs() {
  const mkdocsPath = path.join(__dirname, '../..');
  exec('mkdocs build', { cwd: mkdocsPath }, (error, stdout, stderr) => {
    if (error) {
      console.error('MkDocs构建失败:', error);
      return;
    }
    console.log('✅ MkDocs构建成功');
  });
}

// 获取所有回忆列表
router.get('/memories', (req, res) => {
  try {
    const memoriesDir = path.join(__dirname, '../../docs/memories');
    if (!fs.existsSync(memoriesDir)) {
      return res.json([]);
    }

    const files = fs.readdirSync(memoriesDir)
      .filter(file => file.endsWith('.md') && file !== 'index.md' && file !== 'by-date.md')
      .map(file => {
        const filepath = path.join(memoriesDir, file);
        const content = fs.readFileSync(filepath, 'utf8');
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const dateMatch = content.match(/\*\*日期\*\*:\s+(.+)$/m);
        
        return {
          filename: file,
          title: titleMatch ? titleMatch[1] : file.replace('.md', ''),
          date: dateMatch ? dateMatch[1] : '',
          excerpt: content.substring(0, 100) + '...'
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));

    res.json(files);
  } catch (error) {
    console.error('获取回忆列表失败:', error);
    res.status(500).json({ error: '获取失败', details: error.message });
  }
});

module.exports = router;

