(function () {
  const canvas = document.getElementById('dog-canvas') || document.getElementById('canvas');
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const layer = document.getElementById('dog-event');
  const pageAudio = document.getElementById('dog-audio');
  const currentScript = document.currentScript;
  const baseUrl = currentScript && currentScript.src
    ? new URL('./', currentScript.src)
    : new URL('./', window.location.href);
  const assetUrl = (path) => new URL(path, baseUrl).href;

  const bgm = pageAudio instanceof HTMLAudioElement ? pageAudio : new Audio(assetUrl('1dog.mp3'));
  bgm.preload = 'auto';

  const paths = {
    head: 'worm/head.png',
    jaw: 'worm/jaw.png',
    body: 'worm/body.png',
    tail: 'worm/tail.png',
    headGlow: 'worm/head_glow.png',
    jawGlow: 'worm/jaw_glow.png',
    bodyGlow: 'worm/body_glow.png',
    tailGlow: 'worm/tail_glow.png',
  };
  const tex = {};
  let assetsReady = false;

  const SEGMENTS = 10;
  const SPACING = 78;
  const ROT_SMOOTH = 0.15;
  const MAX_SPEED = 14;
  const ACCEL = 0.25;
  const DAMPING = 0.985;
  const TURN_SPEED = 0.045;
  const WARNING_DURATION = 7200;
  const EVENT_DURATION = 34000;
  const PASS_DISTANCE = 150;
  const EXIT_MARGIN = 1500;

  const HEAD_PX = 67;
  const HEAD_PY = 98;
  const BODY_PX = 57;
  const BODY_PY = 44;
  const TAIL_PX = 43;
  const TAIL_PY = 74;

  const STATE = {
    IDLE: 'IDLE',
    WARNING: 'WARNING',
    SPAWN: 'SPAWN',
    ATTACK: 'ATTACK',
    ESCAPE: 'ESCAPE',
  };

  class Segment {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.rotation = 0;
      this.type = type;
    }
  }

  const head = { x: -9999, y: -9999, rotation: 0, jawRotation: 0, active: false };
  const worm = Array.from(
    { length: SEGMENTS },
    (_, index) => new Segment(head.x, head.y, index === SEGMENTS - 1 ? 'tail' : 'body')
  );
  let currentState = STATE.IDLE;
  let stateTime = 0;
  let attackStartTime = 0;
  let spawnSide = '';
  let vx = 0;
  let vy = 0;
  let isOvershooting = false;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  function resize() {
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * scale);
    canvas.height = Math.floor(window.innerHeight * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }

  function load(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = assetUrl(src);
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }

  function wrapAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }

  function lerpAngle(from, to, amount) {
    return from + wrapAngle(to - from) * amount;
  }

  function resetWorm() {
    head.x = -9999;
    head.y = -9999;
    head.rotation = 0;
    head.jawRotation = 0;
    head.active = false;
    worm.forEach((segment) => {
      segment.x = head.x;
      segment.y = head.y;
      segment.rotation = 0;
    });
  }

  function finishEvent() {
    if (currentState === STATE.IDLE) return;
    resetWorm();
    currentState = STATE.IDLE;
    bgm.pause();
    bgm.currentTime = 0;
    layer?.classList.remove('is-active');
    layer?.setAttribute('aria-hidden', 'true');
    window.dispatchEvent(new CustomEvent('devourer:complete'));
  }

  function summonDevourer() {
    if (currentState !== STATE.IDLE) return;

    resetWorm();
    spawnSide = '';
    vx = 0;
    vy = 0;
    isOvershooting = false;
    currentState = STATE.WARNING;
    stateTime = performance.now();
    attackStartTime = stateTime;

    layer?.classList.add('is-active');
    layer?.setAttribute('aria-hidden', 'false');

    bgm.pause();
    bgm.currentTime = 0;
    bgm.play().catch(() => {
      // Browsers may block playback outside a trusted user interaction.
    });
  }

  function updateHead() {
    if (currentState === STATE.IDLE) return;

    const now = performance.now();
    const elapsed = now - stateTime;
    const totalElapsed = now - attackStartTime;

    if (currentState === STATE.WARNING) {
      if (elapsed >= WARNING_DURATION) {
        currentState = STATE.SPAWN;
      }
      return;
    }

    if (currentState === STATE.SPAWN) {
      if (!spawnSide) {
        const sides = ['LEFT', 'RIGHT', 'BOTTOM', 'TOP'];
        spawnSide = sides[Math.floor(Math.random() * sides.length)];
      }

      const margin = 1200;
      if (spawnSide === 'LEFT') {
        head.x = -margin;
        head.y = Math.random() * window.innerHeight;
        vx = MAX_SPEED;
        vy = 0;
      } else if (spawnSide === 'RIGHT') {
        head.x = window.innerWidth + margin;
        head.y = Math.random() * window.innerHeight;
        vx = -MAX_SPEED;
        vy = 0;
      } else if (spawnSide === 'BOTTOM') {
        head.x = Math.random() * window.innerWidth;
        head.y = window.innerHeight + margin;
        vx = 0;
        vy = -MAX_SPEED;
      } else {
        head.x = Math.random() * window.innerWidth;
        head.y = -margin;
        vx = 0;
        vy = MAX_SPEED;
      }

      isOvershooting = false;
      head.active = true;
      currentState = STATE.ATTACK;
      return;
    }

    if (currentState === STATE.ATTACK) {
      const dx = mouseX - head.x;
      const dy = mouseY - head.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      const dot = dx * vx + dy * vy;

      if (!isOvershooting) {
        const slither = Math.sin(now * 0.003) * 0.8;
        vx += (dx / distance) * ACCEL + (-vy / distance) * slither;
        vy += (dy / distance) * ACCEL + (vx / distance) * slither;

        if (distance < PASS_DISTANCE || (distance < 600 && dot < 0)) {
          isOvershooting = true;
        }
      } else {
        const speed = Math.sqrt(vx * vx + vy * vy) || 1;
        vx = (vx / speed) * MAX_SPEED;
        vy = (vy / speed) * MAX_SPEED;

        const offScreen =
          head.x < -EXIT_MARGIN ||
          head.x > window.innerWidth + EXIT_MARGIN ||
          head.y < -EXIT_MARGIN ||
          head.y > window.innerHeight + EXIT_MARGIN;

        if (offScreen) {
          if (head.x < -EXIT_MARGIN) spawnSide = 'LEFT';
          else if (head.x > window.innerWidth + EXIT_MARGIN) spawnSide = 'RIGHT';
          else if (head.y > window.innerHeight + EXIT_MARGIN) spawnSide = 'BOTTOM';
          else spawnSide = 'TOP';

          currentState = totalElapsed < EVENT_DURATION ? STATE.SPAWN : STATE.ESCAPE;
        }
      }

      vx *= DAMPING;
      vy *= DAMPING;
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > MAX_SPEED) {
        vx = (vx / speed) * MAX_SPEED;
        vy = (vy / speed) * MAX_SPEED;
      }
    }

    if (currentState === STATE.ESCAPE) {
      const escapeMargin = EXIT_MARGIN + 500;
      if (
        head.x > window.innerWidth + escapeMargin ||
        head.x < -escapeMargin ||
        head.y > window.innerHeight + escapeMargin ||
        head.y < -escapeMargin
      ) {
        finishEvent();
        return;
      }
    }

    head.x += vx;
    head.y += vy;
    const targetRotation = Math.atan2(vy, vx) + Math.PI / 2;
    head.rotation = lerpAngle(head.rotation, targetRotation, TURN_SPEED);
    head.jawRotation = Math.sin(now * 0.008) * 0.18;
  }

  function updateBody() {
    if (!head.active) return;
    for (let index = 0; index < worm.length; index += 1) {
      const parent = index === 0 ? head : worm[index - 1];
      const segment = worm[index];
      const angle = Math.atan2(parent.y - segment.y, parent.x - segment.x);
      segment.x = parent.x - Math.cos(angle) * SPACING;
      segment.y = parent.y - Math.sin(angle) * SPACING;
      segment.rotation = lerpAngle(segment.rotation, angle + Math.PI / 2, ROT_SMOOTH);
    }
  }

  function drawSprite(image, glow, x, y, rotation, pivotX, pivotY) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    ctx.rotate(rotation);
    ctx.drawImage(image, -pivotX, -pivotY);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.9;
    ctx.drawImage(glow, -pivotX, -pivotY);
    ctx.restore();
  }

  function drawBody() {
    for (let index = worm.length - 1; index >= 0; index -= 1) {
      const segment = worm[index];
      if (segment.type === 'tail') {
        drawSprite(tex.tail, tex.tailGlow, segment.x, segment.y, segment.rotation, TAIL_PX, TAIL_PY);
      } else {
        drawSprite(tex.body, tex.bodyGlow, segment.x, segment.y, segment.rotation, BODY_PX, BODY_PY);
      }
    }
  }

  function drawHead() {
    drawSprite(tex.head, tex.headGlow, head.x, head.y, head.rotation, HEAD_PX, HEAD_PY);
    const jawOffset = 12;

    ctx.save();
    ctx.translate(Math.floor(head.x), Math.floor(head.y));
    ctx.rotate(head.rotation - head.jawRotation);
    ctx.drawImage(tex.jaw, -HEAD_PX, -HEAD_PY + jawOffset);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.9;
    ctx.drawImage(tex.jawGlow, -HEAD_PX, -HEAD_PY + jawOffset);
    ctx.restore();

    ctx.save();
    ctx.translate(Math.floor(head.x), Math.floor(head.y));
    ctx.scale(-1, 1);
    ctx.rotate(-head.rotation - head.jawRotation);
    ctx.drawImage(tex.jaw, -HEAD_PX, -HEAD_PY + jawOffset);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.9;
    ctx.drawImage(tex.jawGlow, -HEAD_PX, -HEAD_PY + jawOffset);
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (currentState === STATE.WARNING) {
      const pulse = Math.sin((performance.now() - stateTime) * 0.01) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(156, 39, 255, ${pulse * 0.15})`;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      return;
    }
    if (!head.active || !assetsReady) return;

    const gradient = ctx.createRadialGradient(head.x, head.y, 40, head.x, head.y, 220);
    gradient.addColorStop(0, 'rgba(255, 0, 255, 0.22)');
    gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    drawBody();
    drawHead();
  }

  function animate() {
    updateHead();
    updateBody();
    draw();
    window.requestAnimationFrame(animate);
  }

  async function init() {
    resize();
    bgm.load();
    const entries = Object.entries(paths);
    const images = await Promise.all(entries.map(([, path]) => load(path)));
    entries.forEach(([key], index) => {
      tex[key] = images[index];
    });
    assetsReady = true;
    animate();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });
  window.addEventListener('devourer:summon', summonDevourer);
  window.addEventListener('devourer:skip', finishEvent);
  document.getElementById('trigger')?.addEventListener('click', summonDevourer);

  init().catch(() => {
    window.dispatchEvent(new CustomEvent('devourer:complete'));
  });
}());
