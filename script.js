document.addEventListener('DOMContentLoaded', () => {
  const mainForm = document.getElementById('booking-form');
  const mainMessage = document.getElementById('form-message');
  const modal = document.getElementById('service-modal');
  const modalDialog = modal?.querySelector('.modal__dialog');
  const modalServiceName = document.getElementById('modal-service-name');
  const modalServiceInput = document.getElementById('modal-service-input');
  const modalForm = document.getElementById('modal-form');
  const modalMessage = document.getElementById('modal-message');
  const tabs = Array.from(document.querySelectorAll('.service-tab'));
  const cards = Array.from(document.querySelectorAll('.service-card'));
  let lastFocus = null;

  function setService(service) {
    const value = service && service.trim() ? service.trim() : 'Запись на сервис';
    modalServiceName.textContent = value;
    modalServiceInput.value = value;
    if (modalMessage) modalMessage.textContent = 'Демо-режим: отправка в Telegram/email будет подключена перед публикацией. Данные не передаются.';
    const select = mainForm?.querySelector('[name="service"]');
    if (select) {
      const option = Array.from(select.options).find((item) => item.value === value || item.textContent.trim() === value);
      if (option) select.value = option.value;
    }
  }

  function openModal(service) {
    lastFocus = document.activeElement;
    setService(service);
    modal?.classList.add('is-open');
    modal?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modalForm?.querySelector('[name="name"]')?.focus({ preventScroll: true });
  }
  function closeModal() {
    modal?.classList.remove('is-open');
    modal?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    lastFocus?.focus?.({preventScroll: true});
  }
  document.querySelectorAll('[data-modal-open]').forEach((button) => button.addEventListener('click', (event) => {
    if (button.tagName === 'A') event.preventDefault();
    openModal(button.dataset.service || 'Запись на сервис');
  }));
  document.querySelectorAll('[data-modal-close]').forEach((button) => button.addEventListener('click', closeModal));
  document.addEventListener('keydown', (event) => {
    if (!modal?.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'Tab') {
      const focusables = Array.from(modalDialog.querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),a[href]')).filter(el => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  function formatPhone(raw) {
    let digits = String(raw || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits[0] === '8') digits = '7' + digits.slice(1);
    else if (digits[0] !== '7') digits = '7' + digits;
    digits = digits.slice(0, 11);
    const n = digits.slice(1);
    let output = '+7';
    if (n.length) output += ' (' + n.slice(0,3);
    if (n.length >= 3) output += ')';
    if (n.length > 3) output += ' ' + n.slice(3,6);
    if (n.length > 6) output += '-' + n.slice(6,8);
    if (n.length > 8) output += '-' + n.slice(8,10);
    return output;
  }
  document.querySelectorAll('[data-phone-mask]').forEach(input => {
    input.addEventListener('input', () => {input.value = formatPhone(input.value);});
    input.addEventListener('paste', () => setTimeout(() => {input.value=formatPhone(input.value);}, 0));
    input.addEventListener('blur', () => {if (input.value === '+7') input.value = '';});
  });

  const date = mainForm?.querySelector('[type="date"]');
  if (date) {
    const today = new Date();
    const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0,10);
    date.min = local;
  }

  mainForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    mainMessage.textContent = 'Демо: поля заполнены. Заявка не отправлена. Перед запуском подключим серверный обработчик и согласие на обработку персональных данных.';
  });
  modalForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    modalMessage.textContent = 'Форма заполнена, но это демонстрация: данные не отправлены. Для настоящих заявок потребуется подключение Telegram или email.';
  });

  function filterCards(category) {
    cards.forEach((card) => {
      const categories = (card.dataset.category || '').split(' ').filter(Boolean);
      card.classList.toggle('is-hidden', category !== 'all' && !categories.includes(category));
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      tabs.forEach((item) => {
        item.classList.remove('active');
        item.setAttribute('aria-selected', 'false');
        item.tabIndex = -1;
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected','true');
      tab.tabIndex = 0;
      filterCards(tab.dataset.category || 'all');
    });
    tab.addEventListener('keydown', (event) => {
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : null;
      if (next !== null) {event.preventDefault(); tabs[next].focus(); tabs[next].click();}
    });
    tab.tabIndex = index === 0 ? 0 : -1;
  });
  filterCards('all');
});
