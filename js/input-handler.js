export class InputHandler {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;

    this.initEvents();
  }

  initEvents() {
    const { canvas, game } = this;

    // Canvas click
    canvas.addEventListener('click', (e) => {
      if (game.gameOver) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const x = (e.clientX - rect.left) * scaleX;
      game.drop(x);
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
      if (game.gameOver) return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const x = (touch.clientX - rect.left) * scaleX;
      game.drop(x);
    }, { passive: false });

    // Slider
    const xSlider = document.getElementById('xSlider');
    const xValueDisplay = document.getElementById('xValue');
    if (xSlider) {
      xSlider.addEventListener('input', (e) => {
        if (xValueDisplay) xValueDisplay.textContent = e.target.value;
      });
    }

    // Buttons
    const dropBtn = document.getElementById('dropBtn');
    if (dropBtn) {
      dropBtn.addEventListener('click', () => {
        if (game.gameOver) return;
        const x = parseFloat(xSlider.value);
        game.drop(x);
      });
    }

    const holdBtn = document.getElementById('holdBtn');
    if (holdBtn) {
      holdBtn.addEventListener('click', () => {
        if (game.gameOver) return;
        game.hold();
      });
    }

    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        location.reload(); // Simple restart for now
      });
    }

    const modalRestartBtn = document.getElementById('modalRestartBtn');
    if (modalRestartBtn) {
      modalRestartBtn.addEventListener('click', () => {
        location.reload();
      });
    }
  }
}
