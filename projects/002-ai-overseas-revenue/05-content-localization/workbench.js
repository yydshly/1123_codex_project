const {parseSrt, readTime, formatTime, scan, writeSrt, fileStem} = window.HandoffCore;
const byId = (id) => document.getElementById(id);
const video = byId('video');
const transcript = byId('cue-list');
const output = byId('export');
const generate = byId('translate');
const fields = {text: byId('caption'), start: byId('start'), end: byId('end')};
const nativeTrack = video.addTextTrack('subtitles', '简体中文', 'zh-CN');
nativeTrack.mode = 'showing';
const previewCues = new Map();
const defaultStatus = '识别和翻译均在本机处理。已配英文 SRT 的视频可直接翻译。';
const maxSpeechDuration = 600000;
const maxSpeechBytes = 512 * 1024 * 1024;
let source = [];
let draft = [];
let sourceName = '';
let sourceKind = '';
let mediaUrl = '';
let mediaName = '';
let mediaBlob = null;
let duration = null;
let selected = -1;
let stopAt = null;
let sourceTicket = 0;
let sampleTicket = 0;
let pending = null;
let edited = false;
let shift = null;
let audition = null;

function setStatus(text, kind = '') {
  const status = byId('work-status');
  status.textContent = text;
  status.dataset.kind = kind;
}

function playhead() {
  return Math.round(video.currentTime * 1000);
}

function bounds(cue) {
  if (!cue) return null;
  const start = readTime(cue.start);
  const end = readTime(cue.end);
  return start !== null && end !== null && end > start ? [start, end] : null;
}

function activeAt(time) {
  return draft.findIndex((cue) => {
    const range = bounds(cue);
    return range && time >= range[0] && time < range[1];
  });
}

function syncPlayer() {
  const time = playhead();
  byId('timecode').textContent = formatTime(time);
  const index = activeAt(time);
  byId('locate').disabled = index < 0;
  const sample = audition;
  if (sample) {
    const isShowing = ([start, end]) => time >= start && time < end;
    const labels = [];
    if (isShowing(sample.original)) labels.push('原字幕');
    if (isShowing(sample.proposed)) labels.push('建议时间');
    byId('playing-cue').textContent = labels.length ? `${labels.join('、')} · ${sample.text}` : '回听英文原声';
  } else {
    byId('playing-cue').textContent = draft[index]?.text || (draft.length ? '当前位置无字幕' : '生成初稿后可预览中文字幕');
  }
}

function updateTrack(index) {
  const existing = previewCues.get(index);
  if (existing) {
    nativeTrack.removeCue(existing);
    previewCues.delete(index);
  }
  const cue = draft[index];
  const range = bounds(cue);
  if (!range || !cue.text.trim()) return;
  const caption = new VTTCue(range[0] / 1000, range[1] / 1000, cue.text);
  nativeTrack.addCue(caption);
  previewCues.set(index, caption);
}

function previewCaption(seek, play, end = null, sample = null) {
  if (duration === null) return;
  video.pause();
  audition = sample;
  video.currentTime = Math.min(seek, duration) / 1000;
  stopAt = end;
  syncPlayer();
  if (play) video.play().catch(() => setStatus('请点击视频播放器上的播放按钮。', 'warning'));
}

function refreshControls() {
  generate.disabled = duration === null || Boolean(pending) || (!source.length && !canRecognize());
  generate.textContent = draft.length ? '重新生成初稿' : source.length ? '生成中文初稿' : '识别英文并翻译';
  const editable = selected !== -1 && !pending;
  for (const input of Object.values(fields)) input.disabled = !editable;
  for (const id of ['set-start', 'set-end']) byId(id).disabled = !editable || duration === null;
  const current = bounds(draft[selected]);
  byId('play-cue').disabled = !current || duration === null || current[0] >= duration;
  refreshOffsetControls();
}

