@echo off
chcp 65001 >nul
echo ========================================
echo   回忆录系统 - 一键安装脚本
echo ========================================
echo.

echo [1/4] 检查Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到Node.js
    echo    请访问 https://nodejs.org/ 安装Node.js
    pause
    exit /b 1
)
echo ✅ Node.js已安装

echo.
echo [2/4] 安装Node.js依赖...
call npm install
if errorlevel 1 (
    echo ❌ npm install 失败
    pause
    exit /b 1
)
echo ✅ Node.js依赖安装完成

echo.
echo [3/4] 检查Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  未找到Python
    echo    请访问 https://www.python.org/downloads/ 安装Python
    echo    安装后重新运行此脚本
    pause
    exit /b 1
)
echo ✅ Python已安装

echo.
echo [4/4] 安装Python依赖（MkDocs）...
echo 尝试使用用户模式安装（避免权限问题）...
call pip install --user -r requirements.txt
if errorlevel 1 (
    echo ⚠️  用户模式安装失败，尝试管理员模式...
    echo    如果仍然失败，请以管理员身份运行此脚本
    call pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ pip install 失败
        echo    请尝试：
        echo    1. 以管理员身份运行此脚本
        echo    2. 或手动执行: pip install --user -r requirements.txt
        pause
        exit /b 1
    )
)
echo ✅ Python依赖安装完成

echo.
echo ========================================
echo   安装完成！
echo ========================================
echo.
echo 下一步：
echo 1. 运行: npm run mkdocs:build   (构建站点)
echo 2. 运行: npm run dev            (启动开发服务器)
echo.
echo 然后访问：
echo - 回忆录网站: http://localhost:8000
echo - 上传页面: http://localhost:3001/upload
echo.
pause

