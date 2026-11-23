const byId = (id) => document.getElementById(id);
const video = byId('video');
const modeButtons = [...document.querySelectorAll('[data-mode]')];
const tracks = {};
const sourceVideo = 'sample/source/product-demo_v1.mp4';
const paths = {
  english: 'sample/comparison/alder-board_v1.en.srt',
  ai: 'sample/comparison/alder-board_v1.zh-CN.ai.srt',
  final: 'sample/delivery/alder-board_v1.zh-CN.srt',
};

const reviewNotes = {
  1: 'Alder Board 是产品名，保留原文。这里的 launch board 指上线看板，画面是工作区。',
  2: '画面右上角显示 New board。字幕保留按钮原文，告诉观众点哪里。',
  3: 'Product Launch 是框里实际输入的标题，下一步对应 Create board 按钮。',
  4: '画面要在 To do 待办列添加卡片。初译写成「完成」，会把观众引到右侧另一列。',
  5: '前半对应输入卡片标题。25.950 秒切到拖动提示，字幕写出画面中目标列的原名 In progress。',
  6: '原画面右上角的按钮叫 Invite members。用实际按钮名替换「董事会高层开放邀请会员」。',
  7: '36.780 秒切换到选角色的提示。Editor 是可更新卡片的权限角色，画面上方的字段名是 Board role。',
  8: '确认权限后，下一步是点击对话框里的 Send invite。',
  9: '先找 Share board，47.050 秒对话框打开时再显示 Copy link。',
  10: '回到「上线看板」和「团队」，与片头和录屏实际操作一致。',
};
const highlights = [
  {cue: 2, at: 7.8, label: '新建看板'},
  {cue: 4, at: 20.8, label: '待办列'},
  {cue: 5, at: 26.1, label: '拖动卡片'},
  {cue: 6, at: 30.1, label: '邀请成员'},
  {cue: 7, at: 37.7, label: '编辑权限'},
  {cue: 9, at: 47.35, label: '复制链接'},
];
const idleCue = '此时间点无字幕';

function seconds(timestamp) {
  const [hours, minutes, sec] = timestamp.replace(',', '.').split(':').map(Number);
  return hours * 3600 + minutes * 60 + sec;
}

function timecode(time) {
  const total = Math.max(0, Math.round(time * 1000));
  const minutes = String(Math.floor(total / 60000)).padStart(2, '0');
  const sec = String(Math.floor(total / 1000) % 60).padStart(2, '0');
  return `${minutes}:${sec}.${String(total % 1000).padStart(3, '0')}`;
}

async function readAsset(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`样例资产读取失败（${response.status}）`);
  return response;
}

async function loadCues(path) {
  const response = await readAsset(path);
  const raw = await response.text();
  return raw.trim().split(/\r?\n[ \t]*\r?\n/).map((block) => {
    const [id, bounds, ...text] = block.split(/\r?\n/);
    const [start, end] = bounds.split(' --> ').map(seconds);
    return {id: Number(id), start, end, text: text.join('\n')};
  });
}

function activeCue(cues, at) {
  return cues.find(({start, end}) => at >= start && at < end);
}

function installTrack(key, label, cues) {
  const track = video.addTextTrack('subtitles', label, 'zh-CN');
  track.mode = 'hidden';
  for (const {start, end, text} of cues) track.addCue(new VTTCue(start, end, text));
  track.mode = 'disabled';
  tracks[key] = track;
}

function selectMode(mode) {
  for (const [key, track] of Object.entries(tracks)) track.mode = key === mode ? 'showing' : 'disabled';
  for (const button of modeButtons) button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
}

function seek(at) {
  video.pause();
  video.currentTime = at;
}

function jumpButton(at, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.addEventListener('click', () => seek(at));
  return button;
}

function initHighlights() {
  for (const {cue, at, label} of highlights) {
    const button = jumpButton(at, 'jump');
    const time = document.createElement('time');
    time.textContent = timecode(at).slice(0, 5);
    button.append(time, label);
    button.dataset.cue = cue;
    button.setAttribute('aria-pressed', 'false');
    byId('jumps').append(button);
  }
}

function transcriptCell(label, value) {
  const cell = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = label;
  const text = document.createElement('p');
  text.textContent = value;
  cell.append(title, text);
  return cell;
}

function initTranscript({english, ai, final}) {
  for (const cue of english) {
    const row = document.createElement('div');
    row.className = 'transcript-row';
    const jump = jumpButton(cue.start + .025, 'jump-inline');
    jump.textContent = timecode(cue.start);
    jump.addEventListener('click', () => byId('review').scrollIntoView({block: 'start'}));
    const reviewed = final.filter(({start, end}) => start < cue.end && end > cue.start);
    row.append(jump, transcriptCell('英文原文', cue.text), transcriptCell('AI 初译', ai.find(({id}) => id === cue.id)?.text ?? ''),
      transcriptCell('审校定稿', reviewed.map(({text}) => text).join('\n\n')));
    byId('all-cues').append(row);
  }
}

function initPlayback(cues) {
  const sync = () => {
    const at = video.currentTime;
    const ai = activeCue(cues.ai, at);
    const final = activeCue(cues.final, at);
    byId('playhead').textContent = timecode(at);
    byId('ai-cue').textContent = ai?.text ?? idleCue;
    byId('final-cue').textContent = final?.text ?? idleCue;
    byId('reason').textContent = reviewNotes[ai?.id] ?? '点击下方时间点跳到对应的改动。';
    for (const jump of byId('jumps').children) jump.setAttribute('aria-pressed', String(Number(jump.dataset.cue) === ai?.id));
  };
  video.addEventListener('timeupdate', sync);
  video.addEventListener('seeked', sync);
  video.addEventListener('seeking', sync);
  const start = () => {
    for (const button of modeButtons) button.disabled = false;
    byId('restart').disabled = false;
    seek(30.1);
    sync();
  };
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) start();
  else video.addEventListener('loadedmetadata', start, {once: true});
}

function showError(message) {
  const status = byId('error');
  status.textContent = message;
  status.hidden = false;
}

async function init() {
  const [entries, clip] = await Promise.all([
    Promise.all(Object.entries(paths).map(async ([key, path]) => [key, await loadCues(path)])),
    readAsset(sourceVideo).then((response) => response.blob()),
  ]);
  const cues = Object.fromEntries(entries);
  installTrack('ai', 'AI 自动翻译', cues.ai);
  installTrack('final', '对照画面审校', cues.final);
  selectMode('final');
  for (const button of modeButtons) button.addEventListener('click', () => selectMode(button.dataset.mode));
  initHighlights();
  initTranscript(cues);
  initPlayback(cues);
  video.src = URL.createObjectURL(clip);
}

byId('restart').addEventListener('click', () => {
  video.currentTime = 0;
  video.play().catch(() => showError('请点击播放器上的播放按钮。'));
});
video.addEventListener('error', () => showError('原始演示无法加载。请刷新页面后重试。'));
init().catch(() => showError('样例暂时无法读取。请从项目的本地预览地址打开页面。'));
