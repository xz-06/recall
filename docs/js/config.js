// 生产环境配置脚本
// 在MkDocs页面加载时自动更新链接

(function() {
    // 检测是否为生产环境
    const isProduction = window.location.hostname !== 'localhost' && 
                         window.location.hostname !== '127.0.0.1' &&
                         !window.location.hostname.includes('127.0.0.1');
    
    if (isProduction) {
        // Vercel部署：使用当前域名（自动指向Vercel Functions）
        const BACKEND_URL = window.location.origin; // 例如: https://recall-self.vercel.app
        
        // 更新所有上传链接
        document.addEventListener('DOMContentLoaded', function() {
            // 查找所有包含 /upload 的链接
            const links = document.querySelectorAll('a[href*="/upload"], a[href*="localhost:3001"]');
            links.forEach(link => {
                if (link.href.includes('localhost:3001') || (link.href.includes('/upload') && !link.href.startsWith('http'))) {
                    // 相对路径 /upload 保持不变，绝对路径需要更新
                    if (link.href.startsWith('http')) {
                        link.href = BACKEND_URL + '/upload';
                    } else {
                        link.href = BACKEND_URL + link.getAttribute('href');
                    }
                }
            });
            
            // 更新按钮文本中的链接
            const buttons = document.querySelectorAll('.md-button');
            buttons.forEach(button => {
                if (button.href) {
                    if (button.href.includes('localhost:3001') || (button.href.includes('/upload') && !button.href.startsWith('http'))) {
                        if (button.href.startsWith('http')) {
                            button.href = BACKEND_URL + '/upload';
                        } else {
                            button.href = BACKEND_URL + button.getAttribute('href');
                        }
                    }
                }
            });
        });
    }
})();

