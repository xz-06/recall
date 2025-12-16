// 生产环境配置脚本
// 在MkDocs页面加载时自动更新链接

(function() {
    // 检测是否为生产环境
    const isProduction = window.location.hostname !== 'localhost' && 
                         window.location.hostname !== '127.0.0.1' &&
                         !window.location.hostname.includes('127.0.0.1');
    
    // 更新所有上传链接
    function updateUploadLinks() {
        let UPLOAD_URL;
        
        // 检测是否为GitHub Pages
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        if (isGitHubPages) {
            // GitHub Pages：需要包含仓库名路径
            // 从当前URL提取仓库名，例如：https://xz-06.github.io/recall/ -> /recall
            const pathParts = window.location.pathname.split('/').filter(p => p);
            const repoName = pathParts[0] || 'recall'; // 默认使用recall
            UPLOAD_URL = `/${repoName}/upload`;
        } else if (isProduction) {
            // Vercel部署：使用当前域名（自动指向Vercel Functions）
            UPLOAD_URL = window.location.origin + '/upload'; // 例如: https://recall-self.vercel.app/upload
        } else {
            // 本地开发：MkDocs运行在127.0.0.1:8000，上传页面在localhost:3001
            UPLOAD_URL = 'http://localhost:3001/upload';
        }
        
        // 查找所有包含 /upload 的链接
        const links = document.querySelectorAll('a[href*="/upload"], a[href="/upload"]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href === '/upload' || href.endsWith('/upload'))) {
                // 强制更新为正确的URL
                link.href = UPLOAD_URL;
                // 也更新href属性，确保MkDocs渲染时使用正确路径
                link.setAttribute('href', UPLOAD_URL);
            }
        });
        
        // 更新按钮文本中的链接
        const buttons = document.querySelectorAll('.md-button');
        buttons.forEach(button => {
            const href = button.getAttribute('href');
            if (href && (href === '/upload' || href.endsWith('/upload'))) {
                // 强制更新为正确的URL
                button.href = UPLOAD_URL;
                button.setAttribute('href', UPLOAD_URL);
            }
        });
    }
    
    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateUploadLinks);
    } else {
        updateUploadLinks();
    }
    
    // 延迟执行，确保MkDocs渲染完成
    setTimeout(updateUploadLinks, 100);
    setTimeout(updateUploadLinks, 500);
    
    // 加载最新回忆列表
    function loadLatestMemories() {
        const memoriesContainer = document.getElementById('latestMemories');
        if (!memoriesContainer) return;
        
        // 检测是否为GitHub Pages
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        // GitHub Pages不支持API，需要通过GitHub API获取
        // 这里暂时返回空数组，后续可以实现GitHub API获取
        const apiUrl = isGitHubPages
            ? null // GitHub Pages不支持API端点
            : (isProduction 
                ? window.location.origin + '/api/memories'
                : 'http://localhost:3001/api/memories');
        
        if (!apiUrl) {
            memoriesContainer.innerHTML = '<p>💕 回忆会在这里显示。上传新回忆后，页面会自动更新。</p>';
            return;
        }
        
        fetch(apiUrl)
            .then(res => res.json())
            .then(memories => {
                if (memories.length === 0) {
                    const uploadLink = isGitHubPages ? '/recall/upload' : '/upload';
                    memoriesContainer.innerHTML = `<p>还没有回忆，<a href="${uploadLink}">上传第一条回忆</a>吧！</p>`;
                    return;
                }
                
                let html = '<div style="display: grid; gap: 16px; margin-top: 16px;">';
                memories.slice(0, 5).forEach(memory => {
                    const detailUrl = `/memories/detail?file=${encodeURIComponent(memory.filename)}`;
                    html += `
                        <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; background: #f9f9f9;">
                            <h3 style="margin: 0 0 8px 0; font-size: 18px;">
                                <a href="${detailUrl}" style="color: #667eea; text-decoration: none;">${memory.title}</a>
                            </h3>
                            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">📅 ${memory.date}</p>
                            <p style="margin: 0; color: #888; font-size: 14px;">${memory.excerpt}</p>
                        </div>
                    `;
                });
                html += '</div>';
                memoriesContainer.innerHTML = html;
            })
            .catch(error => {
                console.error('加载回忆失败:', error);
                memoriesContainer.innerHTML = '<p>加载回忆失败，请稍后重试。</p>';
            });
    }
    
    // 页面加载完成后加载回忆
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadLatestMemories);
    } else {
        loadLatestMemories();
    }
})();

