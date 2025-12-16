// 配置文件 - 根据环境自动选择API地址
const config = {
  // 开发环境
  development: {
    apiUrl: 'http://localhost:3001',
    uploadUrl: 'http://localhost:3001/upload',
    siteUrl: 'http://localhost:8000'
  },
  // 生产环境 - 需要替换为你的实际后端地址
  production: {
    // TODO: 替换为你的Railway/Render后端地址
    apiUrl: 'https://your-backend.railway.app', // 例如: https://recall-production.up.railway.app
    uploadUrl: 'https://your-backend.railway.app/upload',
    siteUrl: 'https://xz-06.github.io/recall' // 你的GitHub Pages地址
  }
};

// 自动检测环境
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

const currentConfig = isProduction ? config.production : config.development;

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { config, currentConfig, isProduction };
} else {
  window.APP_CONFIG = currentConfig;
}