function validateDraft() {
  const issues = scan(draft);
  if (duration !== null) {
    for (const [index, cue] of draft.entries()) {
      const range = bounds(cue);
      if (range && range[1] > duration) issues.errors.push({index, message: '结束时间超过视频时长。'});
    }
  }
  const entries = new Map();
  for (const [kind, list] of [['warning', issues.warnings], ['error', issues.errors]]) {
    for (const issue of list) entries.set(issue.index, {...issue, kind});
  }
  for (const [index, row] of Array.from(transcript.children).entries()) {
    const issue = entries.get(index);
    const flag = row.lastElementChild;
    flag.textContent = issue ? (issue.kind === 'error' ? '待修正' : '时间重叠') : '';
    flag.dataset.kind = issue?.kind ?? '';
  }
  const notice = byId('row-status');
  const here = entries.get(selected);
  notice.textContent = here?.message ?? '';
  notice.dataset.kind = here?.kind ?? '';
  notice.hidden = !here;
  const stats = draft.length ? `${draft.length} 条 · ${issues.errors.length} 处待修正 · ${issues.warnings.length} 处时间重叠` : '生成初稿后可按条跳转。';
  byId('timeline-status').textContent = stats;
  output.disabled = !draft.length || issues.errors.length > 0 || duration === null || Boolean(pending);
}

function selectCue(index, jump = true) {
  selected = index;
  const cue = draft[index];
  byId('cue-number').textContent = cue ? `第 ${index + 1} 条` : '';
  byId('source-text').textContent = source[index]?.text ?? '生成初稿后，从字幕列表中选一条开始审校。';
  for (const [field, input] of Object.entries(fields)) input.value = cue?.[field] ?? '';
  for (const [rowIndex, row] of Array.from(transcript.children).entries()) {
    row.setAttribute('aria-pressed', String(rowIndex === index));
  }
  refreshControls();
  validateDraft();
  const range = bounds(cue);
  if (range && jump) previewCaption(range[0], false);
}

function rowText(index) {
  const row = transcript.children[index];
  const cue = draft[index];
  row.children[1].textContent = `${cue.start} → ${cue.end}`;
  row.children[2].textContent = cue.text || '未填写';
}

function showDraft(cues) {
  for (const instance of previewCues.values()) nativeTrack.removeCue(instance);
  previewCues.clear();
  draft = cues;
  edited = false;
  const rows = document.createDocumentFragment();
  for (const [index] of draft.entries()) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'cue-row';
    for (const [label, cls] of [[String(index + 1).padStart(2, '0'), 'cue-index'], ['', 'cue-time'], ['', 'cue-text'], ['', 'cue-flag']]) {
      const item = document.createElement('span');
      item.className = cls;
      item.textContent = label;
      row.append(item);
    }
    row.addEventListener('click', () => selectCue(index));
    rows.append(row);
    updateTrack(index);
  }
  transcript.replaceChildren(rows);
  transcript.hidden = !draft.length;
  for (const [index] of draft.entries()) rowText(index);
  selectCue(draft.length ? 0 : -1);
  syncPlayer();
}

function updateCue(field, value) {
  if (selected < 0 || pending) return;
  draft[selected][field] = value;
  edited = true;
  stopAt = null;
  rowText(selected);
  updateTrack(selected);
  syncPlayer();
  refreshControls();
  validateDraft();
}

function setVideo(blob, name) {
  duration = null;
  resetShift();
  mediaName = name;
  mediaBlob = blob;
  stopAt = null;
  if (mediaUrl) URL.revokeObjectURL(mediaUrl);
  mediaUrl = URL.createObjectURL(blob);
  video.src = mediaUrl;
  video.hidden = false;
  byId('video-placeholder').hidden = true;
  byId('video-status').textContent = `${name} · 正在读取…`;
  refreshControls();
  validateDraft();
}

