@echo off
chcp 65001 >nul
setlocal

:: 設定 Python 版本與安裝位置
set PYTHON_VERSION=3.9.13
set PYTHON_INSTALLER=python-%PYTHON_VERSION%-amd64.exe
set PYTHON_URL=https://www.python.org/ftp/python/%PYTHON_VERSION%/%PYTHON_INSTALLER%
set PYTHON_DIR=%~dp0python39

:: 嘗試找到已存在的 Python
where python >nul 2>nul
if %errorlevel%==0 (
    echo Python 已安裝，執行 pip install...
    goto install_requirements
)

:: 檢查是否已下載安裝程式
if not exist "%PYTHON_INSTALLER%" (
    echo 正在下載 Python %PYTHON_VERSION%...
    powershell -Command "Invoke-WebRequest -Uri %PYTHON_URL% -OutFile '%PYTHON_INSTALLER%'"
)

:: 安裝 Python（靜默模式，並加入 PATH）
echo 正在安裝 Python...
%PYTHON_INSTALLER% /quiet InstallAllUsers=0 PrependPath=1 TargetDir="%PYTHON_DIR%"

:: 設定環境變數（暫時）
set PATH=%PYTHON_DIR%;%PYTHON_DIR%\Scripts;%PATH%

:: 再次確認是否成功安裝
where %PYTHON_DIR%\python.exe >nul 2>nul
if %errorlevel% neq 0 (
    echo Python 安裝失敗。
    pause
    exit /b
)

:install_requirements
echo 正在安裝套件...
python -m pip install --upgrade pip
python -m pip install pillow deep_translator

echo 安裝完成，按任意鍵結束。
pause
