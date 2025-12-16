// Vercel Function - 服务上传页面
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 读取upload.html文件
    const uploadHtmlPath = path.join(process.cwd(), 'upload.html');
    const uploadHtml = fs.readFileSync(uploadHtmlPath, 'utf8');
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(uploadHtml);
  } catch (error) {
    console.error('读取上传页面失败:', error);
    return res.status(500).send(`
      <html>
        <head><title>错误</title></head>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1>上传页面加载失败</h1>
          <p>错误: ${error.message}</p>
        </body>
      </html>
    `);
  }
};

