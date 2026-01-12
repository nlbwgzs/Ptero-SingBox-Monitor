# 🌌 Ptero-SingBox-Monitor (PSM)

> **在 Pterodactyl 容器中运行 Sing-box (Reality) + 交互式 Telegram 监控机器人**
> *Turn your idle Pterodactyl node into a high-performance proxy & smart monitor.*

![Version](https://img.shields.io/badge/version-2.0.0-blue?style=flat-square)
![Node](https://img.shields.io/badge/Node.js-Zero%20Dependency-green?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-orange?style=flat-square)

---

## ✨ 核心特性 (Features)

PSM 是一个专为受限环境（如 300MB 内存的免费容器）设计的**双核**解决方案。它不依赖任何第三方 NPM 包，极致轻量。

* 🚀 **零依赖 (Zero-Deps)**：无需 `npm install`，直接利用 Node.js 原生模块运行，内存占用极低（~30MB）。
* 📱 **交互式面板 (Interactive UI)**：内置 Telegram 交互键盘，告别枯燥的命令行，手机点一点即可管理。
* ⚡ **一键扫码 (QR Connect)**：直接在 TG 中生成二维码图片，手机扫码即连。
* 🛡️ **Reality 协议**：自动配置 VLESS + Reality + Vision + uTLS，高抗封锁，自动伪装大厂官网。
* 🔄 **智能保活**：支持 `/restart` 远程重启指令，并在进程崩溃时自动报警。

---

## 📸 效果预览 (Screenshots)

| **状态监控** | **连接面板** |
| :---: | :---: |
| *实时查看内存、运行时间* | *获取 VLESS 链接与二维码* |
| `📊 状态监控` | `🔗 连接信息` |

---

## 🛠️ 快速部署 (Deployment)

### 1. 准备环境
你需要一个支持 Node.js 的 Pterodactyl 面板（如 Serv00, CT8, KataBump 等）。
> **推荐主机**: [KataBump (免费高性能容器)](https://dashboard.katabump.com/auth/login#527057) 👈 *使用此链接注册可获额外支持*

### 2. 获取 Telegram Token
1.  在 Telegram 搜索 `@BotFather`，发送 `/newbot` 创建机器人，获取 **Token**。
2.  搜索 `@userinfobot`，获取你的 **Telegram ID** (数字)，用于鉴权。

### 3. 上传代码
在面板的文件管理器中，创建以下两个文件：
1.  index.js（将我的文件上传到服务器，记得修改参数）
2.  entrypoint.sh（将我的文件上传到服务器，记得修改参数）

### 4. 启动与管理
1. 修改配置：确保 index.js 中的 Token 和 entrypoint.sh 中的端口已修改。
2. 启动：在面板点击 Start 或 Restart。
3. 使用：打开 Telegram Bot，你应该会看到底部弹出的控制面板。
   
### ⚠️ 免责声明 (Disclaimer)
本项目仅供技术研究与学习使用，请勿用于非法用途。使用本项目产生的任何后果由使用者自行承担。

Created with ❤️ by NLBW Nebula Network.
