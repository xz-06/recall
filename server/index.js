const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const uploadRoutes = require('./routes/upload');
const memoryRoutes = require('./routes/memory');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务 - 提供图片访问
app.use('/images', express.static(path.join(__dirname, '../docs/images')));

// API 路由
app.use('/api/upload', uploadRoutes);
app.use('/api/memory', memoryRoutes);

// 服务上传页面
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, '../upload.html'));
});

// 服务MkDocs构建的静态文件（优先）
app.use(express.static(path.join(__dirname, '../site')));

// SPA路由支持：所有非API路由返回MkDocs的index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/images') || req.path === '/upload') {
    return next();
  }
  const indexPath = path.join(__dirname, '../site/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
      <html>
        <head><title>站点未构建</title></head>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1>站点未构建</h1>
          <p>请先运行: <code>npm run mkdocs:build</code></p>
          <p>或者运行: <code>npm run dev</code> 启动开发服务器</p>
        </body>
      </html>
    `);
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 上传页面: http://localhost:${PORT}/upload`);
  console.log(`📚 MkDocs站点: http://localhost:8000`);
});

