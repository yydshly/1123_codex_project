(() => {
  const get = (root, id) => root.querySelector('#' + id);
  const optionList = entries => entries.map(([label], index) => `<option value="${index}">${label}</option>`).join('');
  const sourceLink = (name, url) => `<a href="${url}" target="_blank" rel="noopener">${name} ↗</a>`;

  function saveFile(filename, url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
  }

  function download(filename, blob) {
    const url = URL.createObjectURL(blob);
    saveFile(filename, url);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function notebooklm(root) {
    const documents = [
      ['即梦官方视频说明', '已有角色图可用于图生视频。官方建议先描述简单动作，预览后再调整。', 'https://jimeng.jianying.com/tools/ai-video-generator'],
      ['Photopea 文件文档', 'PSD 用于保留可编辑结构，导出的 PNG 适合用作下游参考输入。', 'https://www.photopea.com/learn/opening-saving'],
      ['项目验收示例', '转身镜头逐项检查头盔轮廓、双联气瓶数量和阀轮位置。本条为项目拟定的验收条件。'],
    ];
    const questions = [
      ['已有角色图，怎样准备一次可复核的试镜？', [
        '将角色图作为图生视频输入，先选一个短时间内能完成的明确动作。',
        '保留分层 PSD 源稿，导出 PNG 作为镜头参考，便于回头检查修图。',
        '把头盔、双联气瓶和阀轮列入验收项，记录发生变化的画面。',
      ]],
      ['哪些内容应存成可编辑文件？', [
        '视频说明提供参考图用法，素材源文件的保存方式需要图像编辑资料支持。',
        '保存 PSD 供后续编辑，PNG 用作生成或交付时的图片输入。',
        null,
      ]],
      ['这些资料能证明生成结果一定保持角色一致吗？', [
        '这份文档能确认参考图用法。具体镜头的稳定性需要用我们的角色测试。',
        null,
        '验收示例给出检查点。保存实际样片后才能判断是否通过。',
      ]],
    ];
    root.innerHTML = `
      <label class="field">选择问题<select id="notebook-question">${optionList(questions)}</select></label>
      <div class="demo-columns">
        <fieldset class="control-box"><legend>参与回答的资料</legend>
          ${documents.map(([name], index) => `<label class="check-label"><input type="checkbox" value="${index}" checked> ${name}</label>`).join('')}
        </fieldset>
        <div class="result-box"><h3>回答与证据</h3><div id="notebook-result" aria-live="polite"></div></div>
      </div>`;
    const question = get(root, 'notebook-question');
    const result = get(root, 'notebook-result');
    const inputs = [...root.querySelectorAll('input')];
    function update() {
      const answers = questions[question.value][1];
      const evidence = inputs.filter(input => input.checked && answers[input.value]);
      result.innerHTML = evidence.length ? evidence.map(input => {
        const index = Number(input.value);
        const [name, summary, url] = documents[index];
        return `<p>${answers[index]}</p><details><summary><span>[${index + 1}]</span> ${name}</summary><p>${summary}</p>${url ? sourceLink('查看原文', url) : ''}</details>`;
      }).join('') : '<p>当前所选资料里缺少相关证据。选回相关来源，再查看回答。</p>';
    }
    root.addEventListener('change', update);
    update();
  }

  function perplexity(root) {
    const subtitle = window.toolDeepDives.perplexity.searchCase;
    const examples = [
      ['即梦图生视频可以从哪些素材起步？', '已有角色图时，可以从图片生成视频。是否能指定两个端点画面，需查所选模型的参考方式。', [
        ['即梦官方 · 视频生成器', '确认文字和图片都能作为视频生成输入。时长等参数以当前模型为准。', 'https://jimeng.jianying.com/tools/ai-video-generator'],
        ['即梦官方 · 短剧画布', '说明素材与镜头节点，其中包括部分首尾帧和参考视频工作方式。', 'https://jimeng.jianying.com/tutorials/drama-studio/canvas'],
        ['项目线索 · 角色能否稳定转身', '保留气瓶和阀轮需要同一角色多次测试。当前为待验证假设。'],
      ]],
      ['Photopea 可以把工作交给脚本吗？', '可以。先用官方脚本文档确认图层和文档的操作，再用保存文档确认源文件和交付格式。', [
        ['Photopea 官方 · Scripts', '可在应用中执行 JavaScript，对图层和文档进行操作，也可通过 API 执行脚本。', 'https://www.photopea.com/learn/scripts'],
        ['Photopea 官方 · Open and Save', '可以用 PSD 保留编辑结构，并导出 PNG 等格式。', 'https://www.photopea.com/learn/opening-saving'],
        ['项目线索 · 能否节约批处理时间', '用相同图片测量手工与脚本的耗时，并核对文件像素尺寸。'],
      ]],
      [subtitle.label, subtitle.answer, subtitle.sources],
    ];
    root.innerHTML = `
      <label class="field">查源问题<select id="search-example">${optionList(examples)}</select></label>
      <details id="search-plan" class="result-box search-plan">
        <summary>问题如何拆开</summary>
        <p>${subtitle.query}</p>
        <ol>${subtitle.plan.map(([title, description]) => `<li><strong>${title}</strong><p>${description}</p></li>`).join('')}</ol>
      </details>
      <label class="check-label filter"><input id="official-only" type="checkbox"> 只看官方资料</label>
      <div class="result-box search-answer"><h3>带出处的回答</h3><p id="search-answer" aria-live="polite"></p></div>
      <div id="search-result" class="search-result" aria-live="polite"></div>
      <section id="search-audit" class="result-box search-audit" aria-labelledby="search-audit-title">
        <h4 id="search-audit-title">逐条核查引用</h4>
        ${subtitle.audit.map(([claim, status, review, index]) => {
          const [name, , url] = subtitle.sources[index];
          return `<details><summary>${claim}</summary>
            <p><strong class="audit-status" data-status="${status}">${status}</strong> ${review}</p>
            ${sourceLink(name, url)}
          </details>`;
        }).join('')}
        <p class="search-note">${subtitle.caseNote}</p>
        <p>${sourceLink('查看本地 SRT 实测记录', '../ai-overseas-revenue/01-independent-website/RESULTS.md')}</p>
      </section>`;
    const question = get(root, 'search-example');
    const officialOnly = get(root, 'official-only');
    const result = get(root, 'search-result');
    const subtitleIndex = examples.length - 1;
    function update() {
      const [, answer, allSources] = examples[question.value];
      const showSubtitleCase = Number(question.value) === subtitleIndex;
      get(root, 'search-plan').hidden = !showSubtitleCase;
      get(root, 'search-audit').hidden = !showSubtitleCase;
      get(root, 'search-answer').textContent = answer;
      const sources = allSources.filter(([, , url]) => !officialOnly.checked || url);
      result.innerHTML = sources.map(([name, detail, url], index) => `
        <article class="result-box search-card"><span class="result-index">${index + 1}</span>
          <div><h3>${url ? sourceLink(name, url) : name}</h3><p>${detail}</p></div>
        </article>`).join('');
    }
    root.addEventListener('change', update);
    question.value = String(subtitleIndex);
    update();
  }

  const mastered = new Set();
  function khan(root) {
    const exercises = [
      ['渠道点击率', '渠道 A 有 20 次点击和 1,000 次展示，渠道 B 有 4 次点击和 100 次展示。两者合并的点击率是多少？输入百分号前的数字，四舍五入到小数点后两位。', '先加总点击次数和展示次数，再用总点击除以总展示。', 2.18, '24 ÷ 1,100 × 100% ≈ 2.18%。两个渠道的展示量不同。'],
      ['渠道点击率 · 换数复测', '渠道 A 仍是 20 次点击和 1,000 次展示，渠道 B 仍有 4 次点击，展示改为 200 次。两者合并的点击率是多少？输入百分号前的数字。', '点击总数没变。先确定现在的展示总数，再计算百分比。', 2, '24 ÷ 1,200 × 100% = 2%。保留原来的分子，重算总展示量作为分母。'],
      ['增长率', '收入从 80 万元变为 100 万元，增长率是多少？输入百分号前的数字。', '以前一期的 80 万作分母。', 25, '增长量 ÷ 原数值 × 100% = (100 − 80) ÷ 80 × 100% = 25%。'],
      ['概率', '10 条试镜里有 4 条通过。随机抽 1 条，抽到通过样片的百分比是多少？', '用通过数除以总数，然后换算成百分比。', 40, '通过数 ÷ 总数 × 100% = 4 ÷ 10 × 100% = 40%。'],
      ['像素坐标', '宽度为 540 的画布上，x = 135 对应的 0–1 归一化坐标是多少？', '用当前像素坐标除以画布宽度。', 0.25, '135 ÷ 540 = 0.25。两者单位相同，结果没有单位。'],
    ];
    root.innerHTML = `
      <div class="practice-head"><label class="field">练习主题<select id="exercise">${optionList(exercises)}</select></label>
        <div class="progress"><label for="mastery">本地练习进度 <strong id="mastery-label"></strong></label><progress id="mastery" max="${exercises.length}"></progress></div></div>
      <form id="practice-form" class="result-box">
        <p id="practice-question"></p>
        <div class="inline-controls"><label class="field">你的答案<input id="practice-answer" type="number" step="any" required autocomplete="off"></label>
          <button type="submit" class="button primary">检查答案</button><button id="practice-hint" class="button secondary" type="button">看提示</button></div>
        <p id="practice-result" class="feedback" aria-live="polite"></p>
      </form>`;
    const exercise = get(root, 'exercise');
    const answer = get(root, 'practice-answer');
    const feedback = get(root, 'practice-result');
    function progress() {
      get(root, 'mastery').value = mastered.size;
      get(root, 'mastery-label').textContent = `${mastered.size} / ${exercises.length}`;
    }
    function reset() {
      get(root, 'practice-question').textContent = exercises[exercise.value][1];
      answer.value = '';
      feedback.textContent = '';
      progress();
    }
    exercise.addEventListener('change', reset);
    get(root, 'practice-hint').addEventListener('click', () => {
      feedback.textContent = exercises[exercise.value][2];
    });
    get(root, 'practice-form').addEventListener('submit', event => {
      event.preventDefault();
      const [, , hint, expected, explanation] = exercises[exercise.value];
      if (Math.abs(answer.valueAsNumber - expected) < 0.000001) {
        mastered.add(Number(exercise.value));
        feedback.textContent = '答对了。' + explanation;
        progress();
      } else {
        feedback.textContent = '再试一次。' + hint;
      }
    });
    reset();
  }

  function deepl(root) {
    const { sample } = window.toolDeepDives.deepl.translationGuide;
    const examples = [
      ['SaaS 字幕', sample.original, sample.raw, sample.revised, sample.terms, sample.cues],
      ['视频文档', 'Use the first frame as a reference. Apply easing to the camera push-in.',
        '使用第一帧作为参照。对相机推进应用平滑处理。',
        '使用首帧作为参考。为镜头推近应用缓动。',
        [['first frame', '首帧'], ['easing', '缓动'], ['camera push-in', '镜头推近']]],
      ['三维资产', 'Check the rig and export a turnaround with a neutral pose.',
        '检查装置，并导出一个采用中立姿势的周转图。',
        '检查骨骼绑定，并导出采用中性姿态的角色转面图。',
        [['rig', '骨骼绑定'], ['turnaround', '角色转面图'], ['neutral pose', '中性姿态']]],
    ];
    root.innerHTML = `
      <div class="inline-controls demo-toolbar">
        <label class="field">翻译场景<select id="translation-example">${optionList(examples)}</select></label>
        <label class="check-label filter"><input id="translation-glossary" type="checkbox"> 查看项目校对版</label>
      </div>
      <div class="demo-columns translation">
        <div class="result-box"><h3>英文原句</h3><p id="translation-source" lang="en"></p></div>
        <div class="result-box"><h3 id="translation-label">示例译文</h3><p id="translation-output" aria-live="polite"></p></div>
      </div>
      <div class="demo-footer"><div id="glossary-terms" class="tag-list"></div>
        <button id="download-glossary" class="button secondary" type="button">下载术语 CSV ↓</button></div>
      <div id="subtitle-preview" class="result-box shot-card" hidden>
        <h3>本地字幕预览 · 保留原时间码</h3><pre id="subtitle-text"></pre>
        <button id="download-subtitle" class="button primary" type="button">下载字幕样片 SRT ↓</button>
      </div>`;
    const example = get(root, 'translation-example');
    const glossary = get(root, 'translation-glossary');
    const subtitlePreview = get(root, 'subtitle-preview');
    const subtitleText = get(root, 'subtitle-text');
    function update() {
      const [, original, base, preferred, terms, cues] = examples[example.value];
      const originalLabel = cues ? 'DeepL 网页实测译文' : '基础示例译文';
      get(root, 'translation-source').textContent = original;
      get(root, 'translation-label').textContent = glossary.checked ? '项目校对后的译文' : originalLabel;
      get(root, 'translation-output').textContent = glossary.checked ? preferred : base;
      get(root, 'glossary-terms').innerHTML = terms.map(([term, value]) => `<span>${term} · ${value}</span>`).join('');
      subtitlePreview.hidden = !cues;
      subtitleText.textContent = cues?.map(([start, end, basic, applied], index) =>
        `${index + 1}\n${start} --> ${end}\n${glossary.checked ? applied : basic}`).join('\n\n') ?? '';
    }
    root.addEventListener('change', update);
    get(root, 'download-glossary').addEventListener('click', () => {
      const csv = examples[example.value][4].map(pair => pair.join(',')).join('\r\n') + '\r\n';
      download('glossary-en-zh.csv', new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    });
    get(root, 'download-subtitle').addEventListener('click', () => {
      const content = subtitleText.textContent.replace(/\n/g, '\r\n') + '\r\n';
      download('saas-subtitle-sample.zh-CN.srt', new Blob([content], { type: 'application/x-subrip;charset=utf-8' }));
    });
    update();
  }

  function photopea(root) {
    const { crops } = window.toolDeepDives.photopea.referenceGuide;
    root.innerHTML = `
      <div class="demo-columns image-workbench">
        <div class="media-stage"><canvas id="photo-canvas" width="540" height="700" role="img" aria-label="Vesper 设定图编辑预览"></canvas></div>
        <div class="image-controls">
          <label class="field">裁切范围<select id="photo-crop">${optionList(crops)}</select></label>
          <label class="field">亮度 <output id="photo-light-label"></output><input id="photo-light" type="range" min="70" max="145" value="100"></label>
          <label class="check-label"><input id="photo-annotation" type="checkbox"> 添加参考图标注</label>
          <p id="photo-dimensions" class="readout" aria-live="polite">素材载入中</p>
          <div class="action-row"><button id="photo-download" class="button primary" type="button" disabled>导出 PNG ↓</button>
            <button id="photo-recipe" class="button secondary" type="button" disabled>保存裁切参数 ↓</button>
            <button id="photo-reset" class="button secondary" type="button">复位</button></div>
          <p id="photo-status" class="feedback" aria-live="polite"></p>
        </div>
      </div>`;
    const canvas = get(root, 'photo-canvas');
    const context = canvas.getContext('2d');
    const crop = get(root, 'photo-crop');
    const brightness = get(root, 'photo-light');
    const annotation = get(root, 'photo-annotation');
    const exportButton = get(root, 'photo-download');
    const recipeButton = get(root, 'photo-recipe');
    const status = get(root, 'photo-status');
    const image = new Image();
    function render() {
      get(root, 'photo-light-label').textContent = `${brightness.value}%`;
      if (!image.naturalWidth) return;
      const [, x, y, width, height] = crops[crop.value];
      canvas.width = width;
      canvas.height = height;
      context.filter = `brightness(${brightness.value}%)`;
      context.drawImage(image, x, y, width, height, 0, 0, width, height);
      context.filter = 'none';
      if (annotation.checked) {
        context.fillStyle = '#24204a';
        context.fillRect(8, height - 37, Math.min(width - 16, 126), 29);
        context.font = 'bold 12px system-ui, sans-serif';
        context.fillStyle = '#ffffff';
        context.fillText('VESPER 参考', 15, height - 17);
      }
      get(root, 'photo-dimensions').textContent = `${width} × ${height} px`;
      exportButton.disabled = false;
      recipeButton.disabled = false;
    }
    root.addEventListener('input', render);
    get(root, 'photo-reset').addEventListener('click', () => {
      crop.value = '0';
      brightness.value = '100';
      annotation.checked = false;
      status.textContent = '';
      render();
    });
    exportButton.addEventListener('click', () => {
      const filename = `vesper-${crops[crop.value][5]}.png`;
      saveFile(filename, canvas.toDataURL('image/png'));
      status.textContent = `已导出 ${filename}`;
    });
    recipeButton.addEventListener('click', () => {
      const [preset, x, y, width, height, slug] = crops[crop.value];
      const recipe = {
        source: { filename: 'vesper-reference.png', width: image.naturalWidth, height: image.naturalHeight },
        preset, crop: { x, y, width, height }, brightnessPercent: Number(brightness.value),
        annotation: annotation.checked ? 'VESPER 参考' : '',
        output: `vesper-${slug}.png`,
      };
      download(`vesper-${slug}-crop.json`, new Blob([JSON.stringify(recipe, null, 2) + '\n'], { type: 'application/json' }));
    });
    image.addEventListener('load', render);
    image.addEventListener('error', () => {
      get(root, 'photo-dimensions').textContent = '参考图未能载入';
    });
    image.src = window.vesperImageUrl;
    render();
  }

  function desmos(root) {
    const { duration, startHeight, heightTravel, smooth } = window.toolDeepDives.desmos.scanGuide;
    root.innerHTML = `
      <div class="demo-columns curve-workbench">
        <div class="graph-stage"><canvas id="curve-graph" width="640" height="360" role="img" aria-label="数学曲线图"></canvas></div>
        <div class="curve-controls">
          <label class="field">试验公式<select id="curve-mode"><option value="easing">角色扫描节奏</option><option value="parabola">抛物线</option></select></label>
          <label class="field"><span id="curve-input-label">时间进度 t</span><input id="curve-input" type="range" min="0" max="1" step="0.01" value="0.25"></label>
          <p id="curve-result" class="readout" aria-live="polite"></p>
          <ul id="curve-legend" class="curve-legend"></ul>
        </div>
      </div>
      <div id="scan-positions" class="result-box scan-positions" hidden>
        <h4>同一时刻走过的路程</h4><dl id="scan-tracks"></dl>
        <p class="scan-height-note">扫描线高度以模型脚底为 0%、顶部为 100%。负值表示扫描线还在脚底以下。</p>
      </div>`;
    const mode = get(root, 'curve-mode');
    const input = get(root, 'curve-input');
    const canvas = get(root, 'curve-graph');
    const context = canvas.getContext('2d');
    const linear = t => t;
    const quadratic = t => t * t;
    function render() {
      const isParabola = mode.value === 'parabola';
      const parameter = Number(input.value);
      const curves = isParabola
        ? [['y = a × x²', '#5145cf', x => parameter * x * x]]
        : [['线性  t', '#5145cf', linear], ['平方缓入  t²', '#08796c', quadratic], ['平滑插值  3t² − 2t³', '#a45a22', smooth]];
      const xMin = isParabola ? -2 : 0;
      const xMax = isParabola ? 2 : 1;
      const yMin = isParabola ? -8 : 0;
      const yMax = isParabola ? 8 : 1;
      const xAt = x => 54 + (x - xMin) * 548 / (xMax - xMin);
      const yAt = y => 310 - (y - yMin) * 274 / (yMax - yMin);
      const line = (x1, y1, x2, y2, color, width = 1) => {
        context.strokeStyle = color;
        context.lineWidth = width;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
      };
      context.fillStyle = '#fafafa';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = '17px system-ui, sans-serif';
      for (let index = 0; index <= 4; index++) {
        const x = xMin + (xMax - xMin) * index / 4;
        const y = yMin + (yMax - yMin) * index / 4;
        line(xAt(x), 36, xAt(x), 310, x === 0 ? '#a9a5bd' : '#e0dfe9');
        line(54, yAt(y), 602, yAt(y), y === 0 ? '#a9a5bd' : '#e0dfe9');
        context.fillStyle = '#5b5871';
        context.fillText(String(x), xAt(x) - 8, 339);
        context.fillText(String(y), 13, yAt(y) + 5);
      }
      if (!isParabola) line(xAt(parameter), 36, xAt(parameter), 310, '#a9a5bd', 2);
      for (const [, color, calculate] of curves) {
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 4;
        for (let index = 0; index <= 160; index++) {
          const x = xMin + (xMax - xMin) * index / 160;
          const method = index === 0 ? 'moveTo' : 'lineTo';
          context[method](xAt(x), yAt(calculate(x)));
        }
        context.stroke();
        if (!isParabola) {
          context.beginPath();
          context.fillStyle = color;
          context.arc(xAt(parameter), yAt(calculate(parameter)), 6, 0, Math.PI * 2);
          context.fill();
        }
      }
      get(root, 'curve-result').textContent = isParabola
        ? `a = ${parameter.toFixed(2)} · ${parameter < 0 ? '开口向下' : parameter === 0 ? '水平直线' : '开口向上'}`
        : `t = ${parameter.toFixed(2)} · 已过 ${(duration * parameter).toFixed(2)} 秒 / ${duration.toFixed(2)} 秒`;
      if (!isParabola) {
        context.fillStyle = '#5b5871';
        context.fillText('扫描路程', 54, 24);
        context.textAlign = 'right';
        context.fillText('时间进度 t', 602, 356);
        context.textAlign = 'start';
      }
      get(root, 'curve-legend').innerHTML = curves.map(([label, color]) =>
        `<li><span style="--legend-color:${color}"></span>${label}</li>`).join('');
      get(root, 'scan-positions').hidden = isParabola;
      get(root, 'scan-tracks').innerHTML = isParabola ? '' : curves.map(([label, color, calculate]) => {
        const distance = calculate(parameter);
        const percent = distance * 100;
        const height = (startHeight + heightTravel * distance) * 100;
        return `<div><dt>${label}</dt><dd><span class="scan-track" aria-hidden="true"><i style="--scan-position:${percent}%;--legend-color:${color}"></i></span><output>${Number(percent.toFixed(3))}%</output><span class="scan-model-height">扫描线高度 ${height.toFixed(2)}%</span></dd></div>`;
      }).join('');
      canvas.setAttribute('aria-label', `${isParabola ? '抛物线' : '扫描路程随时间变化的三条曲线'}，${get(root, 'curve-result').textContent}`);
    }
    mode.addEventListener('change', () => {
      const isParabola = mode.value === 'parabola';
      input.min = isParabola ? '-2' : '0';
      input.max = isParabola ? '2' : '1';
      input.step = isParabola ? '0.05' : '0.01';
      input.value = isParabola ? '1' : '0.25';
      get(root, 'curve-input-label').textContent = isParabola ? '系数 a' : '时间进度 t';
      render();
    });
    input.addEventListener('input', render);
    render();
  }

  function jimeng(root) {
    const shots = [
      ['低幅度推镜', '人物保持站姿，摄影机缓慢推近头盔，控制轻微空间变化。', '正面或四分之三参考图', '头盔、面罩轮廓稳定，推镜连续。', 1.14],
      ['转身对照', 'Vesper 从四分之三侧面缓慢转到背面，摄影机保持固定，沿用设定中的道具。', '四分之三首帧、背面尾帧草案', '双联气瓶数量与阀轮位置符合设定，中段轮廓和比例稳定。', 1.02],
      ['背面道具特写', '画面缓慢靠近背部气瓶和阀轮，保持各部件连接关系。', '由 GLB 渲染背面道具特写', '气瓶、阀轮、连接件位置清晰，近景形状稳定。', 1.32],
    ];
    root.innerHTML = `
      <div class="demo-columns shot-workbench">
        <div class="shot-stage" id="shot-stage">
          <img id="shot-image" src="${window.vesperImageUrl}" alt="用于镜头构图预演的 Vesper 角色设定图">
          <span class="shot-caption" id="shot-caption">设定图构图预演</span>
        </div>
        <div class="shot-controls">
          <label class="field">镜头类型<select id="shot-kind">${optionList(shots)}</select></label>
          <label class="field">目标时长 <output id="shot-duration-label"></output><input id="shot-duration" type="range" min="3" max="8" value="5"></label>
          <label class="field">画面比例<select id="shot-ratio"><option>16:9</option><option>9:16</option><option>1:1</option></select></label>
          <div class="action-row"><button id="shot-play" class="button secondary" type="button">播放构图预演</button>
            <button id="shot-frame" class="button secondary" type="button" hidden>查看背面对照</button></div>
          <p class="subtle">预演只显示景别与画框变化。角色动作由实测镜头验证。</p>
        </div>
      </div>
      <div class="result-box shot-card"><h3>可复用镜头卡</h3><pre id="shot-prompt" aria-live="polite"></pre>
        <div class="action-row"><button id="shot-download" class="button primary" type="button">下载镜头卡 ↓</button>
          <a class="button secondary" href="${window.vesperImageUrl}" download="vesper-reference.png">下载设定图 ↓</a></div>
      </div>`;
    const kind = get(root, 'shot-kind');
    const duration = get(root, 'shot-duration');
    const ratio = get(root, 'shot-ratio');
    const stage = get(root, 'shot-stage');
    const image = get(root, 'shot-image');
    const output = get(root, 'shot-prompt');
    const frame = get(root, 'shot-frame');
    let animation;
    let showBack = false;
    function update() {
      const [title, action, reference, check] = shots[kind.value];
      const useBackImage = kind.value === '2' || (kind.value === '1' && showBack);
      animation?.cancel();
      stage.dataset.ratio = ratio.value;
      image.src = useBackImage ? window.vesperBackImageUrl : window.vesperImageUrl;
      image.alt = useBackImage ? 'Vesper 三维模型背面，可见双联气瓶和阀轮' : 'Vesper 角色正面设定图';
      image.style.objectPosition = kind.value === '2' ? 'center 36%' : 'center 42%';
      image.style.transformOrigin = image.style.objectPosition;
      frame.hidden = kind.value !== '1';
      frame.textContent = showBack ? '查看正面对照' : '查看背面对照';
      get(root, 'shot-caption').textContent = useBackImage ? '实际模型背面 · 构图预演' : '原创正面设定 · 构图预演';
      get(root, 'shot-duration-label').textContent = `${duration.value} 秒`;
      output.textContent = `镜头  |  ${title}\n目标  |  ${duration.value} 秒 / ${ratio.value}\n输入  |  ${reference}\n提示  |  ${action}\n验收  |  ${check}`;
    }
    root.addEventListener('input', event => {
      if (event.target === kind) showBack = false;
      update();
    });
    frame.addEventListener('click', () => {
      showBack = !showBack;
      update();
    });
    get(root, 'shot-play').addEventListener('click', () => {
      const [, , , , scale] = shots[kind.value];
      animation?.cancel();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      animation = image.animate([
        { transform: 'scale(1)' },
        { transform: `scale(${scale})` },
      ], { duration: reduced ? 1 : Number(duration.value) * 1000, easing: 'ease-in-out', fill: 'forwards' });
    });
    get(root, 'shot-download').addEventListener('click', () => {
      const [title, action, reference, check] = shots[kind.value];
      const markdown = `# Vesper · ${title}\n\n- 目标时长 ${duration.value} 秒\n- 画面比例 ${ratio.value}\n- 参考素材 ${reference}\n- 提示词 ${action}\n- 验收 ${check}\n\n## 实测记录\n\n填写平台、模型版本、参考方式、重试次数、耗时和样片路径。\n`;
      download('vesper-shot.md', new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
    });
    update();
  }

  window.entryDemos = { notebooklm, perplexity, khan, deepl, photopea, desmos, jimeng };
})();
