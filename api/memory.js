// Vercel Serverless Function - 获取单个回忆详情
const { Octokit } = require('@octokit/rest');

module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filename = req.query.file;
    
    if (!filename) {
      return res.status(400).json({ error: '缺少文件名参数' });
    }

    if (!process.env.GITHUB_TOKEN) {
      return res.status(500).json({ error: 'GITHUB_TOKEN未配置' });
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    // 获取文件内容
    const { data: fileData } = await octokit.repos.getContent({
      owner: 'xz-06',
      repo: 'recall',
      path: `docs/memories/${filename}`,
      ref: 'main'
    });

    const content = Buffer.from(fileData.content, 'base64').toString('utf8');
    
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
    
    return res.status(200).json({
      filename: filename,
      title: titleMatch ? titleMatch[1] : filename.replace('.md', ''),
      date: dateMatch ? dateMatch[1] : '',
      author: authorMatch ? authorMatch[1] : '',
      content: bodyContent
    });

  } catch (error) {
    console.error('获取回忆详情失败:', error);
    
    if (error.status === 404) {
      return res.status(404).json({ error: '回忆不存在' });
    }
    
    return res.status(500).json({ error: '获取失败', details: error.message });
  }
};

