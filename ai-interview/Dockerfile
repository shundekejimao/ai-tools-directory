FROM python:3.11-slim

WORKDIR /app

# 安装依赖
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY backend/ ./backend/

# 复制前端文件
COPY frontend/ ./frontend/

WORKDIR /app/backend

# 暴露HF Spaces端口
EXPOSE 7860

# 启动命令 - 使用7860端口
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
