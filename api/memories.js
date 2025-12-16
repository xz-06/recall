// Vercel Serverless Function - 获取回忆列表
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
    if (!process.env.GITHUB_TOKEN) {
      return res.status(500).json({ 
        error: 'GITHUB_TOKEN未配置',
        message: '请检查GITHUB_TOKEN环境变量是否正确配置'
      });
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    // 获取docs/memories目录下的所有文件
    const { data } = await octokit.repos.getContent({
      owner: 'xz-06',
      repo: 'recall',
      path: 'docs/memories',
      ref: 'main'
    });

    if (!Array.isArray(data)) {
      return res.status(200).json([]);
    }

    // 过滤出.md文件（排除index.md和by-date.md）
    const memoryFiles = data
      .filter(item => item.type === 'file' && item.name.endsWith('.md') && 
                      item.name !== 'index.md' && item.name !== 'by-date.md')
      .slice(0, 10); // 只返回最新10条

    // 获取每个文件的内容
    const memories = await Promise.all(
      memoryFiles.map(async (file) => {
        try {
          const { data: fileData } = await octokit.repos.getContent({
            owner: 'xz-06',
            repo: 'recall',
            path: file.path,
            ref: 'main'
          });

          const content = Buffer.from(fileData.content, 'base64').toString('utf8');
          const titleMatch = content.match(/^#\s+(.+)$/m);
          const dateMatch = content.match(/\*\*日期\*\*:\s+(.+)$/m);
          
          return {
            filename: file.name,
            title: titleMatch ? titleMatch[1] : file.name.replace('.md', ''),
            date: dateMatch ? dateMatch[1] : '',
            path: `/memories/${file.name}`,
            excerpt: content.substring(0, 100).replace(/#/g, '').trim() + '...'
          };
        } catch (error) {
          console.error(`获取文件 ${file.name} 失败:`, error);
          return null;
        }
      })
    );

    // 过滤掉null值并按日期排序
    const validMemories = memories
      .filter(m => m !== null)
      .sort((a, b) => b.date.localeCompare(a.date));

    return res.status(200).json(validMemories);

  } catch (error) {
    console.error('获取失败:', error);
    
    // 根据GitHub API错误状态码返回相应的HTTP状态码和错误信息
    let statusCode = 500;
    let errorMessage = '获取失败';
    let details = error.message;
    
    if (error.status === 401) {
      statusCode = 401;
      errorMessage = '认证失败';
      details = '请检查GITHUB_TOKEN是否正确配置';
    } else if (error.status === 403) {
      statusCode = 403;
      errorMessage = '访问被拒绝';
      details = '请检查GITHUB_TOKEN是否有仓库访问权限';
    } else if (error.status === 404) {
      statusCode = 404;
      errorMessage = '仓库或路径不存在';
      details = '请检查仓库名称和路径是否正确';
    }
    
    return res.status(statusCode).json({ 
      error: errorMessage, 
      details: details,
      note: '如果问题持续，请检查GITHUB_TOKEN配置'
    });
  }
};

