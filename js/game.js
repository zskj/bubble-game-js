(function (root) {
  const Matter = root.Matter;
  const seedrandom = root.seedrandom;
  const NORMAL_MONOS = root.NORMAL_MONOS;

  const GAME_WIDTH = 450;
  const GAME_HEIGHT = 600;
  const DROP_COOLTIME = 30;
  const PLAYAREA_MARGIN = 25;
  const COMBO_INTERVAL = 60;
  const STOCK_MAX = 4;
  const TICK_DELTA = 1000 / 60;

  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return h >>> 0;
    };
  }

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function createRng(seed) {
    const seedValue = seed !== undefined && seed !== null ? seed : Date.now();
    const seedStr = String(seedValue);

    if (typeof seedrandom === 'function') {
      return seedrandom(seedStr);
    }

    if (typeof Math.seedrandom === 'function') {
      try {
        return Math.seedrandom(seedStr, { global: false });
      } catch (e) {
        return Math.seedrandom(seedStr);
      }
    }

    const seedFn = xmur3(seedStr);
    return mulberry32(seedFn());
  }

  class DropAndFusionGame extends EventTarget {
    constructor(options = {}) {
      super();

      if (!Matter) {
        throw new Error('Matter.js 未加载：请确保 index.html 能访问到 CDN 依赖。');
      }
      if (!NORMAL_MONOS) {
        throw new Error('NORMAL_MONOS 未加载：请确保 js/monos.js 已正确引入。');
      }

      this.frame = 0;
      this.engine = null;
      this.score = 0;
      this.combo = 0;
      this.stock = [];
      this.holding = null;
      this.gameOver = false;
      this.latestDroppedAt = -DROP_COOLTIME;
      this.rng = createRng(options.seed || Date.now().toString());
      this.monoDefinitions = NORMAL_MONOS;
      this.lastFusionAt = -COMBO_INTERVAL;

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
      this.dispatchEvent(
        new CustomEvent('changeStock', { detail: { stock: this.stock } })
      );

      Matter.Events.on(this.engine, 'collisionStart', (event) => {
        event.pairs.forEach((pair) => {
          this.handleCollision(pair);
        });
      });
    }

    getRandomMono() {
      const candidates = this.monoDefinitions.filter((m) => m.dropCandidate);
      const mono = candidates[Math.floor(this.rng() * candidates.length)];
      return { id: Math.random().toString(36).substr(2, 9), mono: mono };
    }

    handleCollision(pair) {
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;

      if (
        bodyA.label === 'mono' &&
        (bodyB.label === 'ground' || bodyB.label === 'wall')
      ) {
        bodyA.hasTouchedGround = true;
      } else if (
        bodyB.label === 'mono' &&
        (bodyA.label === 'ground' || bodyA.label === 'wall')
      ) {
        bodyB.hasTouchedGround = true;
      }

      if (bodyA.label === 'mono' && bodyB.label === 'mono') {
        if (bodyA.hasTouchedGround) bodyB.hasTouchedGround = true;
        if (bodyB.hasTouchedGround) bodyA.hasTouchedGround = true;

        const monoA = bodyA.monoData;
        const monoB = bodyB.monoData;

        if (
          monoA.level === monoB.level &&
          monoA.level < this.monoDefinitions.length
        ) {
          const nextMonoDef = this.monoDefinitions.find(
            (m) => m.level === monoA.level + 1
          );
          if (!nextMonoDef) return;

          const newX = (bodyA.position.x + bodyB.position.x) / 2;
          const newY = (bodyA.position.y + bodyB.position.y) / 2;

          Matter.Composite.remove(this.engine.world, bodyA);
          Matter.Composite.remove(this.engine.world, bodyB);

          const newMono = this.createMonoBody(newX, newY, nextMonoDef);
          Matter.Composite.add(this.engine.world, newMono);

          this.updateScore(nextMonoDef.score);
          this.updateCombo();

          this.dispatchEvent(
            new CustomEvent('fusioned', {
              detail: {
                x: newX,
                y: newY,
                nextMono: nextMonoDef,
                scoreDelta: nextMonoDef.score
              }
            })
          );
          this.dispatchEvent(
            new CustomEvent('monoAdded', { detail: { mono: newMono } })
          );
        }
      }
    }

    updateScore(delta) {
      this.score += delta;
      this.dispatchEvent(
        new CustomEvent('changeScore', { detail: { score: this.score } })
      );
    }

    updateCombo() {
      if (this.frame - this.lastFusionAt < COMBO_INTERVAL) {
        this.combo++;
      } else {
        this.combo = 1;
      }
      this.lastFusionAt = this.frame;
      this.dispatchEvent(
        new CustomEvent('changeCombo', { detail: { combo: this.combo } })
      );
    }

    tick() {
      if (this.gameOver) return false;

      this.frame++;
      Matter.Engine.update(this.engine, TICK_DELTA);

      if (this.frame - this.lastFusionAt >= COMBO_INTERVAL && this.combo > 0) {
        this.combo = 0;
        this.dispatchEvent(
          new CustomEvent('changeCombo', { detail: { combo: this.combo } })
        );
      }

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

      const constrainedX = Math.max(
        PLAYAREA_MARGIN + 20,
        Math.min(GAME_WIDTH - PLAYAREA_MARGIN - 20, x)
      );

      const next = this.stock.shift();
      const body = this.createMonoBody(constrainedX, 50, next.mono);

      Matter.Composite.add(this.engine.world, body);
      this.latestDroppedAt = this.frame;

      this.stock.push(this.getRandomMono());
      this.dispatchEvent(
        new CustomEvent('changeStock', { detail: { stock: this.stock } })
      );
      this.dispatchEvent(
        new CustomEvent('dropped', { detail: { x: constrainedX } })
      );
      this.dispatchEvent(
        new CustomEvent('monoAdded', { detail: { mono: body } })
      );
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
      this.dispatchEvent(
        new CustomEvent('changeHolding', { detail: { holding: this.holding } })
      );
      this.dispatchEvent(
        new CustomEvent('changeStock', { detail: { stock: this.stock } })
      );
    }

    createMonoBody(x, y, monoDef) {
      const radius = monoDef.sizeX / 2;
      const body = Matter.Bodies.circle(x, y, radius, {
        restitution: 0.3,
        friction: 0.1,
        label: 'mono'
      });
      body.monoData = monoDef;
      body.hasTouchedGround = false;
      return body;
    }

    getActiveMonos() {
      return this.engine.world.bodies.filter((b) => b.label === 'mono');
    }

    dispose() {
      Matter.World.clear(this.engine.world);
      Matter.Engine.clear(this.engine);
    }
  }

  root.DropAndFusionGame = DropAndFusionGame;
})(typeof window !== 'undefined' ? window : globalThis);
