@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo   启动回忆录系统
echo ========================================
echo.
echo 正在启动开发服务器...
echo.
echo 访问地址：
echo   - 回忆录网站: http://localhost:8000
echo   - 上传页面: http://localhost:3001/upload
echo.
echo 按 Ctrl+C 停止服务器
echo.
call npm run dev

