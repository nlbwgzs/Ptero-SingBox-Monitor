const { spawn } = require('child_process');
const https = require('https');
const os = require('os');
const fs = require('fs');

// ==================== ⚙️ 用户配置区域 (请修改这里) ====================
// 1. 给你的节点起个名字 (例如: "香港-节点1")
const NODE_NAME = "我的免费节点"; 

// 2. 填入你的 Telegram Bot Token (找 @BotFather 获取)
const BOT_TOKEN = "在此填入_YOUR_BOT_TOKEN";

// 3. 填入你的 TG ID (找 @userinfobot 获取)，防止陌生人控制
const ADMIN_IDS = [12345678]; 
// =================================================================

console.log(`🚀 [${NODE_NAME}] 启动: 交互式面板监控模式...`);

// ---------------------- 1. 启动 Sing-box ----------------------
const child = spawn('bash', ['entrypoint.sh'], { stdio: 'inherit' });

child.on('error', (err) => {
    console.error('❌ 启动失败:', err);
    broadcastMsg(`⚠️ 警告: ${NODE_NAME} 启动失败!`);
});

child.on('exit', (code) => {
    console.log(`进程退出，代码: ${code}`);
    broadcastMsg(`⚠️ 警告: ${NODE_NAME} 已退出 (Code: ${code})，正在重启...`);
    process.exit(code);
});

// ---------------------- 2. 交互式 Bot 逻辑 ----------------------
let lastUpdateId = 0;

// 定义键盘布局
const MAIN_MENU = {
    keyboard: [
        [{ text: "📊 状态监控" }, { text: "🔗 连接信息" }],
        [{ text: "♻️ 远程重启" }, { text: "🆔 ID/帮助" }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
};

function broadcastMsg(text) {
    ADMIN_IDS.forEach(id => sendMsg(id, text));
}

function sendMsg(chatId, text, replyMarkup = null) {
    const body = { chat_id: chatId, text: text, parse_mode: 'Markdown' };
    if (replyMarkup) body.reply_markup = replyMarkup;

    const req = https.request({
        hostname: 'api.telegram.org', path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    });
    req.on('error', (e) => console.error(`Bot Error: ${e.message}`));
    req.write(JSON.stringify(body));
    req.end();
}

function sendQR(chatId, link) {
    sendMsg(chatId, `🔍 正在生成二维码...`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(link)}`;
    const path = `/bot${BOT_TOKEN}/sendPhoto?chat_id=${chatId}&photo=${encodeURIComponent(qrUrl)}&caption=${encodeURIComponent(NODE_NAME + " 扫码即连 🚀")}`;
    
    https.get({ hostname: 'api.telegram.org', path: path }, () => {
        setTimeout(() => sendMsg(chatId, `🔗 **链接文本:**\n\`${link}\``, MAIN_MENU), 500);
    });
}

function getStatus() {
    const uptime = os.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const memTotal = (os.totalmem() / 1024 / 1024).toFixed(0);
    const memFree = (os.freemem() / 1024 / 1024).toFixed(0);
    return `*📊 面板状态: ${NODE_NAME}*\n⏱️ 运行: ${days}天 ${hours}小时\n🧠 内存: ${(memTotal-memFree)}/${memTotal}MB\n✅ 状态: 在线`;
}

function getVlessLink() {
    try {
        if (fs.existsSync('link.txt')) return fs.readFileSync('link.txt', 'utf8').trim();
        return null;
    } catch (e) { return null; }
}

function pollUpdates() {
    https.get(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            try {
                const data = JSON.parse(body);
                if (data.ok && data.result.length > 0) {
                    data.result.forEach(u => {
                        lastUpdateId = u.update_id;
                        if (u.message && u.message.text && ADMIN_IDS.includes(u.message.chat.id)) {
                            handleCommand(u.message);
                        }
                    });
                }
            } catch (e) {}
            setTimeout(pollUpdates, 2000);
        });
    }).on('error', () => setTimeout(pollUpdates, 5000));
}

function handleCommand(msg) {
    const text = msg.text.trim();
    const chatId = msg.chat.id;

    if (text === '/status' || text === '📊 状态监控') {
        sendMsg(chatId, getStatus(), MAIN_MENU);
    } 
    else if (text === '/qr' || text === '/link' || text === '🔗 连接信息') {
        const link = getVlessLink();
        if (link) sendQR(chatId, link);
        else sendMsg(chatId, "⚠️ 链接文件未生成，请稍后。", MAIN_MENU);
    } 
    else if (text === '/restart' || text === '♻️ 远程重启') {
        sendMsg(chatId, `♻️ 正在重启 ${NODE_NAME}...`, MAIN_MENU);
        setTimeout(() => process.exit(1), 1000);
    } 
    else if (text === '/menu' || text === '/start') {
        sendMsg(chatId, `👋 欢迎使用 PSM 控制台`, MAIN_MENU);
    }
    else if (text === '/id' || text === '🆔 ID/帮助') {
        sendMsg(chatId, `您的 ID: \`${chatId}\`\n版本: PSM v2.0`, MAIN_MENU);
    }
}

broadcastMsg(`🚀 *${NODE_NAME}* 已就绪! 面板已加载。`);
pollUpdates();