async function parseFile(blob) {
  if (blob.size > 2 * 1024 * 1024) throw Error('字幕文件超过 2 MiB。');
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const encoding = bytes[0] === 0xff && bytes[1] === 0xfe ? 'utf-16le'
    : bytes[0] === 0xfe && bytes[1] === 0xff ? 'utf-16be' : 'utf-8';
  let text;
  try { text = new TextDecoder(encoding, {fatal: true}).decode(bytes); } catch { throw Error('请另存为 UTF-8 SRT 后重试。'); }
  const cues = parseSrt(text).filter((cue) => cue.text.trim());
  if (!cues.length) throw Error('字幕文件没有可用文字。');
  if (cues.length > 2000) throw Error('单次支持最多 2,000 条字幕。');
  const {errors} = scan(cues);
  if (errors.length) throw Error(`第 ${errors[0].index + 1} 条：${errors[0].message}`);
  return cues;
}

function storeSource(cues, name, kind) {
  source = cues;
  sourceName = name;
  sourceKind = kind;
  const recognized = kind === 'speech';
  byId('source-label').textContent = recognized ? '英文识别结果' : '英文原文';
  byId('source-status').textContent = name ? `${recognized ? '从视频识别' : name} · ${cues.length} 条` : '可选 · 没有 SRT 时从视频识别';
}

function setSource(cues, name) {
  if (pending) pending.abort();
  pending = null;
  storeSource(cues, name, name ? 'file' : '');
  resetShift();
  stopAt = null;
  video.pause();
  showDraft([]);
  setStatus(defaultStatus);
  showLengthWarning();
}

function showLengthWarning() {
  if (duration !== null && !source.length && !canRecognize()) {
    setStatus('自动识别支持不超过 10 分钟、512 MiB 的视频。此视频可搭配已有英文 SRT 翻译。', 'warning');
    return;
  }
  if (duration !== null && source.some(({end}) => readTime(end) > duration)) {
    setStatus('部分英文字幕超过视频结尾。可先估算整轨偏差，或生成后逐条修正。', 'warning');
  }
}

function allowReplace() {
  return !edited || window.confirm('当前有尚未导出的改动。要换字幕并放弃这些改动吗？');
}

function canRecognize() {
  return Boolean(mediaBlob && duration !== null && duration <= maxSpeechDuration && mediaBlob.size <= maxSpeechBytes);
}

function setOffsetStatus(text, kind = '') {
  const status = byId('offset-status');
  status.textContent = text;
  status.dataset.kind = kind;
}

function stopAudition() {
  if (!audition) return;
  audition = null;
  stopAt = null;
  video.pause();
  syncPlayer();
}

function resetShift() {
  stopAudition();
  shift = null;
  byId('offset-samples').replaceChildren();
  setOffsetStatus('可按原声估算偏差，试听后再应用。');
}

function refreshOffsetControls() {
  const ready = canRecognize();
  byId('track-offset').hidden = sourceKind !== 'file' || Boolean(draft.length);
  byId('estimate-offset').disabled = !ready || Boolean(pending) || Boolean(shift?.applied);
  byId('offset-samples').hidden = !shift?.anchors.length;
  byId('offset-actions').hidden = !shift?.amount;
  byId('apply-offset').hidden = Boolean(shift?.applied);
  byId('apply-offset').disabled = Boolean(pending) || !ready || !shift?.cues || shift.outside > 0;
  byId('undo-offset').hidden = !shift?.applied;
  byId('undo-offset').disabled = Boolean(pending);
  if (!ready && duration !== null) setOffsetStatus('整轨估算支持不超过 10 分钟、512 MiB 的视频。');
}

function describeMove(amount) {
  return `整轨${amount > 0 ? '提前' : '延后'} ${(Math.abs(amount) / 1000).toFixed(3)} 秒`;
}

function makeShift(estimate) {
  const amount = estimate.status === 'offset' ? estimate.offset : 0;
  if (!amount) return {amount, cues: source, clipped: 0, outside: 0, anchors: estimate.anchors, applied: false};
  let clipped = 0;
  let outside = 0;
  const cues = source.map((cue) => {
    const [start, end] = bounds(cue).map((time) => time - amount);
    const first = Math.max(0, start);
    const last = Math.min(duration, end);
    if (last <= first) {
      outside++;
      return cue;
    }
    if (first !== start || last !== end) clipped++;
    return {...cue, start: formatTime(first), end: formatTime(last)};
  });
  return {amount, cues, clipped, outside, anchors: estimate.anchors, applied: false};
}

