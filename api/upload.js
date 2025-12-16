// Vercel Serverless Function - 上传回忆API
// 注意：Vercel Functions是只读文件系统，需要使用GitHub API保存文件

module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 解析multipart/form-data
    // Vercel Functions需要使用busboy
    const busboy = require('busboy');
    const fields = {};
    const files = [];

    const bb = busboy({ headers: req.headers });
    
    bb.on('field', (name, value) => {
      fields[name] = value;
    });

    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      // 注意：Vercel Functions无法直接保存文件
      // 需要将文件转换为base64或上传到外部存储
      const chunks = [];
      file.on('data', (data) => {
        chunks.push(data);
      });
      file.on('end', () => {
        files.push({
          name: filename,
          data: Buffer.concat(chunks),
          mimeType
        });
      });
    });

    await new Promise((resolve, reject) => {
      bb.on('finish', resolve);
      bb.on('error', reject);
      req.pipe(bb);
    });

    const { title, content = '', date, author = '' } = fields;

    if (!title || !date) {
      return res.status(400).json({ error: '标题和日期是必填项' });
    }

    // 生成文件名
    const safeTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').substring(0, 50);
    const dateStr = date.replace(/-/g, '');
    const filename = `${dateStr}-${safeTitle}.md`;

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

    // 处理图片（上传到GitHub）
    if (files.length > 0) {
      markdown += `## 📸 照片\n\n`;
      
      if (process.env.GITHUB_TOKEN) {
        const { Octokit } = require('@octokit/rest');
        const octokit = new Octokit({
          auth: process.env.GITHUB_TOKEN
        });

        // 上传图片到GitHub
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const imageFilename = `${Date.now()}-${i}-${file.name}`;
          const imageBase64 = file.data.toString('base64');

          try {
            await octokit.repos.createOrUpdateFileContents({
              owner: 'xz-06',
              repo: 'recall',
              path: `docs/images/${imageFilename}`,
              message: `Add image: ${imageFilename}`,
              content: imageBase64,
              branch: 'main'
            });

            markdown += `![图片${i + 1}](images/${imageFilename})\n\n`;
          } catch (error) {
            console.error(`上传图片失败 ${imageFilename}:`, error);
          }
        }
      } else {
        // 如果没有GitHub Token，只记录文件名
        files.forEach((file, index) => {
          markdown += `![图片${index + 1}](需要配置GITHUB_TOKEN上传图片)\n\n`;
        });
      }
    }

    markdown += `\n---\n\n`;
    markdown += `*创建时间: ${new Date().toLocaleString('zh-CN')}*\n`;

    // 使用GitHub API保存Markdown文件
    if (process.env.GITHUB_TOKEN) {
      const { Octokit } = require('@octokit/rest');
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
      });

      try {
        // 创建或更新文件
        await octokit.repos.createOrUpdateFileContents({
          owner: 'xz-06',
          repo: 'recall',
          path: `docs/memories/${filename}`,
          message: `Add memory: ${title}`,
          content: Buffer.from(markdown, 'utf8').toString('base64'),
          branch: 'main'
        });

        return res.status(200).json({
          success: true,
          message: '回忆已添加并保存到GitHub',
          filename: filename,
          path: `/memories/${filename}`
        });
      } catch (githubError) {
        console.error('GitHub API错误:', githubError);
        return res.status(500).json({
          error: '保存到GitHub失败',
          details: githubError.message,
          note: '请检查GITHUB_TOKEN环境变量是否正确配置'
        });
      }
    } else {
      // 如果没有配置GitHub Token，返回内容
      return res.status(200).json({
        success: true,
        message: '回忆内容已生成',
        filename: filename,
        content: markdown,
        note: '需要配置GITHUB_TOKEN环境变量才能自动保存到GitHub'
      });
    }

  } catch (error) {
    console.error('上传失败:', error);
    return res.status(500).json({ error: '上传失败', details: error.message });
  }
};
