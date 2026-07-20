# Fox-Codebase

**狐狸的代码基地** 🦊

---

## 🔫 西部对决

西部主题轮盘赌双人对战游戏，支持 **本地 / 人机 / 联机** 三种模式。

### 🎮 在线游玩

👉 **[https://hulixiaobai001-sudo.github.io/Fox-Codebase/](https://hulixiaobai001-sudo.github.io/Fox-Codebase/)**

### 🤠 联机模式

通过 WebSocket 服务器中继，任何网络环境下都能连：

- 创建/加入房间（可选密码）
- 随机匹配
- 房间列表浏览
- 全局大厅聊天
- 局内聊天（游戏中对喷）
- 30 秒回合计时
- 再来一局

### 🖥️ 联机服务器

代码在 `server/` 目录下，部署在 Railway 免费套餐：

```
server/index.js      — WebSocket 中继服务器 (~200行)
server/package.json  — 依赖
```

服务器功能：

- 房间管理（创建 / 加入 / 密码 / 离开）
- 消息中继（转发游戏指令）
- 防作弊（回合校验）
- 随机匹配队列
- 全局聊天广播
- 自定义规则投票

> 可用任何 Node.js 环境自行部署。

---

## 📁 其他内容

- **`Fox-SlotMachine.html`** — 抽卡机
- **`computer.html`** — 网页实验
- **`achieve.js` / `save.js` / `sfx.js` / `plus.js`** — 游戏附属脚本

---

## 📜 许可

GPL-3.0 · 附加协议: [Additional License.md](./Additional%20License.md) (BQ-CNfurry1.0)

> 本项目附有福瑞社区开源附加协议，补充了关于社区文化保护、使用限制等条款。
> 详见仓库中的 `Additional License.txt` 文件。
