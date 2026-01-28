(function () {
  if (!window.Matter) {
    alert('依赖 Matter.js 未加载：请检查网络是否可用（本项目通过 CDN 加载依赖）。');
    return;
  }

  const DropAndFusionGame = window.DropAndFusionGame;
  const GameRenderer = window.GameRenderer;
  const InputHandler = window.InputHandler;

  const canvas = document.getElementById('gameCanvas');
  const scoreEl = document.getElementById('score');
  const comboEl = document.getElementById('combo');
  const stockDisplayEl = document.getElementById('stockDisplay');
  const gameOverModal = document.getElementById('gameOverModal');
  const finalScoreEl = document.getElementById('finalScore');
  const maxComboEl = document.getElementById('maxCombo');

  const game = new DropAndFusionGame({ seed: Date.now().toString() });
  const renderer = new GameRenderer(canvas);
  new InputHandler(canvas, game);

  let maxCombo = 0;

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
    stock.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'stock-item';
      div.textContent = item.mono.emoji;
      stockDisplayEl.appendChild(div);
    });
  }

  function gameLoop() {
    if (game.tick()) {
      renderer.render(game.engine);
      requestAnimationFrame(gameLoop);
    } else {
      renderer.render(game.engine);
    }
  }

  game.start();
  gameLoop();
})();
