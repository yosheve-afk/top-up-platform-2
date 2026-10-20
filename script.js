(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rp = n => 'Rp ' + n.toLocaleString('id-ID');

  const PACKS = [
    { r: 100, p: 15000 }, 
    { r: 400, p: 58000 }, 
    { r: 800, p: 112000, tag: 'Populer' },
    { r: 1700, p: 235000 }, 
    { r: 4500, p: 610000 }, 
    { r: 10000, p: 1340000, tag: 'Hemat' }
  ];
  
  const METHODS = { 
    username: 'Via Username', 
    gamepass: 'Via Gamepass', 
    login: 'Via Login' 
  };

  // LEADERBOARD DATA - Top Spenders
  const LEADERBOARD = [
    { name: 'xXDragonSlayerXx', amount: 50000 },
    { name: 'ProGamer2024', amount: 42000 },
    { name: 'RobloxKing', amount: 38500 },
    { name: 'MegaBuilder99', amount: 31200 },
    { name: 'PixelMaster_YT', amount: 28700 }
  ];

  const state = { 
    view: 'checkout', 
    method: 'username', 
    pack: null, 
    user: '', 
    oid: '', 
    timer: null 
  };

  /* ========== VIEW SWITCHING ========== */
  function go(view) {
    state.view = view;
    $$('.view').forEach(v => v.classList.toggle('is-active', v.id === 'view-' + view));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ========== RENDER LEADERBOARD ========== */
  const leaderboardEl = $('#leaderboard');
  LEADERBOARD.forEach((player, i) => {
    const div = document.createElement('div');
    div.className = 'lb-item';
    div.innerHTML = `
      <div class="lb-rank">${i + 1}</div>
      <div class="lb-info">
        <div class="lb-name">${player.name}</div>
        <div class="lb-amount"><strong>${player.amount.toLocaleString('id-ID')}</strong> R$</div>
      </div>
    `;
    leaderboardEl.appendChild(div);
  });

  /* ========== RENDER PACKS ========== */
  const packsEl = $('#packs');
  PACKS.forEach((k, i) => {
    const b = document.createElement('button');
    b.type = 'button'; 
    b.className = 'pack'; 
    b.setAttribute('role', 'radio'); 
    b.setAttribute('aria-checked', 'false');
    b.innerHTML = `${k.tag ? `<span class="pack__tag">${k.tag}</span>` : ''}
      <div class="pack__amt">${k.r.toLocaleString('id-ID')}<i>R$</i></div>
      <div class="pack__price">${rp(k.p)}</div>`;
    b.addEventListener('click', () => {
      state.pack = PACKS[i];
      $$('.pack').forEach(x => x.setAttribute('aria-checked', String(x === b)));
      $('#pack-err').textContent = '';
      renderSummary();
    });
    packsEl.appendChild(b);
  });

  function renderSummary() {
    $('#sum-method').textContent = METHODS[state.method];
    $('#sum-pack').textContent = state.pack ? `${state.pack.r.toLocaleString('id-ID')} R$` : 'Belum dipilih';
    $('#sum-total').textContent = state.pack ? rp(state.pack.p) : 'Rp 0';
  }

  /* ========== TABS ========== */
  $$('.tab').forEach(t => t.addEventListener('click', () => {
    state.method = t.dataset.method;
    $$('.tab').forEach(x => { 
      const on = x === t; 
      x.classList.toggle('is-active', on); 
      x.setAttribute('aria-selected', on); 
    });
    $$('.panel').forEach(p => p.classList.toggle('is-active', p.dataset.panel === state.method));
    renderSummary();
  }));

  /* ========== VALIDATION ========== */
  function validate() {
    let ok = true;
    const panel = $(`.panel[data-panel="${state.method}"]`);
    $$('.field', panel).forEach(f => {
      const i = $('input', f), e = $('.err', f), v = i.value.trim();
      let msg = '';
      if (!v) msg = 'Kolom ini wajib diisi.';
      else if (i.name.startsWith('u') && !/^[A-Za-z0-9_]{3,20}$/.test(v)) 
        msg = 'Username 3–20 karakter: huruf, angka, atau garis bawah.';
      else if (i.name === 'gp' && !/^https?:\/\/(www\.)?roblox\.com\/(game-pass|catalog)\/\d+/i.test(v)) 
        msg = 'Gunakan link gamepass Roblox yang valid.';
      f.classList.toggle('bad', !!msg); 
      e.textContent = msg;
      if (msg) ok = false;
    });
    if (!state.pack) { 
      $('#pack-err').textContent = 'Pilih salah satu paket Robux.'; 
      ok = false; 
    }
    if (!ok) { 
      const first = $('.bad input') || packsEl; 
      first.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
      if (first.focus) first.focus({ preventScroll: true }); 
    }
    return ok;
  }

  /* ========== GUIDE MODAL ========== */
  const guideModal = $('#guide-modal');
  const showGuideBtn = $('#btn-show-guide');
  const closeGuideBtn = $('#btn-close-guide');
  const guideOverlay = $('#guide-overlay');

  function openGuideModal() {
    guideModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeGuideModal() {
    guideModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  showGuideBtn.addEventListener('click', openGuideModal);
  closeGuideBtn.addEventListener('click', closeGuideModal);
  guideOverlay.addEventListener('click', closeGuideModal);

  // Accordion functionality
  $$('.accordion__header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion__item');
      const isOpen = item.classList.contains('is-open');
      
      // Close all other items (single-open behavior)
      $$('.accordion__item').forEach(i => i.classList.remove('is-open'));
      
      // Toggle current item
      if (!isOpen) item.classList.add('is-open');
    });
  });

  // Close modal on ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !guideModal.hasAttribute('hidden')) {
      closeGuideModal();
    }
  });

  /* ========== FAKE QRIS GENERATOR ========== */
  function drawQR() {
    const N = 29, c = 8, seed = Date.now() % 9973;
    let rnd = seed; 
    const next = () => (rnd = (rnd * 9301 + 49297) % 233280) / 233280;
    const finder = (x, y) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
    let out = `<svg viewBox="0 0 ${N * c} ${N * c}" shape-rendering="crispEdges">`;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (!finder(x, y) && next() > .52) {
          out += `<rect x="${x * c}" y="${y * c}" width="${c}" height="${c}" fill="#1E2433"/>`;
        }
      }
    }
    [[0, 0], [N - 7, 0], [0, N - 7]].forEach(([x, y]) => {
      out += `<rect x="${x * c}" y="${y * c}" width="${7 * c}" height="${7 * c}" fill="#1E2433"/>`;
      out += `<rect x="${(x + 1) * c}" y="${(y + 1) * c}" width="${5 * c}" height="${5 * c}" fill="#fff"/>`;
      out += `<rect x="${(x + 2) * c}" y="${(y + 2) * c}" width="${3 * c}" height="${3 * c}" fill="#2F6BFF"/>`;
    });
    $('#qr').innerHTML = out + '</svg>';
  }

  function startTimer() {
    let s = 15 * 60; 
    clearInterval(state.timer);
    const tick = () => { 
      $('#timer').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; 
      if (s-- <= 0) clearInterval(state.timer); 
    };
    tick(); 
    state.timer = setInterval(tick, 1000);
  }

  /* ========== STATE 1 -> 2 (CHECKOUT TO PAYMENT) ========== */
  $('#order-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;
    const panel = $(`.panel[data-panel="${state.method}"]`);
    state.user = $('input[name^="u"]', panel).value.trim();
    state.oid = 'RT-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    $('#pay-pack').textContent = `${state.pack.r.toLocaleString('id-ID')} R$ · ${METHODS[state.method]}`;
    $('#pay-total').textContent = rp(state.pack.p);
    drawQR(); 
    startTimer(); 
    go('payment');
  });

  $('#btn-back').addEventListener('click', () => { 
    clearInterval(state.timer); 
    go('checkout'); 
  });

  /* ========== STATE 2 -> 3 (PAYMENT TO PROCESSING) ========== */
  $('#btn-paid').addEventListener('click', () => {
    clearInterval(state.timer);
    $('#oid-proc').textContent = state.oid;
    go('processing');
    $('#admin-empty').hidden = true;
    $('#admin-order').hidden = false;
    $('#admin-dot').classList.add('live');
    $('#admin-detail').textContent = `${state.oid} · @${state.user} · ${state.pack.r.toLocaleString('id-ID')} R$ · ${METHODS[state.method]}`;
    $('#admin').classList.remove('is-closed');
  });

  /* ========== STATE 3 -> 4 (PROCESSING TO SUCCESS) ========== */
  $('#btn-approve').addEventListener('click', () => {
    if (state.view !== 'processing') return;
    $('#ok-pack').textContent = `${state.pack.r.toLocaleString('id-ID')} R$`;
    $('#ok-user').textContent = '@' + state.user;
    $('#oid-ok').textContent = state.oid;
    $('#admin-order').hidden = true; 
    $('#admin-empty').hidden = false;
    $('#admin-empty').textContent = 'Pesanan disetujui. Tidak ada antrean.';
    $('#admin-dot').classList.remove('live');
    go('success');
  });

  /* ========== RESET / ADMIN TOGGLE ========== */
  $('#btn-new').addEventListener('click', () => {
    state.pack = null; 
    $$('.pack').forEach(x => x.setAttribute('aria-checked', 'false'));
    $$('input').forEach(i => i.value = ''); 
    $$('.field').forEach(f => f.classList.remove('bad')); 
    $$('.err').forEach(e => e.textContent = '');
    $('#admin-empty').textContent = 'Belum ada pesanan masuk.';
    renderSummary(); 
    go('checkout');
  });

  $('#admin-toggle').addEventListener('click', () => {
    const closed = $('#admin').classList.toggle('is-closed');
    $('#admin-toggle').setAttribute('aria-expanded', String(!closed));
  });

  renderSummary();
})();
