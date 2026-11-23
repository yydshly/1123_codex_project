(() => {
  const get = (root, id) => root.querySelector('#' + id);
  const localLink = (label, url) => `<a href="${url}" target="_blank" rel="noopener">${label} ↗</a>`;

  function scanScene(root, { duration, startHeight, heightTravel, smooth }) {
    const slider = get(root, 'scene-scan-time');
    const readout = get(root, 'scene-scan-readout');
    const play = get(root, 'scene-scan-play');
    const presets = [[t => t, 'linear'], [smooth, 'smooth']];
    let frame = 0;

    function render(time) {
      readout.textContent = `已过 ${(time * duration).toFixed(2)} 秒 · 全程 ${duration} 秒`;
      for (const [calculate, key] of presets) {
        const height = startHeight + heightTravel * calculate(time);
        const model = get(root, 'scene-model-' + key);
        const cut = Math.max(0, Math.min(100, (610 - 490 * height) / 640 * 100));
        model.style.setProperty('--scan-cut', `${cut}%`);
        model.dataset.phase = time === 0 ? 'start' : time === 1 ? 'end' : 'scanning';
        get(root, 'scene-height-' + key).textContent = `扫描线高度 ${(height * 100).toFixed(1)}%`;
      }
    }

    slider.addEventListener('input', () => {
      cancelAnimationFrame(frame);
      render(slider.valueAsNumber);
    });
    play.addEventListener('click', () => {
      cancelAnimationFrame(frame);
      const started = performance.now();
      slider.value = '0';
      render(0);
      function tick(now) {
        if (!root.isConnected) return;
        const time = Math.min((now - started) / (duration * 1000), 1);
        slider.value = String(time);
        render(time);
        if (time < 1) frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    });
    render(slider.valueAsNumber);
  }

  function cargoScene(root) {
    const outcomes = [];
    const bonus = get(root, 'scene-combo-tier');
    const reward = (streak, tier) => 100 + Math.min(streak - 1, 4) * tier;
    const ladder = get(root, 'scene-combo-ladder');
    ladder.innerHTML = Array.from({ length: 6 }, (_, index) => `
      <li><div class="combo-bar-pair"><span class="combo-current"></span><span class="combo-trial"></span></div>
        <span>${index + 1}</span></li>`).join('');

    function render() {
      const tier = bonus.valueAsNumber;
      let streak = 0;
      let current = 0;
      let trial = 0;
      for (const correct of outcomes) {
        if (correct) {
          streak++;
          current += reward(streak, 25);
          trial += reward(streak, tier);
        } else {
          streak = 0;
          current = Math.max(0, current - 50);
          trial = Math.max(0, trial - 50);
        }
      }
      get(root, 'scene-combo-bonus').textContent = `+${tier} 分`;
      get(root, 'scene-combo-streak').textContent = String(streak);
      get(root, 'scene-combo-current').textContent = String(current);
      get(root, 'scene-combo-trial').textContent = String(trial);
      get(root, 'scene-combo-next').textContent =
        `下一件分对，现用加 ${reward(streak + 1, 25)} 分，试验加 ${reward(streak + 1, tier)} 分。`;
      get(root, 'scene-combo-history').textContent = outcomes.length
        ? `共 ${outcomes.length} 件，最近 ${outcomes.slice(-8).map(correct => correct ? '✓' : '×').join('  ')}`
        : '从空局开始，点下面按钮记录分拣结果。';
      Array.from(ladder.children).forEach((item, index) => {
        const combo = index + 1;
        const currentPoints = reward(combo, 25);
        const trialPoints = reward(combo, tier);
        item.setAttribute('aria-label', `连对 ${combo} 件时，本件现用 ${currentPoints} 分，试验 ${trialPoints} 分`);
        item.querySelector('.combo-current').style.height = `${currentPoints / 3}%`;
        item.querySelector('.combo-trial').style.height = `${trialPoints / 3}%`;
      });
    }

    bonus.addEventListener('input', render);
    get(root, 'scene-combo-hit').addEventListener('click', () => { outcomes.push(true); render(); });
    get(root, 'scene-combo-miss').addEventListener('click', () => { outcomes.push(false); render(); });
    get(root, 'scene-combo-reset').addEventListener('click', () => { outcomes.length = 0; render(); });
    render();
  }

  function wakeScene(root) {
    const wind = get(root, 'scene-wake-wind');
    const age = get(root, 'scene-wake-age');
    const canvas = get(root, 'scene-wake-graph');
    const ctx = canvas.getContext('2d');
    const lifetime = 6.5;
    const speed = 12;
    const maxLateral = Number(wind.max) * lifetime;
    const xAt = seconds => 58 + 552 * seconds / lifetime;
    const yAt = metres => 144 - 108 * metres / maxLateral;

    function line(x1, y1, x2, y2, color, weight) {
      ctx.strokeStyle = color;
      ctx.lineWidth = weight;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    function render() {
      const w = wind.valueAsNumber;
      const t = age.valueAsNumber;
      const lateral = w * t;
      ctx.fillStyle = '#132c2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '16px "Microsoft YaHei UI", system-ui, sans-serif';
      ctx.fillStyle = '#d1e6df';
      ctx.fillText('横向偏移（m）', 11, 22);
      for (const pos of [-40, -20, 0, 20, 40]) {
        line(58, yAt(pos), 610, yAt(pos), pos === 0 ? '#789b90' : '#2d4f4d', 1);
        ctx.fillText(String(pos), 16, yAt(pos) + 4);
      }
      for (const metres of [0, 20, 40, 60, 78]) {
        const x = xAt(metres / speed);
        line(x, 36, x, 252, '#2d4f4d', 1);
        ctx.fillText(String(metres), x - 8, 275);
      }
      ctx.textAlign = 'right';
      ctx.fillText('距飞行者身后（m）', 613, 301);
      ctx.textAlign = 'start';
      for (let step = 0; step < lifetime * 10; step++) {
        const a = step / 10;
        const b = (step + 1) / 10;
        const fade = Math.min(1, (lifetime - a) / 1.5);
        line(xAt(a), yAt(w * a), xAt(b), yAt(w * b), `rgba(145, 232, 190, ${fade})`, 4);
      }
      ctx.fillStyle = '#ffd48f';
      ctx.beginPath();
      ctx.arc(xAt(t), yAt(lateral), 6, 0, Math.PI * 2);
      ctx.fill();
      get(root, 'scene-wake-wind-value').textContent = `${w} m/s`;
      get(root, 'scene-wake-age-value').textContent = `${t.toFixed(1)} 秒`;
      const description = `${t.toFixed(1)} 秒前留下的尾迹在身后 ${(speed * t).toFixed(1)} 米，横向偏移 ${lateral.toFixed(1)} 米。`;
      get(root, 'scene-wake-readout').textContent = description;
      canvas.setAttribute('aria-label', `尾迹俯视图。${description}`);
    }

    wind.addEventListener('input', render);
    age.addEventListener('input', render);
    render();
  }

  window.renderMathScenes = (root, scan) => {
    const characterFrame = (key, label) => `
      <figure class="math-model">
        <div class="math-model-window" id="scene-model-${key}" aria-hidden="true">
          <div class="math-model-out"><img alt="" src="${window.vesperImageUrl}"></div>
          <div class="math-model-in"><img alt="" src="assets/desmos-brine-reference.png"></div>
          <span class="math-model-line"></span>
        </div>
        <figcaption><strong>${label}</strong><span id="scene-height-${key}"></span></figcaption>
      </figure>`;
    root.innerHTML = `
      <article class="math-scene" aria-labelledby="scene-motion-title">
        <h3 id="scene-motion-title">角色动画 · 哪种节奏更早露出 Brine？</h3>
        <p>深潜档案的切换总长 ${scan.duration} 秒。两侧用同一时刻和同一高度映射，分别显示匀速和项目现用曲线。</p>
        <div class="math-scene-layout">
          <div class="math-model-pair">${characterFrame('linear', '匀速方案')}${characterFrame('smooth', '项目现用平滑')}</div>
          <div class="math-scene-controls">
            <label class="field">时间进度<input id="scene-scan-time" type="range" min="0" max="1" step=".01" value=".25"></label>
            <p id="scene-scan-readout" class="readout" aria-live="polite"></p>
            <button id="scene-scan-play" class="button secondary" type="button">播放 ${scan.duration} 秒</button>
            <p>绿线上方是 Vesper，下方是 Brine。拖到第 0.27 秒和第 0.81 秒，比较哪边的绿线更高。高度以模型脚底为 0%，顶部为 100%。</p>
          </div>
        </div>
        <p class="math-scene-application"><strong>用在项目里</strong> 先挑节奏，再回三维展台检查材质、网格和切换中断。 ${localLink('查看实际扫描截图', 'assets/desmos-character-scan.png')}</p>
      </article>

      <article class="math-scene" aria-labelledby="scene-combo-title">
        <h3 id="scene-combo-title">游戏规则 · 连击奖励为什么会拉开分差？</h3>
        <p>Cargo Switch 的 45 秒回合采用每件基础 100 分，连对每级加 25 分，第 5 件封顶。分错扣 50 分并清空连击，总分最低为 0。</p>
        <div class="math-scene-layout">
          <div class="math-combo-chart">
            <p>连对第几件 · 本件得分</p>
            <div class="math-combo-plot">
              <div class="math-combo-axis" aria-hidden="true"><span>300</span><span>200</span><span>100</span><span>0</span></div>
              <ol id="scene-combo-ladder" aria-label="每一级连击的现用得分和试验得分"></ol>
            </div>
            <div class="math-combo-legend"><span><i class="combo-current"></i>现用规则</span><span><i class="combo-trial"></i>试验规则</span></div>
          </div>
          <div class="math-scene-controls">
            <label class="field">试验每级连击奖励 <output id="scene-combo-bonus"></output><input id="scene-combo-tier" type="range" min="0" max="50" step="5" value="50"></label>
            <dl class="math-combo-stats" aria-live="polite">
              <div><dt>连续分对</dt><dd id="scene-combo-streak"></dd></div>
              <div><dt>现用总分</dt><dd id="scene-combo-current"></dd></div>
              <div><dt>试验总分</dt><dd id="scene-combo-trial"></dd></div>
            </dl>
            <p id="scene-combo-next" class="readout"></p>
            <p id="scene-combo-history" class="math-combo-history"></p>
            <div class="action-row">
              <button class="button primary" id="scene-combo-hit" type="button">分对一件</button>
              <button class="button secondary" id="scene-combo-miss" type="button">分错一件</button>
              <button class="button secondary" id="scene-combo-reset" type="button">清空记录</button>
            </div>
          </div>
        </div>
        <p class="math-scene-application"><strong>用在项目里</strong> 两条规则使用同一串分拣结果。先看差多少分，再通过试玩观察玩家是否注意连击、是否主动重开。 ${localLink('试玩 Cargo Switch', '../ai-overseas-revenue/02-browser-game/index.html')}</p>
      </article>

      <article class="math-scene" aria-labelledby="scene-wake-title">
        <h3 id="scene-wake-title">物理效果 · 横风会把尾迹吹偏多远？</h3>
        <p>Petalwake 研究里的尾迹会随风漂移。这里沿用源代码的 6.5 秒寿命，用恒定飞行速度 12 m/s 和恒定横风做一张简化的俯视图。</p>
        <div class="math-scene-layout">
          <canvas class="math-wake-graph" id="scene-wake-graph" width="640" height="312" role="img" aria-label="尾迹俯视图"></canvas>
          <div class="math-scene-controls">
            <label class="field">横风速度 <output id="scene-wake-wind-value"></output><input id="scene-wake-wind" type="range" min="-8" max="8" step="1" value="3"></label>
            <label class="field">追踪多久前的尾迹 <output id="scene-wake-age-value"></output><input id="scene-wake-age" type="range" min="0" max="6.5" step=".1" value="4"></label>
            <p id="scene-wake-readout" class="readout" aria-live="polite"></p>
            <p>橙点代表选中的那一段尾迹，偏移距离 = 横风速度 × 经过时间。把横风调到 0、3、−3，看看尾迹往哪边偏。</p>
          </div>
        </div>
        <p class="math-scene-application"><strong>用在项目里</strong> 给飞行花瓣、海岸扬尘或雾效先定偏移和消散范围，再接入具体粒子效果。这里试算恒定横风下的位移。 ${localLink('查看研究用的尾迹源码', '../petalwake/src/fx/vortex.js')}</p>
      </article>`;
    scanScene(root, scan);
    cargoScene(root);
    wakeScene(root);
  };
})();
