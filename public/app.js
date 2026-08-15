document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form');
  const textOptions = document.getElementById('textOptions');
  const imageOptions = document.getElementById('imageOptions');
  const op = document.getElementById('opacity');
  const opVal = document.getElementById('opVal');
  const scale = document.getElementById('scale');
  const scaleVal = document.getElementById('scaleVal');
  const rotate = document.getElementById('rotate');
  const rotateVal = document.getElementById('rotateVal');
  const result = document.getElementById('result');
  const previewCanvas = document.getElementById('previewCanvas');
  const watermarkPreview = document.getElementById('watermarkPreview');
  const offsetXInput = form.elements['offsetX'];
  const offsetYInput = form.elements['offsetY'];
  const colorInput = form.elements['color'];
  const colorSwatches = document.querySelectorAll('.color-swatch');
  const scaleDec = document.getElementById('scaleDec');
  const scaleInc = document.getElementById('scaleInc');
  const rotateDec = document.getElementById('rotateDec');
  const rotateInc = document.getElementById('rotateInc');
  const resetButton = document.getElementById('resetButton');
  const langButtons = document.querySelectorAll('.lang-btn');
  const i18nElements = {
    appTitle: document.getElementById('appTitle'),
    uploadPhoto: document.getElementById('uploadPhoto'),
    watermarkTypeLegend: document.getElementById('watermarkTypeLegend'),
    watermarkTypeText: document.getElementById('watermarkTypeText'),
    watermarkTypeImage: document.getElementById('watermarkTypeImage'),
    watermarkTextLabel: document.getElementById('watermarkTextLabel'),
    watermarkTextInput: document.getElementById('watermarkTextInput'),
    fontSizeLabel: document.getElementById('fontSizeLabel'),
    colorLabel: document.getElementById('colorLabel'),
    uploadWatermarkImageLabel: document.getElementById('uploadWatermarkImageLabel'),
    positionLabel: document.getElementById('positionLabel'),
    opacityLabel: document.getElementById('opacityLabel'),
    previewHeading: document.getElementById('previewHeading'),
    previewHint: document.getElementById('previewHint'),
    submitButton: document.getElementById('submitButton'),
    resetButton: document.getElementById('resetButton')
  };
  const previewCtx = previewCanvas.getContext && previewCanvas.getContext('2d');
  const defaultSettings = { scale: '1', rotate: '0', opacity: '0.5' };
  const FONT_SIZE_MULTIPLIER = 3;
  const translations = {
    zh: {
      appTitle: 'Waterfull - 圖片浮水印',
      uploadPhoto: '上傳照片 (必填)',
      watermarkTypeLegend: '浮水印類型',
      watermarkTypeText: '文字',
      watermarkTypeImage: '圖片',
      watermarkTextLabel: '輸入浮水印文字',
      watermarkTextInput: '請輸入浮水印文字',
      fontSizeLabel: '字型大小',
      colorLabel: '字體顏色',
      uploadWatermarkImageLabel: '上傳浮水印圖 (PNG 建議)',
      positionLabel: '位置',
      opacityLabel: '透明度',
      previewHeading: '預覽',
      previewHint: '拖曳浮水印可調整位置；使用大小與旋轉滑桿。',
      submitButton: '產生並下載',
      resetButton: '重置'
    },
    en: {
      appTitle: 'Waterfull - Image Watermark',
      uploadPhoto: 'Upload Photo (required)',
      watermarkTypeLegend: 'Watermark Type',
      watermarkTypeText: 'Text',
      watermarkTypeImage: 'Image',
      watermarkTextLabel: 'Watermark Text',
      watermarkTextInput: 'Enter watermark text',
      fontSizeLabel: 'Font Size',
      colorLabel: 'Font Color',
      uploadWatermarkImageLabel: 'Upload watermark image (PNG recommended)',
      positionLabel: 'Position',
      opacityLabel: 'Opacity',
      previewHeading: 'Preview',
      previewHint: 'Drag the watermark to adjust position; use size and rotation sliders.',
      submitButton: 'Generate & Download',
      resetButton: 'Reset',
      'position-top-left': 'Top Left',
      'position-top-right': 'Top Right',
      'position-center': 'Center',
      'position-bottom-left': 'Bottom Left',
      'position-bottom-right': 'Bottom Right',
      'position-diagonal-left': 'Diagonal Left',
      'position-diagonal-right': 'Diagonal Right'
    },
    ja: {
      appTitle: 'Waterfull - 画像透かし',
      uploadPhoto: '写真をアップロード (必須)',
      watermarkTypeLegend: '透かしタイプ',
      watermarkTypeText: 'テキスト',
      watermarkTypeImage: '画像',
      watermarkTextLabel: '透かしテキスト',
      watermarkTextInput: '透かしテキストを入力してください',
      fontSizeLabel: 'フォントサイズ',
      colorLabel: 'フォントカラー',
      uploadWatermarkImageLabel: '透かし画像をアップロード (PNG 推奨)',
      positionLabel: '位置',
      opacityLabel: '不透明度',
      previewHeading: 'プレビュー',
      previewHint: '透かしをドラッグして位置を調整します。サイズと回転スライダーを使用します。',
      submitButton: '生成してダウンロード',
      resetButton: 'リセット',
      'position-top-left': '左上',
      'position-top-right': '右上',
      'position-center': '中央',
      'position-bottom-left': '左下',
      'position-bottom-right': '右下',
      'position-diagonal-left': '左斜め',
      'position-diagonal-right': '右斜め'
    },
    es: {
      appTitle: 'Waterfull - Marca de Agua',
      uploadPhoto: 'Subir foto (requerido)',
      watermarkTypeLegend: 'Tipo de marca de agua',
      watermarkTypeText: 'Texto',
      watermarkTypeImage: 'Imagen',
      watermarkTextLabel: 'Texto de marca de agua',
      watermarkTextInput: 'Ingrese el texto de la marca de agua',
      fontSizeLabel: 'Tamaño de fuente',
      colorLabel: 'Color de fuente',
      uploadWatermarkImageLabel: 'Sube imagen de marca de agua (PNG recomendado)',
      positionLabel: 'Posición',
      opacityLabel: 'Opacidad',
      previewHeading: 'Vista previa',
      previewHint: 'Arrastra la marca de agua para ajustar la posición; usa los deslizadores de tamaño y rotación.',
      submitButton: 'Generar y descargar',
      resetButton: 'Restablecer',
      'position-top-left': 'Arriba izquierda',
      'position-top-right': 'Arriba derecha',
      'position-center': 'Centro',
      'position-bottom-left': 'Abajo izquierda',
      'position-bottom-right': 'Abajo derecha',
      'position-diagonal-left': 'Diagonal izquierda',
      'position-diagonal-right': 'Diagonal derecha'
    },
    ko: {
      appTitle: 'Waterfull - 이미지 워터마크',
      uploadPhoto: '사진 업로드 (필수)',
      watermarkTypeLegend: '워터마크 유형',
      watermarkTypeText: '텍스트',
      watermarkTypeImage: '이미지',
      watermarkTextLabel: '워터마크 텍스트',
      watermarkTextInput: '워터마크 텍스트를 입력하세요',
      fontSizeLabel: '글꼴 크기',
      colorLabel: '글꼴 색상',
      uploadWatermarkImageLabel: '워터마크 이미지 업로드 (PNG 권장)',
      positionLabel: '위치',
      opacityLabel: '투명도',
      previewHeading: '미리보기',
      previewHint: '워터마크를 드래그하여 위치를 조정하세요. 크기 및 회전 슬라이더를 사용하세요.',
      submitButton: '생성 및 다운로드',
      resetButton: '리셋',
      'position-top-left': '왼쪽 상단',
      'position-top-right': '오른쪽 상단',
      'position-center': '가운데',
      'position-bottom-left': '왼쪽 하단',
      'position-bottom-right': '오른쪽 하단',
      'position-diagonal-left': '왼쪽 대각선',
      'position-diagonal-right': '오른쪽 대각선'
    }
  };

  async function loadImageFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });
  }

  function getPreviewPosition(position, cw, ch, offsetX, offsetY, itemWidth = 0, itemHeight = 0, forImage = false) {
    const marginX = 40;
    const marginY = 60;
    let x = Math.round(cw * offsetX);
    let y = Math.round(ch * offsetY);

    if (position === 'top-left') {
      x = forImage ? Math.round(marginX + itemWidth / 2) : marginX;
      y = forImage ? Math.round(marginY + itemHeight / 2) : marginY;
    }
    if (position === 'top-right') {
      x = forImage ? Math.round(cw - marginX - itemWidth / 2) : Math.round(cw - marginX);
      y = forImage ? Math.round(marginY + itemHeight / 2) : marginY;
    }
    if (position === 'center') {
      x = Math.round(cw / 2);
      y = Math.round(ch / 2);
    }
    if (position === 'bottom-left') {
      x = forImage ? Math.round(marginX + itemWidth / 2) : marginX;
      y = forImage ? Math.round(ch - marginY - itemHeight / 2) : Math.round(ch - marginY);
    }
    if (position === 'bottom-right') {
      x = forImage ? Math.round(cw - marginX - itemWidth / 2) : Math.round(cw - marginX);
      y = forImage ? Math.round(ch - marginY - itemHeight / 2) : Math.round(ch - marginY);
    }
    return { x, y };
  }

  function getTextAlign(position) {
    switch (position) {
      case 'top-left':
      case 'bottom-left':
      case 'diagonal-left':
        return 'left';
      case 'top-right':
      case 'bottom-right':
      case 'diagonal-right':
        return 'right';
      default:
        return 'center';
    }
  }

  async function updatePreview() {
    if (!previewCtx) return;
    const photoFile = form.elements['photo'].files[0];
    if (!photoFile) {
      previewCtx.clearRect(0,0,previewCanvas.width, previewCanvas.height);
      watermarkPreview.style.display = 'none';
      return;
    }

    try {
      const img = await loadImageFile(photoFile);
      // fit canvas to image but limit width for responsive layout
      const maxWidth = 900;
      const previewScale = Math.min(1, maxWidth / img.width);
      const cw = Math.round(img.width * previewScale);
      const ch = Math.round(img.height * previewScale);
      previewCanvas.width = cw;
      previewCanvas.height = ch;
      previewCtx.clearRect(0,0,cw,ch);
      previewCtx.drawImage(img, 0, 0, cw, ch);

      const type = form.elements['watermarkType'].value;
      const position = form.elements['position'].value;
      const opacity = parseFloat(form.elements['opacity'].value || '0.5');
      const scaleValue = parseFloat(form.elements['scale'].value || '1');
      const rotateValue = parseFloat(form.elements['rotate'].value || '0');
      const fontSize = parseInt(form.elements['fontSize'].value || '48', 10);
      const text = form.elements['text'].value || '';
      const color = colorInput ? colorInput.value : '#ffffff';
      const offsetX = parseFloat(offsetXInput.value || '0.5');
      const offsetY = parseFloat(offsetYInput.value || '0.5');

      watermarkPreview.style.display = 'none';
      watermarkPreview.innerHTML = '';
      watermarkPreview.style.opacity = 1;
      watermarkPreview.style.background = 'transparent';

      previewCtx.save();
      if (type === 'text' && text) {
        const previewFontSize = Math.round(fontSize * scaleValue * previewScale * FONT_SIZE_MULTIPLIER);
        const fill = color;
        const shadowColor = `rgba(0,0,0,${Math.min(0.7, opacity + 0.2)})`;
        previewCtx.font = `${previewFontSize}px "Microsoft YaHei", "SimHei", "Arial", sans-serif`;
        previewCtx.textBaseline = 'middle';
        const textWidth = previewCtx.measureText(text).width;
        const { x, y } = getPreviewPosition(position, cw, ch, offsetX, offsetY, textWidth, previewFontSize, false);
        const textAlign = getTextAlign(position);
        previewCtx.fillStyle = shadowColor;
        previewCtx.textAlign = textAlign;
        previewCtx.translate(x, y);
        previewCtx.rotate((rotateValue * Math.PI) / 180);
        previewCtx.fillText(text, 0, 0);
        previewCtx.fillStyle = fill;
        previewCtx.fillText(text, 0, 0);
        previewCtx.setTransform(1, 0, 0, 1, 0, 0);
        watermarkPreview.style.display = 'flex';
        watermarkPreview.style.width = `${Math.max(textWidth, previewFontSize)}px`;
        watermarkPreview.style.height = `${previewFontSize}px`;
      }

      let overlayX = Math.round(cw * offsetX);
      let overlayY = Math.round(ch * offsetY);
      let overlayWidth = 0;
      let overlayHeight = 0;

      if (type === 'image') {
        const wmFile = form.elements['watermarkImage'].files[0];
        if (wmFile) {
          const wmImage = await loadImageFile(wmFile);
          const wmWidth = Math.round(cw * 0.25 * scaleValue);
          const wmHeight = Math.round(ch * 0.25 * scaleValue);
          const pos = getPreviewPosition(position, cw, ch, offsetX, offsetY, wmWidth, wmHeight, true);
          overlayX = pos.x;
          overlayY = pos.y;
          overlayWidth = wmWidth;
          overlayHeight = wmHeight;
          previewCtx.save();
          previewCtx.globalAlpha = opacity;
          previewCtx.translate(overlayX, overlayY);
          previewCtx.rotate((rotateValue * Math.PI) / 180);
          previewCtx.drawImage(wmImage, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
          previewCtx.restore();
          watermarkPreview.style.display = 'flex';
          watermarkPreview.style.width = `${wmWidth}px`;
          watermarkPreview.style.height = `${wmHeight}px`;
        }
      }
      previewCtx.restore();

      if (watermarkPreview.style.display !== 'none') {
        watermarkPreview.style.left = `${overlayX}px`;
        watermarkPreview.style.top = `${overlayY}px`;
        watermarkPreview.style.transform = `translate(-50%, -50%) rotate(${rotateValue}deg)`;
      }
    } catch (err) {
      console.error('Preview error', err);
    }
  }

  function setPositionDefaults(position) {
    const positions = {
      'top-left': [0.1, 0.1],
      'top-right': [0.9, 0.1],
      'center': [0.5, 0.5],
      'bottom-left': [0.1, 0.9],
      'bottom-right': [0.9, 0.9],
      'diagonal-left': [0.2, 0.8],
      'diagonal-right': [0.8, 0.2]
    };
    const [x, y] = positions[position] || [0.5, 0.5];
    offsetXInput.value = x;
    offsetYInput.value = y;
  }

  function updateType() {
    const type = form.elements['watermarkType'].value;
    const textInput = form.elements['text'];
    const watermarkInput = form.elements['watermarkImage'];

    if (type === 'text') {
      textOptions.style.display = '';
      imageOptions.style.display = 'none';
      if (textInput) textInput.required = true;
      if (watermarkInput) watermarkInput.required = false;
    } else {
      textOptions.style.display = 'none';
      imageOptions.style.display = '';
      if (textInput) textInput.required = false;
      if (watermarkInput) watermarkInput.required = true;
    }
    const position = form.elements['position'].value;
    setPositionDefaults(position);
    updatePreview();
  }

  form.addEventListener('change', (e) => {
    if (e.target.name === 'watermarkType') updateType();
  });

  form.elements['position'].addEventListener('change', () => { setPositionDefaults(form.elements['position'].value); updatePreview(); });
  op.addEventListener('input', () => { opVal.textContent = op.value; updatePreview(); });
  op.addEventListener('change', () => { opVal.textContent = op.value; updatePreview(); });
  scale.addEventListener('input', () => { scaleVal.textContent = scale.value; updatePreview(); });
  scale.addEventListener('change', () => { scaleVal.textContent = scale.value; updatePreview(); });
  rotate.addEventListener('input', () => { rotateVal.textContent = rotate.value; updatePreview(); });
  rotate.addEventListener('change', () => { rotateVal.textContent = rotate.value; updatePreview(); });
  scaleDec.addEventListener('click', () => { scale.value = Math.max(parseFloat(scale.min), parseFloat(scale.value) - parseFloat(scale.step)); scaleVal.textContent = scale.value; updatePreview(); });
  scaleInc.addEventListener('click', () => { scale.value = Math.min(parseFloat(scale.max), parseFloat(scale.value) + parseFloat(scale.step)); scaleVal.textContent = scale.value; updatePreview(); });
  rotateDec.addEventListener('click', () => { rotate.value = Math.max(parseFloat(rotate.min), parseFloat(rotate.value) - parseFloat(rotate.step)); rotateVal.textContent = rotate.value; updatePreview(); });
  rotateInc.addEventListener('click', () => { rotate.value = Math.min(parseFloat(rotate.max), parseFloat(rotate.value) + parseFloat(rotate.step)); rotateVal.textContent = rotate.value; updatePreview(); });

  resetButton.addEventListener('click', () => {
    scale.value = defaultSettings.scale;
    scaleVal.textContent = scale.value;
    rotate.value = defaultSettings.rotate;
    rotateVal.textContent = rotate.value;
    op.value = defaultSettings.opacity;
    opVal.textContent = op.value;
    updatePreview();
  });

  langButtons.forEach((button) => {
    button.addEventListener('click', () => {
      langButtons.forEach((item) => item.classList.remove('selected'));
      button.classList.add('selected');
      const lang = button.dataset.lang;
      const mapping = translations[lang] || translations.zh;
      Object.entries(mapping).forEach(([key, value]) => {
        const item = i18nElements[key];
        if (!item) return;
        if (item.tagName === 'INPUT' && item.type === 'text') {
          item.placeholder = value;
        } else {
          item.textContent = value;
        }
      });
      if (i18nElements.watermarkTextInput) {
        i18nElements.watermarkTextInput.placeholder = mapping.watermarkTextInput;
      }
      const positionOptions = document.querySelectorAll('#positionSelect option');
      positionOptions.forEach((option) => {
        const key = option.dataset.i18n;
        if (key && mapping[key]) {
          option.textContent = mapping[key];
        }
      });
    });
  });

  let dragging = false;
  let dragStart = null;

  watermarkPreview.addEventListener('mousedown', (event) => {
    dragging = true;
    dragStart = { x: event.clientX, y: event.clientY };
    watermarkPreview.classList.add('dragging');
    event.preventDefault();
  });

  window.addEventListener('mousemove', (event) => {
    if (!dragging) return;
    const rect = previewCanvas.getBoundingClientRect();
    const dx = event.clientX - dragStart.x;
    const dy = event.clientY - dragStart.y;
    const currentX = parseFloat(offsetXInput.value || '0.5') * rect.width;
    const currentY = parseFloat(offsetYInput.value || '0.5') * rect.height;
    const newX = currentX + dx;
    const newY = currentY + dy;
    offsetXInput.value = Math.min(1, Math.max(0, newX / rect.width));
    offsetYInput.value = Math.min(1, Math.max(0, newY / rect.height));
    dragStart = { x: event.clientX, y: event.clientY };
    updatePreview();
  });

  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    watermarkPreview.classList.remove('dragging');
  });

  // update preview on many input changes
  ['text','fontSize','position','opacity','scale','rotate'].forEach(name => {
    const el = form.elements[name];
    if (el) {
      el.addEventListener('input', updatePreview);
      el.addEventListener('change', updatePreview);
    }
  });
  colorSwatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      colorSwatches.forEach((item) => item.classList.remove('selected'));
      swatch.classList.add('selected');
      if (colorInput) colorInput.value = swatch.dataset.color;
      updatePreview();
    });
  });
  form.elements['watermarkType'].forEach(r => r.addEventListener('change', updatePreview));
  form.elements['photo'].addEventListener('change', updatePreview);
  if (form.elements['watermarkImage']) form.elements['watermarkImage'].addEventListener('change', updatePreview);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    result.innerHTML = '處理中...';
    const fd = new FormData(form);

    try {
      const res = await fetch('/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'watermarked.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      result.innerHTML = `<p>完成，圖片將自動下載。若未下載請點擊下面圖片：</p><a href="${url}" download="watermarked.png"><img src="${url}" alt="result" style="max-width:100%"/></a>`;
    } catch (err) {
      console.error(err);
      result.textContent = `處理錯誤：${err.message}`;
    }
  });

  updateType();
  updatePreview();
});
