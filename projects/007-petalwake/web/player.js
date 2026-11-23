const button = document.getElementById('load-demo');
const mount = document.getElementById('player-mount');
const officialDemo = document.getElementById('official-demo');

button.hidden = false;
button.addEventListener('click', () => {
  const frame = document.createElement('iframe');
  frame.title = 'Petalwake 官方 v2 试玩';
  frame.src = officialDemo.href;
  frame.allow = 'fullscreen; autoplay; gamepad';
  frame.allowFullscreen = true;
  mount.replaceChildren(frame);
  frame.focus();
}, { once: true });
