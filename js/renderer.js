export class GameRenderer {
  canvas;
  ctx;

  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
  }

  render(engine, monoDefs) {
    const { ctx, canvas } = this;

    // Clear canvas
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bodies = engine.world.bodies;

    for (const body of bodies) {
      if (body.label === 'mono') {
        this.drawMono(body);
      } else if (body.isStatic) {
        // Optionally draw walls for debugging
        // this.drawStatic(body);
      }
    }
    
    // Draw overflow line
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(canvas.width, 50);
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawMono(body) {
    const { ctx } = this;
    const { x, y } = body.position;
    const { monoData } = body;
    const radius = monoData.sizeX / 2;
    const emoji = monoData.emoji;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(body.angle);

    // Draw circle
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Emoji
    const fontSize = radius * 1.2;
    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';
    ctx.fillText(emoji, 0, 0);

    ctx.restore();
  }

  drawStatic(body) {
      const { ctx } = this;
      const vertices = body.vertices;
      ctx.beginPath();
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let i = 1; i < vertices.length; i++) {
          ctx.lineTo(vertices[i].x, vertices[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = '#ddd';
      ctx.fill();
  }
}
