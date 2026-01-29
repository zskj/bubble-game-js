(function () {
  if (!window.Matter) {
    alert('依赖 Matter.js 未加载：请检查网络是否可用（本项目通过 CDN 加载依赖）。');
    return;
  }

  const DropAndFusionGame = window.DropAndFusionGame;
  const GameRenderer = window.GameRenderer;
  const InputHandler = window.InputHandler;
  const NORMAL_MONOS = window.NORMAL_MONOS;

  const canvas = document.getElementById('gameCanvas');
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('highScore');
  const nextDropDisplayEl = document.getElementById('nextDropDisplay');
  const gameOverModal = document.getElementById('gameOverModal');
  const finalScoreEl = document.getElementById('finalScore');
  const maxComboEl = document.getElementById('maxCombo');
  const chainDisplayEl = document.getElementById('chainDisplay');
  const fusionRecipeEl = document.getElementById('fusionRecipe');
  const aimingIndicatorEl = document.getElementById('aimingIndicator');
  const currentDropDisplayEl = document.getElementById('currentDropDisplay');
  const dropBtn = document.getElementById('dropBtn');
  const modalRestartBtn = document.getElementById('modalRestartBtn');
  const dropBtnIconEl = dropBtn ? dropBtn.querySelector('.btn-icon') : null;

  // Load high score from localStorage
  let highScore = parseInt(localStorage.getItem('bubbleGameHighScore') || '0');
  highScoreEl.textContent = highScore.toLocaleString();

  const game = new DropAndFusionGame({ seed: Date.now().toString() });
  const renderer = new GameRenderer(canvas);
  const inputHandler = new InputHandler(canvas, game);

  let maxCombo = 0;
  let lastChainUpdate = 0;

  // Initialize fusion recipe display
  function initFusionRecipe() {
    fusionRecipeEl.innerHTML = '';
    NORMAL_MONOS.forEach((mono, index) => {
      const item = document.createElement('div');
      item.className = 'recipe-item';

      // Create emoji image representation (we'll use span for emoji)
      const emojiSpan = document.createElement('span');
      emojiSpan.className = 'recipe-emoji';
      emojiSpan.style.fontSize = '28px';
      emojiSpan.style.display = 'inline-block';
      emojiSpan.style.width = '28px';
      emojiSpan.style.height = '28px';
      emojiSpan.style.lineHeight = '28px';
      emojiSpan.style.textAlign = 'center';
      emojiSpan.textContent = mono.emoji;

      item.appendChild(emojiSpan);

      // Add arrow for all but the last item
      if (index < NORMAL_MONOS.length - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'arrow';
        arrow.innerHTML = '<i class="ti ti-arrow-big-right"></i>';
        item.appendChild(arrow);
      }

      fusionRecipeEl.appendChild(item);
    });
  }

  initFusionRecipe();

  game.addEventListener('changeScore', (e) => {
    scoreEl.textContent = e.detail.score.toLocaleString();

    // Update high score
    if (e.detail.score > highScore) {
      highScore = e.detail.score;
      highScoreEl.textContent = highScore.toLocaleString();
      localStorage.setItem('bubbleGameHighScore', highScore.toString());
    }
  });

  game.addEventListener('changeCombo', (e) => {
    if (e.detail.combo > maxCombo) {
      maxCombo = e.detail.combo;
    }

    // Update chain display
    if (e.detail.combo > 0) {
      chainDisplayEl.textContent = `${e.detail.combo} Chain!`;
      chainDisplayEl.style.display = 'block';
      chainDisplayEl.style.animation = 'none';
      chainDisplayEl.offsetHeight; // Trigger reflow
      chainDisplayEl.style.animation = 'chainPop 0.3s ease-out';
      lastChainUpdate = Date.now();
    }
  });

  game.addEventListener('changeStock', (e) => {
    updateDropPreview(e.detail.stock);
    updateCurrentDropDisplay();
  });

  game.addEventListener('changeHolding', (e) => {
    updateHoldingPreview(e.detail.holding);
    updateCurrentDropDisplay();
  });

  game.addEventListener('gameOver', () => {
    finalScoreEl.textContent = game.score.toLocaleString();
    maxComboEl.textContent = maxCombo;
    gameOverModal.classList.remove('hidden');
  });

  function updateHoldingPreview(holding) {
    if (!dropBtnIconEl) return;
    dropBtnIconEl.textContent = holding?.mono?.emoji || '';
  }

  function updateDropPreview(stock) {
    if (!nextDropDisplayEl) return;

    nextDropDisplayEl.innerHTML = '';
    // 显示3个（包含当前要下落的 stock[0]）
    stock.slice(0, 3).forEach((item, index) => {
      const span = document.createElement('span');
      span.className = `next-drop-item${index === 0 ? ' is-current' : ''}`;
      span.textContent = item.mono.emoji;
      nextDropDisplayEl.appendChild(span);
    });
  }

  function updateCurrentDropDisplay() {
    if (!currentDropDisplayEl) return;

    const currentMono = game.getCurrentMono();
    if (currentMono) {
      currentDropDisplayEl.textContent = currentMono.mono.emoji;
    } else {
      currentDropDisplayEl.textContent = '';
    }
  }

  updateHoldingPreview(game.holding);
  updateCurrentDropDisplay();

  // 抓住按钮（Hold / Swap）
  dropBtn.addEventListener('click', () => {
    if (game.gameOver) return;

    // 如果有正在下落的物体，不执行抓住操作
    if (game.fallingMonoBody) return;

    // 如果暂存为空，把当前要下落的放到暂存，顺位下一个变成要下落的emoji
    if (game.holding === null) {
      game.holding = game.stock.shift(); // 把当前要下落的放到暂存
      game.addRandomMono(); // 重新生成一个
    } else {
      // 如果暂存里面有emoji，交换暂存和当前要下落的emoji
      const held = game.holding;
      const current = game.stock.shift(); // 获取当前要下落的

      game.holding = current; // 当前要下落的放到暂存
      game.stock.unshift(held); // 暂存的放到 stock 第一个位置
    }

    // 更新 UI
    updateHoldingPreview(game.holding);
    updateDropPreview(game.stock);
    updateCurrentDropDisplay();
  });


  // Restart button in modal
  modalRestartBtn.addEventListener('click', () => {
    gameOverModal.classList.add('hidden');
    game.dispose();

    // Reset max combo
    maxCombo = 0;

    // Create new game
    const newGame = new DropAndFusionGame({ seed: Date.now().toString() });

    // Copy all properties and event listeners
    Object.assign(game, newGame);

    // Re-attach event listeners
    game.start();

    // Hide chain display
    chainDisplayEl.style.display = 'none';
  });

  // Update aiming indicator position based on mouse/touch
  function updateAimingIndicator(x) {
    const canvasRect = canvas.getBoundingClientRect();
    const normalizedX = (x - canvasRect.left) / canvasRect.width;
    const clampedX = Math.max(0.1, Math.min(0.9, normalizedX));

    // Move the aiming indicator
    aimingIndicatorEl.style.left = `${clampedX * 100}%`;
  }

  // Listen for mouse/touch movement on canvas
  canvas.addEventListener('mousemove', (e) => {
    updateAimingIndicator(e.clientX);
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    updateAimingIndicator(touch.clientX);
  });

  // Click/tap to drop at position
  canvas.addEventListener('click', (e) => {
    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    game.drop(x);
  });

  // Hide chain display after 2 seconds
  setInterval(() => {
    if (Date.now() - lastChainUpdate > 2000 && chainDisplayEl.style.display !== 'none') {
      chainDisplayEl.style.display = 'none';
    }
  }, 500);

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