function shiftDetails() {
  const {amount, clipped, outside} = shift;
  if (outside) return `${describeMove(amount)}会让 ${outside} 条完全超出视频，无法应用。请核对素材版本。`;
  const estimate = shift.applied ? `已${describeMove(amount)}。` : `英文字幕整体${amount > 0 ? '偏晚' : '偏早'}，建议${describeMove(amount)}。`;
  return clipped ? `${estimate}${clipped} 条跨过片头或片尾，${shift.applied ? '已' : '将'}收至视频边界。` : estimate;
}

function renderOffsetSamples() {
  const results = byId('offset-samples');
  const labels = ['开头', '中间', '结尾'];
  results.replaceChildren(...shift.anchors.map((anchor, index) => {
    const cue = source[anchor.index];
    const original = bounds(cue);
    const proposed = bounds(shift.cues[anchor.index]);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'offset-sample';
    const title = document.createElement('strong');
    title.textContent = `回听${labels[index]}`;
    const timing = document.createElement('span');
    timing.textContent = `原 ${cue.start} · 建议 ${formatTime(proposed[0])}`;
    const sentence = document.createElement('span');
    sentence.textContent = cue.text;
    button.append(title, timing, sentence);
    button.addEventListener('click', () => {
      const start = Math.max(0, Math.min(original[0], proposed[0], anchor.audioStart) - 650);
      const end = Math.min(duration, Math.max(original[1], proposed[1], anchor.audioEnd) + 300);
      previewCaption(start, true, end, {original, proposed, text: cue.text});
    });
    return button;
  }));
}

async function estimateShift() {
  if (byId('estimate-offset').disabled) return;
  resetShift();
  const controller = new AbortController();
  pending = controller;
  refreshControls();
  setOffsetStatus('正在读取原声音轨…');
  try {
    const cues = source.map((cue) => {
      const [start, end] = bounds(cue);
      return {start, end, text: cue.text};
    });
    const metadata = new TextEncoder().encode(JSON.stringify(cues));
    const prefix = new DataView(new ArrayBuffer(4));
    prefix.setUint32(0, metadata.length);
    const body = new Blob([prefix.buffer, metadata, mediaBlob]);
    const {estimate} = await streamSpeech('/api/estimate-offset', body, controller, ({current, total}) => {
      setOffsetStatus(`正在比对原声与字幕 · 第 ${current} / ${total} 段`);
    });
    if (pending !== controller) return;
    const coverage = `匹配 ${estimate.matched} / ${estimate.spoken} 条口播。`;
    if (estimate.status === 'insufficient' || estimate.status === 'inconsistent') {
      const reason = estimate.status === 'insufficient' ? '三处口播的匹配证据不足。' : '各段偏差不一致，建议逐条审校。';
      setOffsetStatus(`${reason}${coverage}`, 'warning');
      return;
    }
    shift = makeShift(estimate);
    renderOffsetSamples();
    const message = shift.amount ? shiftDetails() : '整体偏差在 0.35 秒以内，建议沿用原时间。';
    setOffsetStatus(`${message}${coverage}`, shift.outside && shift.amount ? 'warning' : '');
  } catch (error) {
    if (pending === controller) setOffsetStatus(error.message, 'error');
  } finally {
    if (pending === controller) pending = null;
    refreshControls();
  }
}

async function runLocal(path, body, contentType, signal) {
  const response = await fetch(path, {method: 'POST', headers: {'Content-Type': contentType}, body, signal});
  const result = await response.json();
  if (!response.ok) throw Error(result.error || '本机处理未完成。');
  return result;
}

