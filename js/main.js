import { NORMAL_MONOS } from './monos.js';
import { DropAndFusionGame } from './game.js';
import { GameRenderer } from './renderer.js';
import { InputHandler } from './input-handler.js';

// 初始化
const canvas = document.getElementById('gameCanvas');
const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const stockDisplayEl = document.getElementById('stockDisplay');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreEl = document.getElementById('finalScore');
const maxComboEl = document.getElementById('maxCombo');

const game = new DropAndFusionGame({ seed: Date.now().toString() });
const renderer = new GameRenderer(canvas);
const inputHandler = new InputHandler(canvas, game);

let maxCombo = 0;

// 事件绑定
game.addEventListener('changeScore', (e) => {
  scoreEl.textContent = e.detail.score;
});

game.addEventListener('changeCombo', (e) => {
  comboEl.textContent = e.detail.combo;
  if (e.detail.combo > maxCombo) {
    maxCombo = e.detail.combo;
  }
});

game.addEventListener('changeStock', (e) => {
  updateStockDisplay(e.detail.stock);
});

game.addEventListener('gameOver', () => {
  finalScoreEl.textContent = game.score;
  maxComboEl.textContent = maxCombo;
  gameOverModal.classList.remove('hidden');
});

function updateStockDisplay(stock) {
  stockDisplayEl.innerHTML = '';
  stock.forEach(item => {
    const div = document.createElement('div');
    div.className = 'stock-item';
    div.textContent = item.mono.emoji;
    stockDisplayEl.appendChild(div);
  });
}

// 游戏循环
function gameLoop() {
  if (game.tick()) {
    renderer.render(game.engine, game.monoDefinitions);
    requestAnimationFrame(gameLoop);
  } else {
    // Game over is handled by event
    renderer.render(game.engine, game.monoDefinitions);
  }
}

// 启动
game.start();
gameLoop();
