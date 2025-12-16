// 回忆详情页面脚本
(function() {
    // 从URL获取文件名
    function getFilenameFromUrl() {
        // 如果当前页面是 detail.md，从查询参数获取
        const params = new URLSearchParams(window.location.search);
        const file = params.get('file');
        if (file) return file;
        
        // 如果直接访问的是 .md 文件，从路径获取
        const path = window.location.pathname;
        const match = path.match(/\/memories\/([^\/]+\.md)$/);
        if (match) return match[1];
        
        return null;
    }
    
    const filename = getFilenameFromUrl();
    if (!filename) {
        const container = document.getElementById('memoryDetail');
        if (container) {
            container.innerHTML = '<p>❌ 未找到回忆文件</p>';
        }
        return;
    }
    
    // 检测是否为生产环境
    const isProduction = window.location.hostname !== 'localhost' && 
                         window.location.hostname !== '127.0.0.1' &&
                         !window.location.hostname.includes('127.0.0.1');
    
    const apiUrl = isProduction 
        ? window.location.origin + '/api/memory?file=' + encodeURIComponent(filename)
        : 'http://localhost:3001/api/memory?file=' + encodeURIComponent(filename);
    
    // 图片基础URL
    const imageBaseUrl = isProduction
        ? 'https://raw.githubusercontent.com/xz-06/recall/main/docs/images'
        : 'http://localhost:3001/images';
    
    const container = document.getElementById('memoryDetail');
    if (!container) return;
    
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                container.innerHTML = '<p>❌ ' + data.error + '</p>';
                return;
            }
            
            const memory = data;
            
            // 将Markdown内容转换为HTML（简单处理）
            function markdownToHtml(markdown) {
                // 先处理图片，直接替换为HTML（避免重复处理）
                let html = markdown.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, function(match, alt, src) {
                    // 构建图片URL
                    let imageUrl;
                    let imageFilename;
                    
                    if (src.startsWith('http')) {
                        // 已经是完整URL
                        imageUrl = src;
                    } else if (src.startsWith('images/')) {
                        // 相对路径 images/文件名
                        imageFilename = src.replace(/^images\//, '');
                        // URL编码文件名，处理特殊字符
                        imageUrl = imageBaseUrl + '/' + encodeURIComponent(imageFilename);
                    } else if (src.startsWith('/images/')) {
                        // 绝对路径 /images/文件名
                        imageFilename = src.replace(/^\/images\//, '');
                        imageUrl = imageBaseUrl + '/' + encodeURIComponent(imageFilename);
                    } else {
                        // 其他情况，假设是images目录下的文件
                        imageFilename = src;
                        imageUrl = imageBaseUrl + '/' + encodeURIComponent(imageFilename);
                    }
                    
                    // 直接返回HTML，不返回占位符
                    return `<div style="text-align: center; margin: 24px 0;">
                                <img src="${imageUrl}" 
                                     alt="${alt || '图片'}" 
                                     style="max-width: 100%; max-height: 600px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: block; margin: 0 auto;" 
                                     loading="lazy"
                                     onerror="console.error('图片加载失败:', '${imageUrl}'); this.style.display='none';" />
                            </div>`;
                });
                
                // 处理标题
                html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
                html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
                html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
                
                // 处理粗体
                html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                
                // 按段落分割（双换行），但保留HTML标签
                const parts = html.split(/(\n\n+)/);
                let result = '';
                let inHtmlTag = false;
                
                for (let i = 0; i < parts.length; i++) {
                    let part = parts[i];
                    
                    // 跳过空行
                    if (part.trim() === '') continue;
                    
                    // 检查是否是HTML标签（图片div或标题）
                    if (part.trim().startsWith('<div') || part.trim().startsWith('<h')) {
                        result += part.trim() + '\n';
                    } else if (part.trim().startsWith('</')) {
                        result += part.trim() + '\n';
                    } else {
                        // 普通文本段落
                        part = part.replace(/\n/g, '<br>').trim();
                        if (part) {
                            result += '<p>' + part + '</p>\n';
                        }
                    }
                }
                
                return result;
            }
            
            const contentHtml = markdownToHtml(memory.content);
            
            // 清除容器内容，避免重复
            container.innerHTML = '';
            
            container.innerHTML = `
                <div style="max-width: 800px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 12px; margin-bottom: 32px; color: white;">
                        <h1 style="margin: 0 0 16px 0; font-size: 32px; color: white;">
                            ${memory.title}
                        </h1>
                        <div style="display: flex; gap: 24px; flex-wrap: wrap; font-size: 16px; opacity: 0.9;">
                            <span>📅 ${memory.date}</span>
                            ${memory.author ? '<span>👤 ' + memory.author + '</span>' : ''}
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); line-height: 1.8; font-size: 16px;" class="memory-content">
                        ${contentHtml}
                    </div>
                    
                    <div style="margin-top: 32px; text-align: center;">
                        <a href="/memories/by-date" style="color: #667eea; text-decoration: none; font-weight: 500;">
                            ← 返回回忆列表
                        </a>
                    </div>
                </div>
            `;
            
            // 延迟执行，移除重复的图片
            setTimeout(() => {
                const memoryContent = container.querySelector('.memory-content');
                if (memoryContent) {
                    const allImages = memoryContent.querySelectorAll('img');
                    const seenSrcs = new Set();
                    allImages.forEach((img, index) => {
                        const src = img.src;
                        if (seenSrcs.has(src)) {
                            // 移除重复的图片
                            img.parentElement.remove();
                        } else {
                            seenSrcs.add(src);
                        }
                    });
                }
            }, 200);
        })
        .catch(error => {
            console.error('加载回忆详情失败:', error);
            if (container) {
                container.innerHTML = '<p>❌ 加载回忆详情失败，请稍后重试。</p>';
            }
        });
})();

