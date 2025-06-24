@echo off
chcp 65001 >nul
echo.
echo ===== Wraindy 图片数据提取工具 =====
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0generate_fixed.ps1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo 成功生成数据文件！
    echo 已生成文件:
    echo    - data.js ^(图片数据^)
    echo    - metadata.js ^(筛选条件^)
    echo.
    echo 现在可以刷新网页查看最新数据
    echo ========================================
) else (
    echo 数据提取时出现错误
)

pause
