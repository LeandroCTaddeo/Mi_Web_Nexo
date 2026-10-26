const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');
menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
  navigation?.classList.toggle('is-open', !isOpen);
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menú');
  });
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const screenshotDialog = document.querySelector('#screenshot-dialog');
const dialogImage = document.querySelector('#dialog-image');
const dialogCaption = document.querySelector('#dialog-caption');

document.querySelectorAll('.screenshot-trigger').forEach((button) => {
  button.addEventListener('click', () => {
    if (!screenshotDialog || !dialogImage || !dialogCaption) return;
    const image = button.querySelector('img');
    dialogImage.src = button.dataset.image;
    dialogImage.alt = image?.alt || 'Captura ampliada de Nexo';
    dialogCaption.textContent = button.dataset.caption || '';
    screenshotDialog.showModal();
  });
});

screenshotDialog?.addEventListener('click', (event) => {
  if (event.target === screenshotDialog) screenshotDialog.close();
});

document.querySelector('#demo-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const result = document.querySelector('#form-result');
  const submitButton = form.querySelector('[type="submit"]');
  const originalButtonText = submitButton.textContent;
  const payload = Object.fromEntries(new FormData(form).entries());

  submitButton.disabled = true;
  submitButton.textContent = 'Enviando…';
  form.setAttribute('aria-busy', 'true');
  result.textContent = '';

  const controller = new AbortController();
  const abortId = setTimeout(() => controller.abort(), 30000);

  const request = fetch(form.action, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
    keepalive: true,
    signal: controller.signal,
  })
    .then(async (response) => {
      let data = {};
      try { data = await response.json(); } catch {}
      if (!response.ok || data.success === false || data.success === 'false') {
        throw new Error(data.message || `Error HTTP ${response.status}`);
      }
      return 'ok';
    })
    .finally(() => clearTimeout(abortId));

  const slow = new Promise((resolve) => setTimeout(() => resolve('slow'), 3000));

  const restoreForm = (message) => {
    Object.entries(payload).forEach(([name, value]) => {
      const field = form.elements[name];
      if (field && name !== '_honey' && field.type !== 'hidden') field.value = value;
    });
    result.textContent = message;
  };

  try {
    const first = await Promise.race([request, slow]);
    form.reset();
    result.textContent = '¡Solicitud recibida! Te vamos a contactar a la brevedad.';

    if (first === 'slow') {
      request.catch((error) => {
        console.error('Error de FormSubmit (segundo plano):', error);
        restoreForm('No pudimos confirmar el envío. Revisá tus datos y volvé a intentarlo.');
      });
    }
  } catch (error) {
    console.error('Error de FormSubmit:', error);
    restoreForm(
      error instanceof TypeError
        ? 'No se pudo conectar con el servicio. Intentá de nuevo en unos minutos.'
        : `No se pudo enviar: ${error.message}`
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    form.removeAttribute('aria-busy');
  }
});