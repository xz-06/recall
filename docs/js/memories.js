// 回忆页面动态加载脚本
(function() {
    // 检测是否为生产环境
    const isProduction = window.location.hostname !== 'localhost' && 
                         window.location.hostname !== '127.0.0.1' &&
                         !window.location.hostname.includes('127.0.0.1');
    
    const apiUrl = isProduction 
        ? window.location.origin + '/api/memories'
        : 'http://localhost:3001/api/memories';
    
    // 加载按时间排序的回忆
    function loadMemoriesByDate() {
        const container = document.getElementById('memoriesByDate');
        if (!container) return;
        
        fetch(apiUrl)
            .then(res => res.json())
            .then(memories => {
                if (memories.length === 0) {
                    container.innerHTML = '<p>💕 还没有回忆，<a href="/upload">上传第一条回忆</a>吧！</p>';
                    return;
                }
                
                let html = '';
                memories.forEach(memory => {
                    const detailUrl = `/memories/detail?file=${encodeURIComponent(memory.filename)}`;
                    html += `
                        <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #e0e0e0;">
                            <h2 style="margin: 0 0 8px 0; font-size: 24px;">
                                <a href="${detailUrl}" style="color: #667eea; text-decoration: none;">
                                    📅 ${memory.date} - ${memory.title}
                                </a>
                            </h2>
                            <p style="margin: 8px 0; color: #666; font-size: 14px;">
                                ${memory.excerpt}
                            </p>
                            <p style="margin: 8px 0;">
                                <a href="${detailUrl}" style="color: #667eea; text-decoration: none; font-weight: 500;">
                                    查看详情 →
                                </a>
                            </p>
                        </div>
                    `;
                });
                
                container.innerHTML = html;
            })
            .catch(error => {
                console.error('加载回忆失败:', error);
                container.innerHTML = '<p>❌ 加载回忆失败，请稍后重试。如果问题持续，请检查GITHUB_TOKEN配置。</p>';
            });
    }
    
    // 加载所有回忆
    function loadAllMemories() {
        const container = document.getElementById('allMemories');
        if (!container) return;
        
        fetch(apiUrl)
            .then(res => res.json())
            .then(memories => {
                if (memories.length === 0) {
                    container.innerHTML = '<p>💕 还没有回忆，<a href="/upload">上传第一条回忆</a>吧！</p>';
                    return;
                }
                
                let html = '<div style="display: grid; gap: 20px; margin-top: 20px;">';
                memories.forEach(memory => {
                    const detailUrl = `/memories/detail?file=${encodeURIComponent(memory.filename)}`;
                    html += `
                        <div style="border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; background: #f9f9f9; transition: transform 0.2s, box-shadow 0.2s;" 
                             onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
                             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            <h3 style="margin: 0 0 12px 0; font-size: 20px;">
                                <a href="${detailUrl}" style="color: #667eea; text-decoration: none;">
                                    ${memory.title}
                                </a>
                            </h3>
                            <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">
                                📅 ${memory.date}
                            </p>
                            <p style="margin: 0 0 12px 0; color: #888; font-size: 14px; line-height: 1.6;">
                                ${memory.excerpt}
                            </p>
                            <p style="margin: 0;">
                                <a href="${detailUrl}" style="color: #667eea; text-decoration: none; font-weight: 500;">
                                    阅读全文 →
                                </a>
                            </p>
                        </div>
                    `;
                });
                html += '</div>';
                
                container.innerHTML = html;
            })
            .catch(error => {
                console.error('加载回忆失败:', error);
                container.innerHTML = '<p>❌ 加载回忆失败，请稍后重试。如果问题持续，请检查GITHUB_TOKEN配置。</p>';
            });
    }
    
    // 页面加载完成后执行
    function init() {
        loadMemoriesByDate();
        loadAllMemories();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

