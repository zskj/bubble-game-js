(function (root) {
  class GameRenderer {
    constructor(canvasElement) {
      this.canvas = canvasElement;
      this.ctx = this.canvas.getContext('2d');
    }

    render(engine) {
      const ctx = this.ctx;
      const canvas = this.canvas;

      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const bodies = engine.world.bodies;

      for (const body of bodies) {
        if (body.label === 'mono') {
          this.drawMono(body);
        }
      }

      ctx.beginPath();
      ctx.moveTo(0, 50);
      ctx.lineTo(canvas.width, 50);
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    drawMono(body) {
      const ctx = this.ctx;
      const x = body.position.x;
      const y = body.position.y;
      const monoData = body.monoData;
      const radius = monoData.sizeX / 2;
      const emoji = monoData.emoji;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(body.angle);

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 2;
      ctx.stroke();

      const fontSize = radius * 1.2;
      ctx.font = `${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000000';
      ctx.fillText(emoji, 0, 0);

      ctx.restore();
    }
  }

  root.GameRenderer = GameRenderer;
})(typeof window !== 'undefined' ? window : globalThis);
