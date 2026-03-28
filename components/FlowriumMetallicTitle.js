import { useEffect, useState } from 'react';
import MetallicPaint from './MetallicPaint';

const FONT_STACK = '"Bagel Fat One", cursive';
const TEXT = 'FLOWRIUM';

/** 결정적 스티플용 간단 PRNG (가장자리 더스트) */
function mulberry32(seed) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 이진 마스크 팽창(3×3 max, 본인 포함).
 */
function dilateBinary(filled, w, h) {
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (filled[idx]) {
        out[idx] = 1;
        continue;
      }
      let v = 0;
      for (let dy = -1; dy <= 1 && !v; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          if (filled[yy * w + xx]) {
            v = 1;
            break;
          }
        }
      }
      out[idx] = v;
    }
  }
  return out;
}

/**
 * 글자 가장자리 밖으로 스티플(그레인)이 퍼지는 Photoshop식 더스트.
 * morphology 링마다 밀도 감쇠 — 참조 이미지의 charcoal/sand 느낌.
 */
function applyEdgeDustToImageData(img, w, h, rng) {
  const d = img.data;
  const core = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    core[i] = d[i * 4 + 3] > 128 ? 1 : 0;
  }

  const MAX_RING = 28;
  let acc = core;

  for (let ring = 1; ring <= MAX_RING; ring++) {
    const expanded = dilateBinary(acc, w, h);
    const falloff = 1 - ring / (MAX_RING + 4);
    const density = Math.max(0, falloff * 0.92);

    for (let i = 0; i < w * h; i++) {
      if (!expanded[i] || acc[i]) continue;
      if (rng() > density) continue;
      const t = rng();
      const px = i * 4;
      if (t < 0.55) {
        d[px] = 0;
        d[px + 1] = 0;
        d[px + 2] = 0;
        d[px + 3] = 255;
      } else if (t < 0.88) {
        const g = 28 + Math.floor(rng() * 55);
        d[px] = g;
        d[px + 1] = g;
        d[px + 2] = g;
        d[px + 3] = 255;
      } else {
        const g = 70 + Math.floor(rng() * 90);
        d[px] = g;
        d[px + 1] = g;
        d[px + 2] = g;
        d[px + 3] = Math.floor(180 + rng() * 75);
      }
    }
    acc = expanded;
  }
}

/**
 * Bagel Fat One으로 텍스트를 캔버스에 그려 MetallicPaint 텍스처로 사용합니다.
 */
function makeFlowriumTextureDataUrl() {
  const w = 3600;
  const h = 1010;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let fontSize = 600;
  ctx.font = `400 ${fontSize}px ${FONT_STACK}`;
  while (ctx.measureText(TEXT).width > w * 0.92 && fontSize > 120) {
    fontSize -= 8;
    ctx.font = `400 ${fontSize}px ${FONT_STACK}`;
  }

  ctx.fillText(TEXT, w / 2, h / 2);

  const img = ctx.getImageData(0, 0, w, h);
  applyEdgeDustToImageData(img, w, h, mulberry32(0xca7ba12));
  ctx.putImageData(img, 0, 0);

  return canvas.toDataURL('image/png');
}

export default function FlowriumMetallicTitle(props) {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        await document.fonts.ready;
        await document.fonts.load(`400 600px ${FONT_STACK}`);
      } catch {
        /* ignore */
      }
      if (cancelled) return;
      const url = makeFlowriumTextureDataUrl();
      if (!cancelled && url) setImageSrc(url);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  /* SVG를 texture로 쓰면 외부 웹폰트가 적용되지 않아 세리프로 깨짐 — 캔버스(Bagel 로드 후)만 사용 */
  if (!imageSrc) {
    return null;
  }

  return <MetallicPaint {...props} imageSrc={imageSrc} />;
}
