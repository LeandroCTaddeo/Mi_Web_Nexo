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

  submitButton.disabled = true;
  submitButton.textContent = 'Enviando…';
  form.setAttribute('aria-busy', 'true');
  result.textContent = '';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
    });
    const data = await response.json();

    if (!response.ok || data.success === false || data.success === 'false') {
      throw new Error(data.message || 'El servicio no pudo recibir la solicitud.');
    }

    form.reset();
    result.textContent = 'Solicitud recibida. Si es el primer envío, confirmá la activación desde el correo de Nexo para empezar a recibir las consultas.';
  } catch (error) {
    result.textContent = 'No se pudo enviar. Revisá tu conexión e intentá de nuevo en unos minutos.';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    form.removeAttribute('aria-busy');
  }
});
