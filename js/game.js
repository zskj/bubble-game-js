import Matter from 'matter-js';
import seedrandom from 'seedrandom';
import { NORMAL_MONOS } from './monos.js';

const GAME_VERSION = 3;
const GAME_WIDTH = 450;
const GAME_HEIGHT = 600;
const DROP_COOLTIME = 30;          // 帧
const PLAYAREA_MARGIN = 25;        // 边界距离
const COMBO_INTERVAL = 60;         // 帧
const STOCK_MAX = 4;
const TICK_DELTA = 1000 / 60;      // 16.67ms (60fps)

export class DropAndFusionGame extends EventTarget {
  frame = 0;
  engine;
  score = 0;
  combo = 0;
  stock = [];                  // [{ id, mono }, ...]
  holding = null;              // { id, mono } or null
  gameOver = false;
  latestDroppedAt = -DROP_COOLTIME;
  rng;
  monoDefinitions = NORMAL_MONOS;
  lastFusionAt = -COMBO_INTERVAL;

  constructor(options = {}) {
    super();
    this.rng = seedrandom(options.seed || Date.now().toString());
    
    this.engine = Matter.Engine.create({
      constraintIterations: 2 * 16,
      positionIterations: 6 * 16,
      velocityIterations: 4 * 16,
      gravity: { x: 0, y: 1 },
      timing: { timeScale: 2 },
      enableSleeping: false
    });

    this.initWorld();
  }

  initWorld() {
    const wallThickness = 100;
    const ground = Matter.Bodies.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT + wallThickness / 2,
      GAME_WIDTH + wallThickness * 2,
      wallThickness,
      { isStatic: true, label: 'ground' }
    );

    const leftWall = Matter.Bodies.rectangle(
      -wallThickness / 2 + PLAYAREA_MARGIN,
      GAME_HEIGHT / 2,
      wallThickness,
      GAME_HEIGHT * 2,
      { isStatic: true, label: 'wall' }
    );

    const rightWall = Matter.Bodies.rectangle(
      GAME_WIDTH + wallThickness / 2 - PLAYAREA_MARGIN,
      GAME_HEIGHT / 2,
      wallThickness,
      GAME_HEIGHT * 2,
      { isStatic: true, label: 'wall' }
    );

    Matter.Composite.add(this.engine.world, [ground, leftWall, rightWall]);
  }

  start() {
    for (let i = 0; i < STOCK_MAX; i++) {
      this.stock.push(this.getRandomMono());
    }
    this.dispatchEvent(new CustomEvent('changeStock', { detail: { stock: this.stock } }));

    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        this.handleCollision(pair);
      });
    });
  }

  getRandomMono() {
    const candidates = this.monoDefinitions.filter(m => m.dropCandidate);
    const mono = candidates[Math.floor(this.rng() * candidates.length)];
    return { id: Math.random().toString(36).substr(2, 9), mono };
  }

  handleCollision(pair) {
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;

    // Game over check: mark as touched ground if it hits ground or wall
    if (bodyA.label === 'mono' && (bodyB.label === 'ground' || bodyB.label === 'wall')) {
      bodyA.hasTouchedGround = true;
    } else if (bodyB.label === 'mono' && (bodyA.label === 'ground' || bodyA.label === 'wall')) {
      bodyB.hasTouchedGround = true;
    }

    // Also if it hits another mono that has touched ground
    if (bodyA.label === 'mono' && bodyB.label === 'mono') {
      if (bodyA.hasTouchedGround) bodyB.hasTouchedGround = true;
      if (bodyB.hasTouchedGround) bodyA.hasTouchedGround = true;

      const monoA = bodyA.monoData;
      const monoB = bodyB.monoData;

      if (monoA.level === monoB.level && monoA.level < this.monoDefinitions.length) {
        // Fusion
        const nextMonoDef = this.monoDefinitions.find(m => m.level === monoA.level + 1);
        if (nextMonoDef) {
          const newX = (bodyA.position.x + bodyB.position.x) / 2;
          const newY = (bodyA.position.y + bodyB.position.y) / 2;

          Matter.Composite.remove(this.engine.world, [bodyA, bodyB]);

          const newMono = this.createMonoBody(newX, newY, nextMonoDef);
          Matter.Composite.add(this.engine.world, newMono);

          this.updateScore(nextMonoDef.score);
          this.updateCombo();
          
          this.dispatchEvent(new CustomEvent('fusioned', { 
            detail: { x: newX, y: newY, nextMono: nextMonoDef, scoreDelta: nextMonoDef.score } 
          }));
          this.dispatchEvent(new CustomEvent('monoAdded', { detail: { mono: newMono } }));
        }
      }
    }
  }

  updateScore(delta) {
    this.score += delta;
    this.dispatchEvent(new CustomEvent('changeScore', { detail: { score: this.score } }));
  }

  updateCombo() {
    if (this.frame - this.lastFusionAt < COMBO_INTERVAL) {
      this.combo++;
    } else {
      this.combo = 1;
    }
    this.lastFusionAt = this.frame;
    this.dispatchEvent(new CustomEvent('changeCombo', { detail: { combo: this.combo } }));
  }

  tick() {
    if (this.gameOver) return false;

    this.frame++;
    Matter.Engine.update(this.engine, TICK_DELTA);

    // Combo timeout
    if (this.frame - this.lastFusionAt >= COMBO_INTERVAL && this.combo > 0) {
      this.combo = 0;
      this.dispatchEvent(new CustomEvent('changeCombo', { detail: { combo: this.combo } }));
    }

    // Game over detection
    const monos = this.getActiveMonos();
    for (const mono of monos) {
        if (mono.position.y < 50 && mono.hasTouchedGround) {
            this.gameOver = true;
            this.dispatchEvent(new CustomEvent('gameOver'));
            return false;
        }
    }

    return !this.gameOver;
  }

  drop(x) {
    if (this.frame - this.latestDroppedAt < DROP_COOLTIME) return;
    
    const constrainedX = Math.max(PLAYAREA_MARGIN + 20, Math.min(GAME_WIDTH - PLAYAREA_MARGIN - 20, x));
    const next = this.stock.shift();
    const body = this.createMonoBody(constrainedX, 50, next.mono);
    
    Matter.Composite.add(this.engine.world, body);
    this.latestDroppedAt = this.frame;

    this.stock.push(this.getRandomMono());
    this.dispatchEvent(new CustomEvent('changeStock', { detail: { stock: this.stock } }));
    this.dispatchEvent(new CustomEvent('dropped', { detail: { x: constrainedX } }));
    this.dispatchEvent(new CustomEvent('monoAdded', { detail: { mono: body } }));
  }

  hold() {
    if (this.holding === null) {
      this.holding = this.stock.shift();
      this.stock.push(this.getRandomMono());
    } else {
      const temp = this.holding;
      this.holding = this.stock[0];
      this.stock[0] = temp;
    }
    this.dispatchEvent(new CustomEvent('changeHolding', { detail: { holding: this.holding } }));
    this.dispatchEvent(new CustomEvent('changeStock', { detail: { stock: this.stock } }));
  }

  createMonoBody(x, y, monoDef) {
    const radius = monoDef.sizeX / 2;
    const body = Matter.Bodies.circle(x, y, radius, {
      restitution: 0.3,
      friction: 0.1,
      label: 'mono',
    });
    body.monoData = monoDef;
    body.hasTouchedGround = false;
    return body;
  }

  getActiveMonos() {
    return this.engine.world.bodies.filter(b => b.label === 'mono');
  }

  dispose() {
    Matter.World.clear(this.engine.world);
    Matter.Engine.clear(this.engine);
  }
}
