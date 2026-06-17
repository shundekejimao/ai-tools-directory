#!/bin/bash
# AI面试官 - 一键启动脚本

echo "🚀 启动AI面试官..."

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到Python3，请先安装"
    exit 1
fi

# 加载环境变量
if [ -f .env ]; then
    echo "🔐 加载环境变量..."
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠️ 未找到.env文件，请复制.env.example并填入你的API Key"
    echo "   cp .env.example .env"
    echo "   然后编辑.env文件填入你的DEEPSEEK_API_KEY"
    exit 1
fi

# 检查API Key是否设置
if [ -z "$DEEPSEEK_API_KEY" ]; then
    echo "❌ 未在.env文件中设置DEEPSEEK_API_KEY"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
cd backend
pip install -r requirements.txt -q

# 启动后端
echo "🔧 启动后端服务..."
python3 main.py &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端
echo "🎨 启动前端服务..."
cd ../frontend
python3 -m http.server 3000 &
FRONTEND_PID=$!

echo ""
echo "✅ 启动完成！"
echo "📱 前端: http://localhost:3000"
echo "🔧 后端: http://localhost:8000"
echo "📖 API文档: http://localhost:8000/docs"
echo ""
echo "按 Ctrl+C 停止服务"

# 等待退出
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
