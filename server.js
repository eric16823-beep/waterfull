const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

function clamp01(value) {
  return Math.max(0, Math.min(1, parseFloat(value || '0')));
}

function getTextAnchor(position) {
  switch (position) {
    case 'top-left':
    case 'bottom-left':
    case 'diagonal-left':
      return 'start';
    case 'top-right':
    case 'bottom-right':
    case 'diagonal-right':
      return 'end';
    default:
      return 'middle';
  }
}

function escapeSvgText(text) {
  return String(text).replace(/[&<>'"]/g, (char) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;'
    }[char];
  });
}

function getWatermarkPosition(position, width, height, offsetX, offsetY, itemWidth = 0, itemHeight = 0) {
  const marginX = 40;
  const marginY = 60;
  if (position === 'top-left') {
    return { x: marginX, y: marginY };
  }
  if (position === 'top-right') {
    return { x: Math.round(width - itemWidth - marginX), y: marginY };
  }
  if (position === 'center') {
    return { x: Math.round(width / 2), y: Math.round(height / 2) };
  }
  if (position === 'bottom-left') {
    return { x: marginX, y: Math.round(height - itemHeight - marginY) };
  }
  if (position === 'bottom-right') {
    return { x: Math.round(width - itemWidth - marginX), y: Math.round(height - itemHeight - marginY) };
  }
  if (position === 'diagonal-left' || position === 'diagonal-right') {
    return { x: Math.round(width * offsetX), y: Math.round(height * offsetY) };
  }
  return { x: Math.round(width * offsetX), y: Math.round(height * offsetY) };
}

app.use(express.static(path.join(__dirname, 'public')));

function positionToGravity(pos) {
  switch (pos) {
    case 'top-left': return 'northwest';
    case 'top-right': return 'northeast';
    case 'center': return 'centre';
    case 'bottom-left': return 'southwest';
    case 'bottom-right': return 'southeast';
    default: return 'southeast';
  }
}

app.post('/upload', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'watermarkImage', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.photo || req.files.photo.length === 0) {
      return res.status(400).send('No photo uploaded');
    }

    const photoBuf = req.files.photo[0].buffer;
    const opts = req.body || {};
    const type = opts.watermarkType || 'text';
    const position = opts.position || 'bottom-right';
    const opacity = Math.max(0, Math.min(1, parseFloat(opts.opacity || '0.5')));
    const scale = Math.max(0.1, Math.min(3, parseFloat(opts.scale || '1')));
    const rotate = parseFloat(opts.rotate || '0');
    const fontSize = parseInt(opts.fontSize || '48', 10);
    const text = opts.text || 'Sample Watermark';
    const color = opts.color || '#ffffff';

    const rotatedPhotoBuf = await sharp(photoBuf).rotate().toBuffer();
    const img = sharp(rotatedPhotoBuf);
    const meta = await img.metadata();
    const width = meta.width || 800;
    const height = meta.height || 600;

    let overlaySvg;

    const offsetX = clamp01(opts.offsetX || '0.5');
    const offsetY = clamp01(opts.offsetY || '0.5');

    if (type === 'image' && req.files.watermarkImage && req.files.watermarkImage[0]) {
      // embed watermark image into an SVG so we can set opacity, scale and rotation
      const wmBuf = req.files.watermarkImage[0].buffer;
      const wmBase64 = wmBuf.toString('base64');
      const wmWidth = Math.round(width * 0.25 * scale);
      const wmHeight = Math.round(height * 0.25 * scale);
      const { x, y } = getWatermarkPosition(position, width, height, offsetX, offsetY, wmWidth, wmHeight);
      const transform = `translate(${x}, ${y}) rotate(${rotate}) translate(-${wmWidth / 2}, -${wmHeight / 2})`;
      overlaySvg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="overflow:hidden">
  <g transform="${transform}">
    <image href="data:image/png;base64,${wmBase64}" width="${wmWidth}" height="${wmHeight}" opacity="${opacity}" />
  </g>
</svg>`;
    } else {
      // text watermark: place text in SVG sized to image
      const fill = `${color}`;
      const shadow = `rgba(0,0,0,${Math.min(0.7, opacity + 0.2)})`;
      const { x, y } = getWatermarkPosition(position, width, height, offsetX, offsetY);
      const anchor = getTextAnchor(position);
      const textRotation = rotate;
      const transform = textRotation ? `transform="rotate(${textRotation}, ${x}, ${y})"` : '';
      const scaledFontSize = Math.max(1, Math.round(fontSize * scale * 3));
      const escapedText = escapeSvgText(text);
      overlaySvg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <style>
    .wm { font-family: Arial, Helvetica, sans-serif; font-size: ${scaledFontSize}px; fill: ${fill}; }
    .shadow { font-family: Arial, Helvetica, sans-serif; font-size: ${scaledFontSize}px; fill: ${shadow}; }
  </style>
  <text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" class="shadow" ${transform}>${escapedText}</text>
  <text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" class="wm" ${transform}>${escapedText}</text>
</svg>`;
    }

    const overlayBuffer = await sharp(Buffer.from(overlaySvg)).png().resize(width, height).toBuffer();
    const resultBuf = await img.composite([{ input: overlayBuffer, left: 0, top: 0 }]).toBuffer();

    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', 'attachment; filename="watermarked.png"');
    res.send(resultBuf);
  } catch (err) {
    console.error(err);
    res.status(500).send('Processing error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
