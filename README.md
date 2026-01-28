# 泡泡游戏项目 (bubble-game-js)

基于 Misskey 官方实现逻辑的纯 JavaScript 前端泡泡合成游戏。

## 游戏规则
1. **投掷**: 对准位置将 Emoji 投入盒子。
2. **合成**: 两个相同的 Emoji 相互接触后会合成一个更高级别的 Emoji，并获得分数。
3. **连击**: 快速连续合成可获得连击奖励。
4. **结束**: 如果 Emoji 从箱子溢出并触碰到上方区域，游戏结束。

## 快速开始
1. 安装依赖:
   ```bash
   npm install
   ```
2. 启动开发服务器:
   ```bash
   npm run dev
   ```
3. 构建项目:
   ```bash
   npm run build
   ```

## 技术栈
- **物理引擎**: [Matter.js](https://brm.io/matter-js/)
- **开发工具**: [Vite](https://vitejs.dev/)
- **随机数**: [seedrandom](https://github.com/davidbau/seedrandom)

## 项目结构
- `index.html`: 游戏主页面
- `css/style.css`: 样式定义（响应式）
- `js/main.js`: 入口文件
- `js/game.js`: 核心游戏逻辑（物理、计分、状态管理）
- `js/renderer.js`: Canvas 渲染逻辑
- `js/input-handler.js`: 输入控制（鼠标、触摸、滑块）
- `js/monos.js`: Emoji 等级与配置定义

## 后期规划
- [ ] 增加更多主题（如 Misskey 官方的各种小动物）
- [ ] 增加本地最高分记录
- [ ] 对接后端数据库，实现全球排行榜