async function streamSpeech(path, body, controller, onProgress) {
  const response = await fetch(path, {
    method: 'POST', headers: {'Content-Type': 'application/octet-stream', Accept: 'application/x-ndjson'},
    body, signal: controller.signal,
  });
  if (!response.ok) throw Error((await response.json()).error || '无法读取视频。');
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  try {
    while (true) {
      const {value, done} = await reader.read();
      if (done) throw Error('识别连接已结束。请重试生成字幕。');
      buffer += value;
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line) continue;
        const item = JSON.parse(line);
        if (item.error) throw Error(item.error);
        if (item.cues || item.estimate) return item;
        if (pending === controller) onProgress(item);
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function recordSpeech(cues) {
  const recognized = cues.flatMap(({start, end, text}) => {
    const last = Math.min(end, duration);
    return last > start ? [{start: formatTime(start), end: formatTime(last), text}] : [];
  });
  if (!recognized.length) throw Error('没有识别到可用于字幕的英文语音。');
  const stem = mediaName.replace(/\.[^.]+$/, '');
  storeSource(recognized, `${stem}.en.srt`, 'speech');
}

async function translate() {
  if (generate.disabled || !allowReplace()) return;
  const controller = new AbortController();
  pending = controller;
  refreshControls();
  validateDraft();
  try {
    if (!source.length) {
      setStatus('正在从视频识别英文语音和时间戳…');
      const {cues} = await streamSpeech('/api/recognize', mediaBlob, controller, ({current, total}) => {
        setStatus(`正在识别第 ${current} / ${total} 段。时间会合回原视频。`);
      });
      if (pending !== controller) return;
      recordSpeech(cues);
    }
    setStatus(sourceKind === 'speech' ? `已得到 ${source.length} 条英文时间轴，正在翻译成中文…` : `正在用本机模型翻译 ${source.length} 条英文字幕…`);
    const body = JSON.stringify({texts: source.map(({text}) => text)});
    const result = await runLocal('/api/translate', body, 'application/json', controller.signal);
    if (pending !== controller) return;
    if (!Array.isArray(result.translations) || result.translations.length !== source.length) throw Error('返回的翻译条数与原字幕不一致。');
    pending = null;
    const timeline = shift?.applied ? shift.cues : source;
    showDraft(timeline.map((cue, index) => ({...cue, text: result.translations[index]})));
    const timing = sourceKind === 'speech' ? '时间来自语音识别，请回看确认'
      : shift?.applied ? `已${describeMove(shift.amount)}，可逐条审校` : '时间沿用英文 SRT，请回看确认';
    setStatus(`已生成 ${draft.length} 条中文初稿。${timing}。`);
  } catch (error) {
    if (pending === controller) setStatus(error.message, 'error');
  } finally {
    if (pending === controller) pending = null;
    refreshControls();
    validateDraft();
  }
}

async function getSample(path) {
  const response = await fetch(`sample/${path}`);
  if (!response.ok) throw Error('样例文件无法读取。');
  return response.blob();
}

async function loadSample(button, videoPath, subtitlePath = '') {
  if (!allowReplace()) return;
  const ticket = ++sampleTicket;
  ++sourceTicket;
  button.disabled = true;
  try {
    const subtitle = subtitlePath ? getSample(subtitlePath).then(parseFile) : [];
    const [clip, cues] = await Promise.all([getSample(videoPath), subtitle]);
    if (ticket !== sampleTicket) return;
    setVideo(clip, videoPath.split('/').at(-1));
    setSource(cues, subtitlePath.split('/').at(-1));
    setStatus(subtitlePath ? '带 SRT 的样例已导入。视频读完后即可生成中文初稿。' : '仅视频样例已导入。视频读完后即可识别英文并翻译。');
  } catch (error) {
    if (ticket === sampleTicket) setStatus(error.message, 'error');
  } finally {
    button.disabled = false;
  }
}

byId('load-sample').addEventListener('click', (event) => loadSample(event.currentTarget, 'cedar/cedar-notes-export.mp4', 'cedar/cedar-notes-export.en.srt'));
byId('load-video-sample').addEventListener('click', (event) => loadSample(event.currentTarget, 'willow/willow-calendar-reminder.mp4'));

byId('video-file').addEventListener('change', (event) => {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file) return;
  ++sampleTicket;
  const replacesDraft = draft.length || pending || sourceKind === 'speech';
  if (replacesDraft && edited && !window.confirm('更换视频会清空当前字幕和未导出改动。要继续吗？')) return;
  setVideo(file, file.name);
  if (replacesDraft) {
    ++sourceTicket;
    setSource([], '');
    setStatus('已换视频。可以从声音重新识别，也可以导入对应的英文 SRT。');
  } else {
    setStatus(defaultStatus);
  }
});

byId('srt-file').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file) return;
  ++sampleTicket;
  const ticket = ++sourceTicket;
  try {
    const cues = await parseFile(file);
    if (ticket === sourceTicket && allowReplace()) setSource(cues, file.name);
  } catch (error) {
    if (ticket === sourceTicket) setStatus(error.message, 'error');
  }
});

