#!/bin/bash

# ==================== ⚙️ 基础配置 (请修改) ====================
# 1. 设置端口 (必须与面板分配的端口一致)
LISTEN_PORT=10000 

# 2. 伪装域名 (可选，默认苹果)
SNI_DOMAIN="www.apple.com"
# ============================================================

# 1. 检查并下载 sing-box
if [ ! -f "./sing-box" ]; then
    echo "⬇️ Downloading sing-box..."
    # 下载兼容性最好的 AMD64 版本
    curl -L -o sing-box.tar.gz https://github.com/SagerNet/sing-box/releases/download/v1.8.0/sing-box-1.8.0-linux-amd64.tar.gz
    tar -xzf sing-box.tar.gz && mv sing-box-*/sing-box . && rm -rf sing-box-*
    chmod +x sing-box
fi

# 2. 自动生成配置 (如果不存在)
if [ ! -f "config.json" ]; then
    echo "🔄 Generating Config..."
    
    # 生成 UUID 和 Reality 密钥对
    UUID=$(cat /proc/sys/kernel/random/uuid)
    KEYS=$(./sing-box generate reality-keypair)
    PVT_KEY=$(echo "$KEYS" | grep "PrivateKey" | awk '{print $2}')
    PUB_KEY=$(echo "$KEYS" | grep "PublicKey" | awk '{print $2}')
    SHORT_ID=$(openssl rand -hex 4)
    
    # 写入 config.json
    cat > config.json <<EOF
{
  "log": { "level": "info", "timestamp": true },
  "inbounds": [{
      "type": "vless", "tag": "vless-in", "listen": "::", "listen_port": $LISTEN_PORT,
      "users": [{ "uuid": "$UUID", "flow": "xtls-rprx-vision" }],
      "tls": { 
        "enabled": true, "server_name": "$SNI_DOMAIN", 
        "reality": { "enabled": true, "handshake": { "server": "$SNI_DOMAIN", "server_port": 443 }, "private_key": "$PVT_KEY", "short_id": ["$SHORT_ID"] } 
      }
  }],
  "outbounds": [{ "type": "direct", "tag": "direct" }]
}
EOF
    # 获取本机公网 IP
    IP=$(curl -s4 ipv4.ip.sb || curl -s4 ifconfig.me)
    
    # 生成 VLESS 链接并保存到 link.txt (供 Bot 读取)
    echo "vless://$UUID@$IP:$LISTEN_PORT?encryption=none&flow=xtls-rprx-vision&security=reality&sni=$SNI_DOMAIN&fp=chrome&pbk=$PUB_KEY&sid=$SHORT_ID&type=tcp&headerType=none#My-Node" > link.txt
fi

# 3. 输出信息并启动
echo "🔗 链接已生成，请在 Telegram Bot 中点击 [连接信息] 获取。"
echo "🚀 Starting sing-box on port $LISTEN_PORT..."
./sing-box run -c config.json