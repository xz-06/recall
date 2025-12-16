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

    // 检测是否为GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    const pathParts = window.location.pathname.split('/').filter(p => p);
    const repoName = pathParts[0] || 'recall';
    const basePath = isGitHubPages ? `/${repoName}` : '';

    const apiUrl = isGitHubPages
        ? null // GitHub Pages不支持API端点，需要直接从GitHub raw获取
        : (isProduction
            ? window.location.origin + '/api/memory?file=' + encodeURIComponent(filename)
            : 'http://localhost:3001/api/memory?file=' + encodeURIComponent(filename));

    // 图片基础URL
    const imageBaseUrl = isGitHubPages
        ? 'https://raw.githubusercontent.com/xz-06/recall/main/docs/images'
        : (isProduction
            ? 'https://raw.githubusercontent.com/xz-06/recall/main/docs/images'
            : 'http://localhost:3001/images');

    const container = document.getElementById('memoryDetail');
    if (!container) return;

    // GitHub Pages: 直接从GitHub raw获取Markdown内容
    if (isGitHubPages) {
        const markdownUrl = `https://raw.githubusercontent.com/xz-06/recall/main/docs/memories/${encodeURIComponent(filename)}`;
        
        fetch(markdownUrl)
            .then(res => {
                if (!res.ok) throw new Error('获取文件失败');
                return res.text();
            })
            .then(content => {
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

                const memory = {
                    filename: filename,
                    title: titleMatch ? titleMatch[1] : filename.replace('.md', ''),
                    date: dateMatch ? dateMatch[1] : '',
                    author: authorMatch ? authorMatch[1] : '',
                    content: bodyContent
                };

                renderMemory(memory);
            })
            .catch(error => {
                console.error('加载回忆详情失败:', error);
                if (container) {
                    container.innerHTML = '<p>❌ 加载回忆详情失败，请稍后重试。</p>';
                }
            });
    } else {
        // Vercel或本地开发：使用API
        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    container.innerHTML = '<p>❌ ' + data.error + '</p>';
                    return;
                }
                renderMemory(data);
            })
            .catch(error => {
                console.error('加载回忆详情失败:', error);
                if (container) {
                    container.innerHTML = '<p>❌ 加载回忆详情失败，请稍后重试。</p>';
                }
            });
    }

    // 渲染回忆内容
    function renderMemory(memory) {
        // 将Markdown内容转换为HTML（简单处理）
        function markdownToHtml(markdown) {
            let html = markdown;

            // 先处理图片，并替换为占位符
            const imagePlaceholders = [];
            html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, function(match, alt, src) {
                let imageUrl;
                let imageFilename;

                if (src.startsWith('http')) {
                    imageUrl = src;
                } else if (src.startsWith('images/')) {
                    imageFilename = src.replace(/^images\//, '');
                    imageUrl = imageBaseUrl + '/' + encodeURIComponent(imageFilename);
                } else if (src.startsWith('/images/')) {
                    imageFilename = src.replace(/^\/images\//, '');
                    imageUrl = imageBaseUrl + '/' + encodeURIComponent(imageFilename);
                } else {
                    imageFilename = src;
                    imageUrl = imageBaseUrl + '/' + encodeURIComponent(imageFilename);
                }

                const placeholder = `__IMAGE_PLACEHOLDER_${imagePlaceholders.length}__`;
                imagePlaceholders.push({
                    placeholder: placeholder,
                    html: `<div style="text-align: center; margin: 24px 0;">
                                <img src="${imageUrl}"
                                     alt="${alt || '图片'}"
                                     style="max-width: 100%; max-height: 600px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: block; margin: 0 auto;"
                                     loading="lazy"
                                     onerror="console.error('图片加载失败:', '${imageUrl}'); this.style.display='none';" />
                            </div>`
                });
                return placeholder;
            });

            // 处理标题
            html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
            html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
            html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');

            // 处理粗体
            html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

            // 将剩余的Markdown内容按行分割，并处理段落和换行
            const lines = html.split('\n');
            let processedHtml = '';
            let inParagraph = false;

            lines.forEach(line => {
                line = line.trim();
                if (line.startsWith('<h') || line.startsWith('<div')) { // 标题或图片占位符
                    if (inParagraph) {
                        processedHtml += '</p>\n';
                        inParagraph = false;
                    }
                    processedHtml += line + '\n';
                } else if (line === '---') { // 分隔线
                    if (inParagraph) {
                        processedHtml += '</p>\n';
                        inParagraph = false;
                    }
                    processedHtml += '<hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">\n';
                } else if (line) { // 普通文本行
                    if (!inParagraph) {
                        processedHtml += '<p>';
                        inParagraph = true;
                    }
                    processedHtml += line + '<br>';
                } else { // 空行
                    if (inParagraph) {
                        processedHtml += '</p>\n';
                        inParagraph = false;
                    }
                }
            });
            if (inParagraph) {
                processedHtml += '</p>\n';
            }

            // 替换图片占位符
            imagePlaceholders.forEach(p => {
                processedHtml = processedHtml.replace(p.placeholder, p.html);
            });

            return processedHtml;
        }

        const contentHtml = markdownToHtml(memory.content);

        // 清除容器内容，避免重复
        container.innerHTML = '';

        const backUrl = `${basePath}/memories/by-date`;

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
                    <a href="${backUrl}" style="color: #667eea; text-decoration: none; font-weight: 500;">
                        ← 返回回忆列表
                    </a>
                </div>
            </div>
        `;

        // 图片去重（如果MkDocs也渲染了图片，这里可以移除重复的）
        const images = container.querySelectorAll('.memory-content img');
        const seenSrcs = new Set();
        images.forEach(img => {
            if (seenSrcs.has(img.src)) {
                img.remove(); // 移除重复的图片
            } else {
                seenSrcs.add(img.src);
            }
        });
    }
})();

