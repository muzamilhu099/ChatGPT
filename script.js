const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

const hexInput = document.querySelector('#hex-input');
const picker = document.querySelector('#picker');
const paletteGrid = document.querySelector('#palette-grid');
const randomBtn = document.querySelector('#random-btn');
const generateBtn = document.querySelector('#generate-btn');
const toast = document.querySelector('#toast');
const title = document.querySelector('#palette-title');

const normalizeHex = (value) => {
  const raw = value.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null;
  return `#${raw.toLowerCase()}`;
};

const hexToRgb = (hex) => {
  const value = normalizeHex(hex)?.slice(1);
  if (!value) return null;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
};

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;

const shade = (rgb, percent) => {
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent);
  return {
    r: Math.round((t - rgb.r) * p + rgb.r),
    g: Math.round((t - rgb.g) * p + rgb.g),
    b: Math.round((t - rgb.b) * p + rgb.b),
  };
};

const toName = (hex) => {
  const names = {
    '#ef4444': 'Red',
    '#f97316': 'Orange',
    '#eab308': 'Yellow',
    '#22c55e': 'Green',
    '#06b6d4': 'Cyan',
    '#3b82f6': 'Blue',
    '#8b5cf6': 'Violet',
    '#ec4899': 'Pink',
  };

  const entries = Object.entries(names);
  const rgb = hexToRgb(hex);
  if (!rgb) return 'Custom';

  let best = 'Custom';
  let bestDiff = Infinity;

  for (const [k, label] of entries) {
    const c = hexToRgb(k);
    const diff =
      Math.abs(rgb.r - c.r) + Math.abs(rgb.g - c.g) + Math.abs(rgb.b - c.b);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = label;
    }
  }

  return best;
};

const textColorFor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#111827';
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 140 ? '#111827' : '#f8fafc';
};

const copyToClipboard = async (value) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.textContent = `Copied ${value}`;
  } catch {
    toast.textContent = 'Clipboard blocked';
  }
  toast.classList.add('visible');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 1200);
};

const buildPalette = (hex) => {
  const base = hexToRgb(hex);
  if (!base) return;

  const offsets = [0.92, 0.78, 0.58, 0.35, 0.18, 0, -0.12, -0.28, -0.42, -0.56];

  paletteGrid.innerHTML = '';

  offsets.forEach((offset, i) => {
    const color = rgbToHex(shade(base, offset));
    const swatch = document.createElement('button');
    swatch.className = 'swatch';
    swatch.style.background = color;
    swatch.style.color = textColorFor(color);
    swatch.innerHTML = `
      <span class="swatch-step">${steps[i]}</span>
      <span class="swatch-hex">${color.toUpperCase()}</span>
    `;
    swatch.addEventListener('click', () => copyToClipboard(color.toUpperCase()));
    paletteGrid.appendChild(swatch);
  });

  title.textContent = `${toName(hex)} palette`;
};

const randomHex = () =>
  `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`;

const applyColor = (value) => {
  const normalized = normalizeHex(value);
  if (!normalized) return;
  hexInput.value = normalized;
  picker.value = normalized;
  buildPalette(normalized);
};

picker.addEventListener('input', (event) => applyColor(event.target.value));

generateBtn.addEventListener('click', () => applyColor(hexInput.value));

hexInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') applyColor(hexInput.value);
});

randomBtn.addEventListener('click', () => applyColor(randomHex()));

applyColor(hexInput.value);
