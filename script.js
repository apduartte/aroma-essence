/* =========================================================
   Aromaéssence — script.js
   Módulos: config · utilidades · menu · header · reveal · produtos · formulário
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Configuração ---------- */
  const CONFIG = {
    // DDI + DDD + número, somente dígitos. Ex.: "5511999999999"
    whatsappNumber: '',
    brand: 'Aromaéssence',
    minIntervalMs: 3000 // evita envios repetidos em sequência
  };

  /* ---------- Utilidades ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const sanitize = (value) =>
    String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();

  const formatDateBR = (iso) => {
    const [y, m, d] = iso.split('-');
    return y && m && d ? `${d}/${m}/${y}` : iso;
  };

  const todayISO = () => {
    const t = new Date();
    t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
    return t.toISOString().split('T')[0];
  };

  let toastTimer;
  const toast = (message, duration = 4500) => {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), duration);
  };

  const copyToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback para contextos não seguros (ex.: file://)
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  };

  /* ---------- Marca JS ativo (habilita animações) ---------- */
  document.documentElement.classList.add('js');

  /* ---------- Menu mobile ---------- */
  const initMenu = () => {
    const button = $('#menuButton');
    const nav = $('#navLinks');
    if (!button || !nav) return;

    const setOpen = (open) => {
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      button.textContent = open ? '✕' : '☰';
      nav.classList.toggle('open', open);
    };

    button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); button.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && !e.target.closest('.header')) setOpen(false);
    });
    window.matchMedia('(min-width: 851px)').addEventListener('change', (mq) => { if (mq.matches) setOpen(false); });
  };

  /* ---------- Header com sombra ao rolar ---------- */
  const initHeader = () => {
    const header = $('#header');
    if (!header) return;
    let ticking = false;
    const update = () => { header.classList.toggle('scrolled', window.scrollY > 8); ticking = false; };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  };

  /* ---------- Animação de entrada (IntersectionObserver) ---------- */
  const initReveal = () => {
    const items = $$('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) { items.forEach((i) => i.classList.add('visible')); return; }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min((i % 3) * 80, 240)}ms`;
      observer.observe(el);
    });
  };

  /* ---------- Pré-seleção de produto no formulário ---------- */
  const initProductLinks = () => {
    const select = $('#produto');
    if (!select) return;
    $$('[data-product]').forEach((link) => {
      link.addEventListener('click', () => {
        const wanted = link.dataset.product;
        const exists = Array.from(select.options).some((o) => o.value === wanted || o.text === wanted);
        if (exists) {
          select.value = wanted;
          clearError(select);
        }
      });
    });
  };

  /* ---------- Formulário ---------- */
  const errorEl = (field) => $(`[data-error-for="${field.name}"]`);

  function showError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    const el = errorEl(field);
    if (el) el.textContent = message;
  }

  function clearError(field) {
    field.removeAttribute('aria-invalid');
    const el = errorEl(field);
    if (el) el.textContent = '';
  }

  const validators = {
    nome: (v) => (v.length < 2 ? 'Informe seu nome.' : ''),
    produto: (v) => (!v ? 'Selecione um produto.' : ''),
    quantidade: (v) => {
      if (!v) return '';
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 100000 ? '' : 'Use um número entre 1 e 100.000.';
    },
    data: (v) => (v && v < todayISO() ? 'Escolha uma data a partir de hoje.' : '')
  };

  const buildMessage = (d) =>
    [
      `Olá! Meu nome é ${d.nome}.`,
      `Tenho interesse em: ${d.produto}.`,
      d.quantidade ? `Quantidade aproximada: ${d.quantidade}.` : '',
      d.data ? `Data desejada: ${formatDateBR(d.data)}.` : '',
      d.mensagem ? `Detalhes: ${d.mensagem}` : ''
    ].filter(Boolean).join('\n');

  const initForm = () => {
    const form = $('#quoteForm');
    if (!form) return;

    const dateInput = $('#data');
    if (dateInput) dateInput.min = todayISO();

    let lastSubmit = 0;

    // Validação em tempo real após primeira interação
    Object.keys(validators).forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      field.addEventListener('blur', () => {
        const msg = validators[name](sanitize(field.value));
        msg ? showError(field, msg) : clearError(field);
      });
      field.addEventListener('input', () => { if (field.getAttribute('aria-invalid')) clearError(field); });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot: bots preenchem; humanos não veem
      if (form.elements.website && form.elements.website.value) return;

      const now = Date.now();
      if (now - lastSubmit < CONFIG.minIntervalMs) return;

      const data = {
        nome: sanitize(form.elements.nome.value),
        produto: sanitize(form.elements.produto.value),
        quantidade: sanitize(form.elements.quantidade.value),
        data: sanitize(form.elements.data.value),
        mensagem: sanitize(form.elements.mensagem.value)
      };

      let firstInvalid = null;
      Object.keys(validators).forEach((name) => {
        const field = form.elements[name];
        const msg = validators[name](data[name]);
        if (msg) { showError(field, msg); firstInvalid = firstInvalid || field; }
        else clearError(field);
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      lastSubmit = now;
      const message = buildMessage(data);
      const number = sanitize(CONFIG.whatsappNumber).replace(/\D/g, '');

      if (number) {
        const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        toast('Abrindo o WhatsApp com sua mensagem…');
        return;
      }

      try {
        const ok = await copyToClipboard(message);
        toast(ok
          ? 'Mensagem copiada! Configure o número do WhatsApp para ativar o envio direto.'
          : 'Não foi possível copiar automaticamente. Selecione e copie a mensagem exibida.');
        if (!ok) window.prompt('Copie a mensagem abaixo:', message);
      } catch {
        window.prompt('Copie a mensagem abaixo:', message);
      }
    });
  };

  /* ---------- Rodapé ---------- */
  const initYear = () => {
    const el = $('#year');
    if (el) el.textContent = new Date().getFullYear();
  };

  /* ---------- Init ---------- */
  const init = () => {
    initMenu();
    initHeader();
    initReveal();
    initProductLinks();
    initForm();
    initYear();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
