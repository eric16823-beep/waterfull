const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

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

    const img = sharp(photoBuf).rotate();
    const meta = await img.metadata();
    const width = meta.width || 800;
    const height = meta.height || 600;

    let overlaySvg;

    if (type === 'image' && req.files.watermarkImage && req.files.watermarkImage[0]) {
      // embed watermark image into an SVG so we can set opacity, scale and rotation
      const wmBuf = req.files.watermarkImage[0].buffer;
      const wmBase64 = wmBuf.toString('base64');
      const wmWidth = Math.round(width * 0.25 * scale);
      const wmHeight = Math.round(height * 0.25 * scale);
      let x = 0;
      let y = 0;
      let angle = rotate;
      if (position === 'top-left') { x = 20; y = 20; }
      if (position === 'top-right') { x = width - wmWidth - 20; y = 20; }
      if (position === 'center') { x = Math.round((width - wmWidth) / 2); y = Math.round((height - wmHeight) / 2); }
      if (position === 'bottom-left') { x = 20; y = height - wmHeight - 20; }
      if (position === 'bottom-right') { x = width - wmWidth - 20; y = height - wmHeight - 20; }
      const offsetX = Math.max(0, Math.min(1, parseFloat(opts.offsetX || '0.5')));
      const offsetY = Math.max(0, Math.min(1, parseFloat(opts.offsetY || '0.5')));
      if (position === 'diagonal-left') { x = Math.round(width * offsetX); y = Math.round(height * offsetY); }
      if (position === 'diagonal-right') { x = Math.round(width * offsetX); y = Math.round(height * offsetY); }
      const centerX = x + wmWidth / 2;
      const centerY = y + wmHeight / 2;
      const transform = angle ? `transform="translate(${centerX}, ${centerY}) rotate(${angle}) translate(-${wmWidth/2}, -${wmHeight/2})"` : `x="${x}" y="${y}"`;
      const imageTag = angle ? `<image href="data:image/png;base64,${wmBase64}" width="${wmWidth}" height="${wmHeight}" opacity="${opacity}" ${transform}/>` : `<image href="data:image/png;base64,${wmBase64}" x="${x}" y="${y}" width="${wmWidth}" height="${wmHeight}" opacity="${opacity}"/>`;
      overlaySvg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  ${imageTag}
</svg>`;
    } else {
      // text watermark: place text in SVG sized to image
      // position will be handled by CSS-like x/y in the SVG
      const fill = `${color}`;
      const shadow = `rgba(0,0,0,${Math.min(0.7, opacity + 0.2)})`;
      // compute x,y per position
      let x = '50%';
      let y = '50%';
      let anchor = 'middle';
      let rotate = 0;
      if (position === 'top-left') { x = 40; y = 60; anchor = 'start'; }
      if (position === 'top-right') { x = width - 40; y = 60; anchor = 'end'; }
      if (position === 'bottom-left') { x = 40; y = height - 40; anchor = 'start'; }
      if (position === 'bottom-right') { x = width - 40; y = height - 40; anchor = 'end'; }
      const offsetX = Math.max(0, Math.min(1, parseFloat(opts.offsetX || '0.5')));
      const offsetY = Math.max(0, Math.min(1, parseFloat(opts.offsetY || '0.5')));
      if (position === 'center') { x = '50%'; y = '50%'; anchor = 'middle'; }
      if (position === 'diagonal-left') { x = Math.round(width * offsetX); y = Math.round(height * offsetY); anchor = 'start'; rotate = -45; }
      if (position === 'diagonal-right') { x = Math.round(width * offsetX); y = Math.round(height * offsetY); anchor = 'end'; rotate = 45; }

      const transform = rotate ? `transform="rotate(${rotate}, ${x}, ${y})"` : '';
      overlaySvg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <style>
    .wm { font-family: Arial, Helvetica, sans-serif; font-size: ${fontSize}px; fill: ${fill}; }
    .shadow { font-family: Arial, Helvetica, sans-serif; font-size: ${fontSize}px; fill: ${shadow}; }
  </style>
  <text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" class="shadow" ${transform}>${text}</text>
  <text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" class="wm" ${transform}>${text}</text>
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
