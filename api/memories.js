// Vercel Serverless Function - 获取回忆列表
const fs = require('fs');
const path = require('path');

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
    // 注意：Vercel Functions是只读文件系统
    // 无法直接读取文件，需要通过GitHub API或其他方式获取
    // 这里返回空数组作为示例
    
    return res.status(200).json([]);

  } catch (error) {
    console.error('获取失败:', error);
    return res.status(500).json({ error: '获取失败', details: error.message });
  }
};

