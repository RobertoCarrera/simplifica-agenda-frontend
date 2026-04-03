/**
 * Applies company branding colors as CSS custom properties on :root.
 * Derives hover and light variants automatically via HSL manipulation.
 */

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return (
    '#' +
    [r, g, b]
      .map((x) => Math.round(x * 255).toString(16).padStart(2, '0'))
      .join('')
  );
}

function isValidHex(color: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(color);
}

export function applyBrandingColors(primary?: string | null, secondary?: string | null): void {
  const root = document.documentElement;

  if (primary && isValidHex(primary)) {
    const [h, s, l] = hexToHsl(primary);
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-primary-hover', hslToHex(h, s, Math.max(0, l - 12)));
    root.style.setProperty('--color-primary-light', hslToHex(h, Math.min(s, 30), Math.min(97, l + 38)));
  }

  if (secondary && isValidHex(secondary)) {
    const [h, s, l] = hexToHsl(secondary);
    root.style.setProperty('--color-secondary', secondary);
    root.style.setProperty('--color-secondary-hover', hslToHex(h, s, Math.max(0, l - 10)));
  }
}
