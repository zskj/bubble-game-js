# 泡泡游戏项目 (bubble-game-js)

基于 Misskey 官方实现逻辑的纯 JavaScript 前端泡泡合成游戏。

## 游戏规则
1. **投掷**: 对准位置将 Emoji 投入盒子。
2. **合成**: 两个相同的 Emoji 相互接触后会合成一个更高级别的 Emoji，并获得分数。
3. **连击**: 快速连续合成可获得连击奖励。
4. **结束**: 如果 Emoji 从箱子溢出并触碰到上方区域，游戏结束。

## 快速开始 ⭐

**无需安装任何依赖，直接打开 `index.html` 即可游玩！**

只需双击 `index.html` 文件，或在浏览器中打开即可。

所有依赖（Matter.js 和 seedrandom）都通过 CDN 自动加载，无需 npm install。

## 开发者选项（可选）

如果你想使用开发服务器和构建工具，可以使用 npm 方式：

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
- **物理引擎**: [Matter.js](https://brm.io/matter-js/) (通过 CDN 加载)
- **随机数**: [seedrandom](https://github.com/davidbau/seedrandom) (通过 CDN 加载)
- **开发工具**: [Vite](https://vitejs.dev/) (可选)

## 项目结构
- `index.html`: 游戏主页面（可直接打开运行）
- `css/style.css`: 样式定义（响应式）
- `js/main.js`: 入口文件
- `js/game.js`: 核心游戏逻辑（物理、计分、状态管理）
- `js/renderer.js`: Canvas 渲染逻辑
- `js/input-handler.js`: 输入控制（鼠标、触摸、滑块）
- `js/monos.js`: Emoji 等级与配置定义

## 特性
- ✅ 零依赖安装，直接打开即玩
- ✅ 支持手机端触摸操作
- ✅ 响应式设计，适配各种屏幕
- ✅ 物理引擎驱动，真实的碰撞和重力效果
- ✅ 连击系统和分数记录

## 后期规划
- [ ] 增加更多主题（如 Misskey 官方的各种小动物）
- [ ] 增加本地最高分记录
- [ ] 对接后端数据库，实现全球排行榜
