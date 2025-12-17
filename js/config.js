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
        const pathParts = window.location.pathname.split('/').filter(p => p);
        const repoName = pathParts[0] || 'recall'; // 假设仓库名为 'recall'

        if (isGitHubPages) {
            // GitHub Pages：使用带仓库名的相对路径
            UPLOAD_URL = `/${repoName}/upload`;
        } else if (isProduction) {
            // Vercel部署：使用当前域名（自动指向Vercel Functions）
            UPLOAD_URL = window.location.origin + '/upload'; // 例如: https://recall-self.vercel.app/upload
        } else {
            // 本地开发：MkDocs运行在127.0.0.1:8000，上传页面在localhost:3001
            UPLOAD_URL = 'http://localhost:3001/upload';
        }

        // 查找所有包含 /upload 的链接
        const links = document.querySelectorAll('a[href*="/upload"]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href === '/upload' || href.includes('/upload'))) {
                // 避免重复更新
                if (!link.href.includes(UPLOAD_URL)) {
                    link.href = UPLOAD_URL;
                }
            }
        });

        // 更新按钮文本中的链接
        const buttons = document.querySelectorAll('.md-button');
        buttons.forEach(button => {
            const href = button.getAttribute('href');
            if (href && (href === '/upload' || href.includes('/upload'))) {
                // 避免重复更新
                if (!button.href.includes(UPLOAD_URL)) {
                    button.href = UPLOAD_URL;
                }
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

    // GitHub API 配置
    const GITHUB_CONFIG = {
        owner: 'xz-06',
        repo: 'recall',
        branch: 'main',
        path: 'docs/memories'
    };

    // 环境标记与基础路径
    const isGitHubPages = window.location.hostname.includes('github.io');
    const pathParts = window.location.pathname.split('/').filter(p => p);
    const repoName = pathParts[0] || 'recall';
    const basePath = isGitHubPages ? `/${repoName}` : '';

    // 回忆数据缓存，避免重复请求
    let memoriesCache = null;

    // 获取回忆数据：
    // - GitHub Pages: 读取构建产出的静态 JSON（site/memories/index.json）
    // - 其他环境: 调用服务器 API
    function getMemoriesData() {
        if (memoriesCache) return memoriesCache;

        if (isGitHubPages) {
            const staticUrl = `${basePath}/memories/index.json`;
            memoriesCache = fetch(staticUrl, { cache: 'no-cache' })
                .then(async res => {
                    if (!res.ok) {
                        const text = await res.text().catch(() => '');
                        throw new Error(`加载静态回忆数据失败 (${res.status}): ${text.substring(0, 120)}`);
                    }
                    return res.json();
                });
        } else {
            const apiUrl = isProduction
                ? window.location.origin + '/api/memories'
                : 'http://localhost:3001/api/memories';

            memoriesCache = fetch(apiUrl)
                .then(async res => {
                    const contentType = res.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        const text = await res.text();
                        throw new Error(`服务器返回了非JSON响应 (${res.status}): ${text.substring(0, 100)}`);
                    }
                    
                    const data = await res.json();
                    
                    if (!res.ok) {
                        const errorMessage = data.error || `HTTP ${res.status}`;
                        const errorDetails = data.details || data.message || '';
                        const errorNote = data.note || '';
                        throw new Error(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}${errorNote ? ' ' + errorNote : ''}`);
                    }
                    
                    return data;
                });
        }

        return memoriesCache;
    }

    // 加载最新回忆列表
    function loadLatestMemories() {
        const memoriesContainer = document.getElementById('latestMemories');
        if (!memoriesContainer) return;

        // 检测是否为GitHub Pages
        const isGitHubPages = window.location.hostname.includes('github.io');
        const pathParts = window.location.pathname.split('/').filter(p => p);
        const repoName = pathParts[0] || 'recall';
        const basePath = isGitHubPages ? `/${repoName}` : '';

        // 选择数据源
        let fetchPromise;
        if (isGitHubPages) {
            // GitHub Pages: 直接从 GitHub API 获取
            fetchPromise = fetchMemoriesFromGitHub();
        } else {
            // Vercel 或其他: 使用服务器 API
            const apiUrl = isProduction
                ? window.location.origin + '/api/memories'
                : 'http://localhost:3001/api/memories';
            
            fetchPromise = fetch(apiUrl)
                .then(async res => {
                    const contentType = res.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        const text = await res.text();
                        throw new Error(`服务器返回了非JSON响应 (${res.status}): ${text.substring(0, 100)}`);
                    }
                    
                    const data = await res.json();
                    
                    if (!res.ok) {
                        const errorMessage = data.error || `HTTP ${res.status}`;
                        const errorDetails = data.details || data.message || '';
                        const errorNote = data.note || '';
                        throw new Error(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}${errorNote ? ' ' + errorNote : ''}`);
                    }
                    
                    return data;
                });
        }

        fetch(apiUrl)
            .then(async res => {
                // 检查响应内容类型
                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await res.text();
                    throw new Error(`服务器返回了非JSON响应 (${res.status}): ${text.substring(0, 100)}`);
                }
                
                const data = await res.json();
                
                if (!res.ok) {
                    const errorMessage = data.error || `HTTP ${res.status}`;
                    const errorDetails = data.details || data.message || '';
                    const errorNote = data.note || '';
                    throw new Error(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}${errorNote ? ' ' + errorNote : ''}`);
                }
                
                return data;
            })
            .then(memories => {
                if (!Array.isArray(memories)) {
                    throw new Error('返回的数据格式不正确');
                }

                if (memories.length === 0) {
                    const uploadLink = isGitHubPages ? `${basePath}/upload` : '/upload';
                    memoriesContainer.innerHTML = `<p>还没有回忆，<a href="${uploadLink}">上传第一条回忆</a>吧！</p>`;
                    return;
                }

                let html = '<div style="display: grid; gap: 16px; margin-top: 16px;">';
                memories.slice(0, 5).forEach(memory => {
                    const detailUrl = `${basePath}/memories/detail?file=${encodeURIComponent(memory.filename)}`;
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
                const errorMessage = error.message || '未知错误';
                const errorHint = isGitHubPages 
                    ? '如果仓库是私有的，需要将仓库设置为公开，或者使用其他部署方式（如 Vercel）。'
                    : '如果问题持续，请检查GITHUB_TOKEN配置。';
                
                memoriesContainer.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px; color: #d32f2f; padding: 16px; background: #ffebee; border-radius: 8px; border: 1px solid #ffcdd2;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <div>
                            <p style="margin: 0; font-weight: 600;">加载回忆失败，请稍后重试。</p>
                            <p style="margin: 4px 0 0 0; font-size: 14px;">${errorHint}</p>
                            <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">错误详情: ${errorMessage}</p>
                        </div>
                    </div>
                `;
            });
    }

    // 加载按时间排序的回忆列表
    function loadMemoriesByDate() {
        const memoriesContainer = document.getElementById('memoriesByDate');
        if (!memoriesContainer) return;

        // 检测是否为GitHub Pages
        const isGitHubPages = window.location.hostname.includes('github.io');
        const pathParts = window.location.pathname.split('/').filter(p => p);
        const repoName = pathParts[0] || 'recall';
        const basePath = isGitHubPages ? `/${repoName}` : '';

        getMemoriesData()
            .then(memories => {
                if (!Array.isArray(memories)) {
                    throw new Error('返回的数据格式不正确');
                }

                if (memories.length === 0) {
                    const uploadLink = isGitHubPages ? `${basePath}/upload` : '/upload';
                    memoriesContainer.innerHTML = `<p>还没有回忆，<a href="${uploadLink}">上传第一条回忆</a>吧！</p>`;
                    return;
                }

                // 按日期分组
                const memoriesByDate = {};
                memories.forEach(memory => {
                    const date = memory.date || '未知日期';
                    if (!memoriesByDate[date]) {
                        memoriesByDate[date] = [];
                    }
                    memoriesByDate[date].push(memory);
                });

                // 按日期排序（最新的在前）
                const sortedDates = Object.keys(memoriesByDate).sort((a, b) => {
                    return new Date(b) - new Date(a);
                });

                let html = '<div style="display: flex; flex-direction: column; gap: 24px; margin-top: 16px;">';
                sortedDates.forEach(date => {
                    html += `
                        <div style="margin-bottom: 16px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #667eea; font-weight: 600;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span>${date}</span>
                            </div>
                            <div style="display: grid; gap: 12px;">
                    `;
                    
                    memoriesByDate[date].forEach(memory => {
                        const detailUrl = `${basePath}/memories/detail?file=${encodeURIComponent(memory.filename)}`;
                        html += `
                            <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; background: #f9f9f9; transition: all 0.3s;">
                                <h3 style="margin: 0 0 8px 0; font-size: 18px;">
                                    <a href="${detailUrl}" style="color: #667eea; text-decoration: none; font-weight: 500;">${memory.title}</a>
                                </h3>
                                <p style="margin: 0; color: #888; font-size: 14px; line-height: 1.6;">${memory.excerpt}</p>
                            </div>
                        `;
                    });
                    
                    html += `
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
                memoriesContainer.innerHTML = html;
            })
            .catch(error => {
                console.error('加载回忆失败:', error);
                const errorMessage = error.message || '未知错误';
                const isGitHubPages = window.location.hostname.includes('github.io');
                const errorHint = isGitHubPages 
                    ? '如果仓库是私有的，需要将仓库设置为公开，或者使用其他部署方式（如 Vercel）。'
                    : '如果问题持续，请检查GITHUB_TOKEN配置。';
                
                memoriesContainer.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px; color: #d32f2f; padding: 16px; background: #ffebee; border-radius: 8px; border: 1px solid #ffcdd2;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <div>
                            <p style="margin: 0; font-weight: 600;">加载回忆失败，请稍后重试。</p>
                            <p style="margin: 4px 0 0 0; font-size: 14px;">${errorHint}</p>
                            <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">错误详情: ${errorMessage}</p>
                        </div>
                    </div>
                `;
            });
    }

    // 页面加载完成后加载回忆
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            loadLatestMemories();
            loadMemoriesByDate();
        });
    } else {
        loadLatestMemories();
        loadMemoriesByDate();
    }
})();

