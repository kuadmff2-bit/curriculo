(() => {
  const PHOTO_KEY = 'meucurriculo_photo_v1';
  const CORE_KEY = 'meucurriculo_v1';
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

  // Se o botão "Novo" apagou o currículo e recarregou a página,
  // o script roda antes do app.js e remove também a foto antiga.
  if (!localStorage.getItem(CORE_KEY) && localStorage.getItem(PHOTO_KEY)) {
    localStorage.removeItem(PHOTO_KEY);
  }

  const personalPanel = document.querySelector('#personal');
  const resumeHeader = document.querySelector('.resume-header');
  if (!personalPanel || !resumeHeader) return;

  const styles = document.createElement('style');
  styles.textContent = `
    .photo-uploader{border:1px solid var(--line);background:var(--surface2);border-radius:14px;padding:12px;margin:0 0 14px}
    .photo-uploader-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
    .photo-uploader-head strong{font-size:13px}
    .photo-uploader small{display:block;color:var(--muted);line-height:1.45;margin-top:7px}
    .photo-row{display:flex;align-items:center;gap:12px}
    .photo-editor-preview{width:62px;height:62px;border-radius:50%;object-fit:cover;border:2px solid var(--line);background:var(--surface);display:none;flex:0 0 auto}
    .photo-editor-preview.visible{display:block}
    .photo-controls{flex:1;min-width:0}
    .photo-controls input[type=file]{padding:8px;background:var(--surface)}
    .photo-controls .photo-remove{margin-top:8px;background:transparent;color:var(--danger);border:0;padding:0;font-size:12px;display:none}
    .photo-controls .photo-remove.visible{display:inline-block}
    .photo-message{font-size:12px;margin-top:7px;min-height:17px}
    .photo-message.error{color:var(--danger)}
    .photo-message.ok{color:#15803d}
    .resume-photo{width:92px;height:92px;border-radius:50%;object-fit:cover;object-position:center;border:3px solid var(--accent);flex:0 0 auto;background:#f3f4f6}
    .resume-header>div:first-of-type{flex:1;min-width:0}
    .resume.classic .resume-photo{margin:0 auto 14px}
    .resume.ats .resume-photo{display:none}
    @media(max-width:640px){.photo-row{align-items:flex-start}.resume-photo{margin-bottom:14px}.resume-header>div:first-of-type{margin-bottom:8px}}
    @media print{.resume-photo{width:25mm;height:25mm}}
  `;
  document.head.appendChild(styles);

  const uploader = document.createElement('div');
  uploader.className = 'photo-uploader';
  uploader.innerHTML = `
    <div class="photo-uploader-head">
      <strong>Foto profissional <span style="font-weight:500;color:var(--muted)">(opcional)</span></strong>
    </div>
    <div class="photo-row">
      <img class="photo-editor-preview" id="photoEditorPreview" alt="Prévia da foto">
      <div class="photo-controls">
        <input id="photoInput" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Escolher foto profissional">
        <button id="removePhotoBtn" class="photo-remove" type="button">Remover foto</button>
      </div>
    </div>
    <div id="photoMessage" class="photo-message" aria-live="polite"></div>
    <small>JPG, PNG ou WebP, até 5 MB. A imagem é redimensionada e os metadados são removidos antes de ser salva localmente. O modelo ATS não exibe foto.</small>
  `;

  const firstField = personalPanel.querySelector('label');
  personalPanel.insertBefore(uploader, firstField);

  const input = document.querySelector('#photoInput');
  const editorPreview = document.querySelector('#photoEditorPreview');
  const removeBtn = document.querySelector('#removePhotoBtn');
  const message = document.querySelector('#photoMessage');

  const resumePhoto = document.createElement('img');
  resumePhoto.className = 'resume-photo';
  resumePhoto.alt = 'Foto profissional';
  resumePhoto.hidden = true;
  resumeHeader.insertBefore(resumePhoto, resumeHeader.firstElementChild);

  function setMessage(text = '', type = '') {
    message.textContent = text;
    message.className = `photo-message${type ? ` ${type}` : ''}`;
  }

  function renderPhoto(dataUrl) {
    const hasPhoto = typeof dataUrl === 'string' && dataUrl.startsWith('data:image/');
    if (hasPhoto) {
      editorPreview.src = dataUrl;
      editorPreview.classList.add('visible');
      resumePhoto.src = dataUrl;
      resumePhoto.hidden = false;
      removeBtn.classList.add('visible');
    } else {
      editorPreview.removeAttribute('src');
      editorPreview.classList.remove('visible');
      resumePhoto.removeAttribute('src');
      resumePhoto.hidden = true;
      removeBtn.classList.remove('visible');
    }
  }

  function savePhoto(dataUrl) {
    try {
      localStorage.setItem(PHOTO_KEY, dataUrl);
      renderPhoto(dataUrl);
      setMessage('Foto adicionada e salva neste dispositivo.', 'ok');
    } catch {
      setMessage('Não foi possível salvar a foto neste dispositivo.', 'error');
    }
  }

  function processImage(file) {
    if (!ALLOWED_TYPES.has(file.type)) {
      setMessage('Use uma imagem JPG, PNG ou WebP.', 'error');
      input.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setMessage('A foto deve ter no máximo 5 MB.', 'error');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => setMessage('Não foi possível ler esta imagem.', 'error');
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => setMessage('A imagem selecionada parece inválida ou corrompida.', 'error');
      image.onload = () => {
        const width = image.naturalWidth;
        const height = image.naturalHeight;
        if (!width || !height || width > 12000 || height > 12000) {
          setMessage('A imagem tem dimensões inválidas ou grandes demais.', 'error');
          input.value = '';
          return;
        }

        const side = Math.min(width, height);
        const sx = Math.max(0, (width - side) / 2);
        const sy = Math.max(0, (height - side) / 2);
        const canvas = document.createElement('canvas');
        canvas.width = 480;
        canvas.height = 480;
        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, sx, sy, side, side, 0, 0, 480, 480);

        // Re-encodar pelo canvas remove EXIF e reduz o tamanho armazenado.
        const cleanDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        savePhoto(cleanDataUrl);
        input.value = '';
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (file) processImage(file);
  });

  removeBtn.addEventListener('click', () => {
    localStorage.removeItem(PHOTO_KEY);
    renderPhoto('');
    setMessage('Foto removida.', 'ok');
  });

  renderPhoto(localStorage.getItem(PHOTO_KEY) || '');
})();
