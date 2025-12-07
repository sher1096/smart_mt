#!/bin/bash
# 重启智慧医疗服务脚本

echo "停止所有node进程..."
pkill -f "node" 2>/dev/null
sleep 2

echo "安装patient前端依赖..."
cd ~/smart_mt_v2/patient
npm install

echo "启动后端服务..."
cd ~/smart_mt_v2/backend
nohup node dist/src/main.js > backend.log 2>&1 &
sleep 3

echo "启动admin前端..."
cd ~/smart_mt_v2/admin
nohup npm run dev > admin.log 2>&1 &
sleep 3

echo "启动patient前端..."
cd ~/smart_mt_v2/patient
nohup npm run dev > patient.log 2>&1 &
sleep 3

echo "服务启动完成！"
echo "后端API: http://172.245.184.206:3001/api"
echo "管理后台: http://172.245.184.206:5173"
echo "患者端: http://172.245.184.206:5174"

# 检查服务状态
echo ""
echo "检查服务状态..."
curl -s http://localhost:3001/api 2>/dev/null | head -5 || echo "后端未响应"
curl -s http://localhost:5173 2>/dev/null | head -3 || echo "admin前端未响应"
curl -s http://localhost:5174 2>/dev/null | head -3 || echo "patient前端未响应"
