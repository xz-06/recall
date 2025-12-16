// Vercel Function - 服务上传页面
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // 设置CORS和缓存头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 记录请求信息（用于调试）
  console.log('Upload page request:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    cwd: process.cwd(),
    dirname: __dirname
  });

  try {
    // 尝试多个可能的路径
    const possiblePaths = [
      path.join(process.cwd(), 'upload.html'),
      path.join(process.cwd(), '..', 'upload.html'),
      path.join(__dirname, '..', 'upload.html'),
      path.join(__dirname, '../upload.html')
    ];
    
    let uploadHtml = null;
    let lastError = null;
    
    for (const uploadHtmlPath of possiblePaths) {
      try {
        if (fs.existsSync(uploadHtmlPath)) {
          uploadHtml = fs.readFileSync(uploadHtmlPath, 'utf8');
          break;
        }
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    
    if (!uploadHtml) {
      throw new Error(`无法找到upload.html文件。尝试的路径: ${possiblePaths.join(', ')}。最后错误: ${lastError?.message || '未知错误'}`);
    }
    
    return res.status(200).send(uploadHtml);
  } catch (error) {
    console.error('读取上传页面失败:', error);
    console.error('当前工作目录:', process.cwd());
    console.error('__dirname:', __dirname);
    
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>错误</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            padding: 40px;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .error-box {
            background: white;
            padding: 40px;
            border-radius: 16px;
            max-width: 600px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          }
          h1 { color: #e74c3c; margin-bottom: 20px; }
          p { color: #666; line-height: 1.6; }
          code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="error-box">
          <h1>上传页面加载失败</h1>
          <p>错误: ${error.message}</p>
          <p style="margin-top: 20px;">
            <a href="/" style="color: #667eea; text-decoration: none;">← 返回首页</a>
          </p>
        </div>
      </body>
      </html>
    `);
  }
};

