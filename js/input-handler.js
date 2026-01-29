(function (root) {
  class InputHandler {
    constructor(canvas, game) {
      this.canvas = canvas;
      this.game = game;

      this.initEvents();
    }

    initEvents() {
      const canvas = this.canvas;
      const game = this.game;

      // Click event for desktop
      canvas.addEventListener('click', (e) => {
        if (game.gameOver) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const x = (e.clientX - rect.left) * scaleX;
        game.drop(x);
      });

      // Touch events for mobile
      canvas.addEventListener(
        'touchstart',
        (e) => {
          if (game.gameOver) return;
          e.preventDefault();
          e.stopPropagation();
          
          const touch = e.touches[0];
          if (!touch) return;
          
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const x = (touch.clientX - rect.left) * scaleX;
          game.drop(x);
        },
        { passive: false }
      );

      canvas.addEventListener(
        'touchmove',
        (e) => {
          if (game.gameOver) return;
          e.preventDefault();
          e.stopPropagation();
          
          const touch = e.touches[0];
          if (!touch) return;
          
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const x = (touch.clientX - rect.left) * scaleX;
          
          // Update aiming indicator position on touch move
          const canvasRect = canvas.getBoundingClientRect();
          const normalizedX = (x) / canvasRect.width;
          const clampedX = Math.max(0.1, Math.min(0.9, normalizedX));
          
          const aimingIndicatorEl = document.getElementById('aimingIndicator');
          if (aimingIndicatorEl) {
            aimingIndicatorEl.style.left = `${clampedX * 100}%`;
          }
        },
        { passive: false }
      );

      // Mouse move for desktop aiming
      canvas.addEventListener('mousemove', (e) => {
        if (game.gameOver) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const normalizedX = x / rect.width;
        const clampedX = Math.max(0.1, Math.min(0.9, normalizedX));
        
        const aimingIndicatorEl = document.getElementById('aimingIndicator');
        if (aimingIndicatorEl) {
          aimingIndicatorEl.style.left = `${clampedX * 100}%`;
        }
      });

      const dropBtn = document.getElementById('dropBtn');
      if (dropBtn) {
        // Handle both click and touch for the drop button
        dropBtn.addEventListener('click', (e) => {
          if (game.gameOver) return;
          e.preventDefault();
          game.hold();
        });

        dropBtn.addEventListener(
          'touchstart',
          (e) => {
            if (game.gameOver) return;
            e.preventDefault();
            e.stopPropagation();
            game.hold();
          },
          { passive: false }
        );
      }

      const restartBtn = document.getElementById('restartBtn');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          location.reload();
        });
      }

      const modalRestartBtn = document.getElementById('modalRestartBtn');
      if (modalRestartBtn) {
        modalRestartBtn.addEventListener('click', () => {
          location.reload();
        });

        modalRestartBtn.addEventListener(
          'touchstart',
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            location.reload();
          },
          { passive: false }
        );
      }
    }
  }

  root.InputHandler = InputHandler;
})(typeof window !== 'undefined' ? window : globalThis);