video.addEventListener('loadedmetadata', () => {
  if (!Number.isFinite(video.duration) || video.duration <= 0) {
    setStatus('无法确定视频时长，请换用本地 MP4 或 WebM 文件。', 'error');
    return;
  }
  duration = Math.round(video.duration * 1000);
  byId('video-status').textContent = `${mediaName} · ${formatTime(duration)}`;
  showLengthWarning();
  refreshControls();
  validateDraft();
  syncPlayer();
});
video.addEventListener('error', () => {
  duration = null;
  byId('video-status').textContent = `${mediaName} · 无法播放`;
  setStatus('浏览器无法播放该文件。请选择 H.264 MP4 或 WebM。', 'error');
  refreshControls();
  validateDraft();
});
video.addEventListener('timeupdate', () => {
  if (stopAt !== null && playhead() >= stopAt) {
    video.pause();
    stopAt = null;
    audition = null;
  }
  syncPlayer();
});
video.addEventListener('seeked', syncPlayer);
byId('locate').addEventListener('click', () => {
  const index = activeAt(playhead());
  if (index < 0) return;
  selectCue(index, false);
  transcript.children[index].scrollIntoView({block: 'nearest'});
});
byId('play-cue').addEventListener('click', () => {
  const range = bounds(draft[selected]);
  if (range) previewCaption(range[0], true, range[1]);
});
for (const [field, input] of Object.entries(fields)) {
  input.addEventListener('input', () => updateCue(field, input.value));
}
for (const field of ['start', 'end']) {
  byId(`set-${field}`).addEventListener('click', () => {
    const value = formatTime(playhead());
    fields[field].value = value;
    updateCue(field, value);
  });
}
generate.addEventListener('click', translate);
byId('estimate-offset').addEventListener('click', estimateShift);
byId('apply-offset').addEventListener('click', () => {
  if (byId('apply-offset').disabled || !shift?.amount || shift.applied) return;
  stopAudition();
  shift.applied = true;
  setOffsetStatus(shiftDetails());
  setStatus('已应用校正。点击「生成中文初稿」使用校正后的时间。');
  refreshControls();
  generate.focus();
});
byId('undo-offset').addEventListener('click', () => {
  if (pending || !shift?.applied) return;
  stopAudition();
  shift.applied = false;
  setOffsetStatus(shiftDetails());
  setStatus('已恢复英文 SRT 的原始时间。');
  showLengthWarning();
  refreshControls();
  byId('apply-offset').focus();
});
output.addEventListener('click', () => {
  if (output.disabled) return;
  const text = writeSrt(draft);
  const stem = fileStem(sourceName.replace(/(?:[._-]en(?:[-_][a-z]+)?)?\.srt$/i, ''), '简中字幕');
  const anchor = document.createElement('a');
  const url = URL.createObjectURL(new Blob([text], {type: 'text/plain;charset=utf-8'}));
  anchor.href = url;
  anchor.download = `${stem}.zh-CN.srt`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  edited = false;
  setStatus(`已导出 ${anchor.download}。`);
});
window.addEventListener('beforeunload', (event) => {
  if (edited) event.preventDefault();
});
