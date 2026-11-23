'use strict';

/* ==========================================================
   Aromaéssence — script.js
   Único ponto de configuração: CONFIG.whatsappNumber
   (DDI + DDD + número, somente dígitos).
   ========================================================== */
const CONFIG = {
  whatsappNumber: '5511972307467',
  defaultMessage: 'Olá! Gostaria de fazer um pedido.',
};

const $ = (selector, ctx = document) => ctx.querySelector(selector);
const $$ = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));

function whatsappUrl(text) {
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

/* Links com data-wa: o href do HTML funciona sem JS; aqui ele é
   regenerado a partir de CONFIG para manter um número único. */
function initWhatsAppLinks() {
  $$('a[data-wa]').forEach((link) => {
    const message = link.dataset.msg || CONFIG.defaultMessage;
    link.href = whatsappUrl(message);
    link.target = '_blank';
    link.rel = 'noopener';
  });
}

function initYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------- Toast ---------- */
let toastTimer;
function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
}

/* ---------- Menu mobile ---------- */
function initMenu() {
  const button = $('#menuButton');
  const nav = $('#navLinks');
  if (!button || !nav) return;

  const desktop = window.matchMedia('(min-width: 900px)');

  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  button.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); button.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !button.contains(e.target)) setOpen(false);
  });
  desktop.addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}

/* ---------- Header com sombra ao rolar ---------- */
function initHeader() {
  const header = $('#header');
  if (!header) return;
  const update = () => header.classList.toggle('scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ---------- Animações de entrada ---------- */
function initReveal() {
  const items = $$('.reveal');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => observer.observe(el));
}

/* ---------- Formulário ---------- */
function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDateBR(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function setError(form, name, message) {
  const field = form.elements[name];
  const slot = $(`[data-error-for="${name}"]`, form);
  if (slot) slot.textContent = message || '';
  if (field) {
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  }
}

function validate(form) {
  const errors = {};
  const nome = form.elements.nome.value.trim();
  const produto = form.elements.produto.value;
  const quantidade = form.elements.quantidade.value.trim();
  const data = form.elements.data.value;

  if (nome.length < 2) errors.nome = 'Informe seu nome.';
  if (!produto) errors.produto = 'Selecione uma opção.';

  if (quantidade) {
    const n = Number(quantidade);
    if (!Number.isInteger(n) || n < 1 || n > 1000) errors.quantidade = 'Informe um número inteiro entre 1 e 1000.';
  }
  if (data && data < todayISO()) errors.data = 'Escolha uma data a partir de hoje.';

  ['nome', 'produto', 'quantidade', 'data'].forEach((name) => setError(form, name, errors[name]));
  return errors;
}

function buildMessage(form) {
  const v = (name) => form.elements[name].value.trim();
  const lines = [
    'Olá! Gostaria de fazer um pedido na Aromaéssence.',
    `Nome: ${v('nome')}`,
    `Interesse: ${v('produto')}`,
  ];
  if (v('fragrancia')) lines.push(`Fragrância: ${v('fragrancia')}`);
  if (v('quantidade')) lines.push(`Quantidade: ${v('quantidade')}`);
  if (v('data')) lines.push(`Data desejada: ${formatDateBR(v('data'))}`);
  if (v('mensagem')) lines.push(`Observações: ${v('mensagem')}`);
  return lines.join('\n');
}

function openUrl(url) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function initForm() {
  const form = $('#quoteForm');
  if (!form) return;

  const dateInput = form.elements.data;
  if (dateInput) dateInput.min = todayISO();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errors = validate(form);
    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      form.elements[firstInvalid].focus();
      return;
    }

    const message = buildMessage(form);

    if (!CONFIG.whatsappNumber) {
      try {
        await navigator.clipboard.writeText(message);
        showToast('Mensagem copiada. Cole no WhatsApp para enviar.');
      } catch {
        showToast('Não foi possível abrir o WhatsApp.');
      }
      return;
    }

    openUrl(whatsappUrl(message));
    showToast('Abrindo o WhatsApp com a mensagem pronta…');
  });

  form.addEventListener('input', (e) => {
    const name = e.target.name;
    if (name && e.target.getAttribute('aria-invalid') === 'true') setError(form, name, '');
  });
}

function init() {
  initWhatsAppLinks();
  initYear();
  initMenu();
  initHeader();
  initReveal();
  initForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
