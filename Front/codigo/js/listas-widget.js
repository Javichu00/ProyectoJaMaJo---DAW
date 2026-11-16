;(function () {

  function getUser() {
    try { return JSON.parse(localStorage.getItem('JAM_user') || 'null') } catch { return null }
  }

  function getProfile() {
    try { return JSON.parse(localStorage.getItem('JAM_profile') || 'null') } catch { return null }
  }

  function esc(v) {
    return String(v ?? '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;').replaceAll("'", '&#39;')
  }

  function showToast(msg, type = 'ok') {
    const colors = { ok: '#4ade80', err: '#f87171' }
    const t = document.createElement('div')
    t.style.cssText = `
      position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;
      padding:.75rem 1.25rem;border-radius:1rem;font-size:.82rem;font-weight:600;
      background:rgba(20,21,26,.98);border:1px solid rgba(204,211,217,.16);
      color:${colors[type] || colors.ok};box-shadow:0 12px 32px rgba(0,0,0,.5);
      pointer-events:none;
    `
    t.textContent = msg
    document.body.appendChild(t)
    setTimeout(() => t.remove(), 3000)
  }

  const LIMITES_PLAN = { GRATIS: 1, ANUNCIOS: 3, ESTANDAR: 6, PRO: Infinity }

  async function getLimitePlan(idCuenta) {
    const cuentaRes = await fetch(`${API_BASE}/cuentas/id/${idCuenta}`)
    const cuenta = await cuentaRes.json()
    const usuarioRes = await fetch(`${API_BASE}/usuarios/${cuenta.email}`)
    const usuario = await usuarioRes.json()
    const plan = usuario.nombrePlan?.toUpperCase() ?? 'GRATIS'
    return { limite: LIMITES_PLAN[plan] ?? 1, plan: usuario.nombrePlan }
  }

  async function getListas(idCuenta) {
    const r = await fetch(`${API_BASE}/listas/cuenta/${idCuenta}`)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  }

  async function crearLista(idCuenta, nombre) {
    const r = await fetch(`${API_BASE}/listas/cuenta/${idCuenta}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre }),
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  }

  async function getContenidosLista(idLista) {
    const r = await fetch(`${API_BASE}/listas/${idLista}/contenidos`)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  }

  async function addContenido(idLista, idContenido) {
    const r = await fetch(`${API_BASE}/listas/${idLista}/contenidos/${idContenido}`, { method: 'POST' })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
  }

  async function removeContenido(idLista, idContenido) {
    const r = await fetch(`${API_BASE}/listas/${idLista}/contenidos/${idContenido}`, { method: 'DELETE' })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
  }

  function renderListaItems(listas, contenidoEnListas) {
    if (!listas.length) {
      return `<div class="lw-empty">No tienes listas todavía.<br>Crea una abajo.</div>`
    }

    return listas.map(lista => {
      const enEsta = contenidoEnListas.has(lista.id)
      return `
        <button class="lw-lista-item ${enEsta ? 'is-added' : ''}" type="button"
          data-lista-id="${lista.id}" data-en-lista="${enEsta}">
          <span class="lw-lista-icon">
            ${enEsta
              ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
              : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`
            }
          </span>
          <span class="lw-lista-name">${esc(lista.nombre)}</span>
          <span class="lw-lista-count">${lista._count != null ? lista._count : ''}</span>
        </button>
      `
    }).join('')
  }

  function buildPopup() {
    const existing = document.getElementById('listas-widget-popup')
    if (existing) existing.remove()

    const popup = document.createElement('div')
    popup.id = 'listas-widget-popup'
    popup.innerHTML = `
      <div class="lw-backdrop" id="lw-backdrop"></div>
      <div class="lw-box" id="lw-box">
        <div class="lw-head">
          <h3 class="lw-title">Añadir a una lista</h3>
          <button class="lw-close" id="lw-close" type="button" aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m6 6 12 12"/><path d="M18 6 6 18"/>
            </svg>
          </button>
        </div>
        <div class="lw-body" id="lw-body">
          <div class="lw-loading">Cargando listas…</div>
        </div>
        <button class="lw-nueva-toggle" id="lw-nueva-toggle" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nueva lista
        </button>
        <div class="lw-footer" id="lw-footer" hidden>
          <input class="lw-input" id="lw-nueva-input" type="text" maxlength="60" placeholder="Nombre de la nueva lista" />
          <button class="lw-btn lw-btn--primary" id="lw-nueva-confirm" type="button">Crear y añadir</button>
        </div>
      </div>
    `
    document.body.appendChild(popup)
    return popup
  }

  async function openListasPopup(idContenido, btnGuardar) {
    const user = getUser()
    const profile = getProfile()
    if (!user?.email) { window.location.href = './landing.html'; return }

    const popup = buildPopup()
    injectStyles()

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        popup.classList.add('is-open')
      })
    })

    document.body.classList.add('is-locked')

    const body    = popup.querySelector('#lw-body')
    const footer  = popup.querySelector('#lw-footer')
    const toggle  = popup.querySelector('#lw-nueva-toggle')
    const input   = popup.querySelector('#lw-nueva-input')
    const confirm = popup.querySelector('#lw-nueva-confirm')
    const closeBtn  = popup.querySelector('#lw-close')
    const backdrop  = popup.querySelector('#lw-backdrop')

    function close() {
      popup.classList.remove('is-open')
      document.body.classList.remove('is-locked')
      setTimeout(() => popup.remove(), 300)
    }

    closeBtn.addEventListener('click', close)
    backdrop.addEventListener('click', close)

    const onKey = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey) } }
    document.addEventListener('keydown', onKey)

    let listas = []
    let contenidoEnListas = new Set()

    try {
      listas = await getListas(profile.idCuenta)

      const checks = await Promise.all(
        listas.map(async lista => {
          try {
            const contenidos = await getContenidosLista(lista.id)
            lista._count = Array.isArray(contenidos) ? contenidos.length : 0
            const tiene = Array.isArray(contenidos) && contenidos.some(c => Number(c.id) === Number(idContenido))
            return { id: lista.id, tiene }
          } catch {
            lista._count = 0
            return { id: lista.id, tiene: false }
          }
        })
      )

      checks.forEach(({ id, tiene }) => { if (tiene) contenidoEnListas.add(id) })
      body.innerHTML = renderListaItems(listas, contenidoEnListas)

    } catch {
      body.innerHTML = `<div class="lw-error">No se pudieron cargar las listas.</div>`
      return
    }

    body.addEventListener('click', async e => {
      const btn = e.target.closest('[data-lista-id]')
      if (!btn) return

      const idLista = Number(btn.dataset.listaId)
      const enLista = btn.dataset.enLista === 'true'

      btn.disabled = true

      try {
        if (enLista) {
          await removeContenido(idLista, idContenido)
          contenidoEnListas.delete(idLista)
          const lista = listas.find(l => l.id === idLista)
          if (lista) lista._count = Math.max(0, (lista._count || 1) - 1)
          showToast('Quitado de la lista', 'ok')
        } else {
          await addContenido(idLista, idContenido)
          contenidoEnListas.add(idLista)
          const lista = listas.find(l => l.id === idLista)
          if (lista) lista._count = (lista._count || 0) + 1
          showToast('Añadido a la lista ✓', 'ok')
        }

        body.innerHTML = renderListaItems(listas, contenidoEnListas)
        actualizarBtnPrincipal()

      } catch (err) {
        showToast('Error: ' + err.message, 'err')
        btn.disabled = false
      }
    })

    toggle.addEventListener('click', async () => {
      const abriendo = footer.hidden

      if (abriendo) {
  
        try {
          const { limite, plan } = await getLimitePlan(profile.idCuenta)
          if (listas.length >= limite) {
            const msg = limite === Infinity
              ? 'No puedes crear más listas.'
              : `Tu plan ${plan} solo permite ${limite} lista${limite === 1 ? '' : 's'}. Mejora tu plan para crear más.`
            showToast(msg, 'err')
            return
          }
        } catch {
          showToast('No se pudo comprobar el límite de listas.', 'err')
          return
        }
      }

      footer.hidden = !abriendo
      toggle.classList.toggle('is-open', abriendo)
      if (abriendo) input.focus()
    })

    async function handleCrear() {
      const nombre = input.value.trim()
      if (!nombre) { input.focus(); return }

      confirm.disabled = true
      try {
        const nueva = await crearLista(profile.idCuenta, nombre)
        await addContenido(nueva.id, idContenido)
        nueva._count = 1
        contenidoEnListas.add(nueva.id)
        listas.push(nueva)
        body.innerHTML = renderListaItems(listas, contenidoEnListas)
        input.value = ''
        footer.hidden = true
        toggle.classList.remove('is-open')
        showToast(`Lista "${nombre}" creada ✓`, 'ok')
        actualizarBtnPrincipal()
      } catch (err) {
        showToast('Error: ' + err.message, 'err')
      } finally {
        confirm.disabled = false
      }
    }

    confirm.addEventListener('click', handleCrear)
    input.addEventListener('keydown', e => { if (e.key === 'Enter') handleCrear() })

    function actualizarBtnPrincipal() {
      if (!btnGuardar) return
      const enAlguna = contenidoEnListas.size > 0
      btnGuardar.textContent = enAlguna ? '✓ En tu lista' : '+ Mi lista'
      btnGuardar.classList.toggle('is-saved', enAlguna)
    }
  }

  function injectStyles() {
    if (document.getElementById('listas-widget-styles')) return
    const style = document.createElement('style')
    style.id = 'listas-widget-styles'
    style.textContent = `
      body.is-locked { overflow: hidden; }

      #listas-widget-popup {
        position: fixed;
        inset: 0;
        z-index: 9000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.22s ease;
      }
      #listas-widget-popup.is-open {
        opacity: 1;
        pointer-events: auto;
      }

      .lw-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,.72);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
      }

      .lw-box {
        position: relative;
        z-index: 1;
        width: min(400px, 100%);
        border-radius: 1.4rem;
        border: 1px solid rgba(204,211,217,.14);
        background: linear-gradient(180deg, rgba(32,33,40,.99) 0%, rgba(13,13,13,1) 100%);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        max-height: 80vh;
        transform: translateY(8px);
        transition: transform 0.26s cubic-bezier(0.22,1,0.36,1);
      }
      #listas-widget-popup.is-open .lw-box {
        transform: translateY(0);
      }

      .lw-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 20px 14px;
        border-bottom: 1px solid rgba(204,211,217,.08);
        flex-shrink: 0;
      }
      .lw-title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: rgba(204,211,217,.95);
      }

      .lw-close {
        width: 30px; height: 30px;
        border-radius: 50%;
        border: 1px solid rgba(204,211,217,.14);
        background: rgba(52,56,64,.4);
        color: rgba(204,211,217,.7);
        display: grid; place-content: center;
        cursor: pointer;
        transition: background .15s ease, color .15s ease;
        flex-shrink: 0;
      }
      .lw-close:hover { background: rgba(52,56,64,.8); color: #fff; }

      .lw-body {
        flex: 1;
        overflow-y: auto;
        padding: 8px 10px;
        scrollbar-width: thin;
        scrollbar-color: rgba(204,211,217,.15) transparent;
      }

      .lw-loading, .lw-empty, .lw-error {
        padding: 2rem 1rem;
        text-align: center;
        font-size: .84rem;
        color: rgba(204,211,217,.42);
        line-height: 1.6;
      }
      .lw-error { color: rgba(255,120,120,.8); }

      .lw-lista-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 11px 10px;
        border-radius: .8rem;
        border: none;
        background: transparent;
        color: rgba(204,211,217,.78);
        cursor: pointer;
        font-family: inherit;
        font-size: .9rem;
        text-align: left;
        transition: background .15s ease, color .15s ease;
      }
      .lw-lista-item:hover { background: rgba(52,56,64,.4); color: #fff; }
      .lw-lista-item.is-added { color: #4ade80; }
      .lw-lista-item.is-added:hover { background: rgba(74,222,128,.08); }
      .lw-lista-item:disabled { opacity: .5; cursor: default; pointer-events: none; }

      .lw-lista-icon {
        width: 24px; height: 24px;
        border-radius: 50%;
        border: 1.5px solid currentColor;
        display: grid; place-content: center;
        flex-shrink: 0;
        opacity: .75;
        transition: opacity .15s ease;
      }
      .lw-lista-item.is-added .lw-lista-icon { opacity: 1; }

      .lw-lista-name {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 500;
      }
      .lw-lista-count { font-size: .72rem; opacity: .4; flex-shrink: 0; }

      .lw-nueva-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        padding: 12px 20px;
        border: none;
        border-top: 1px solid rgba(204,211,217,.08);
        background: transparent;
        color: rgba(204,211,217,.45);
        font-family: inherit;
        font-size: .75rem;
        font-weight: 600;
        letter-spacing: .1em;
        text-transform: uppercase;
        cursor: pointer;
        transition: color .15s ease, background .15s ease;
        flex-shrink: 0;
      }
      .lw-nueva-toggle:hover,
      .lw-nueva-toggle.is-open { color: rgba(204,211,217,.9); background: rgba(52,56,64,.25); }

      .lw-footer {
        padding: 10px 12px 14px;
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }

      .lw-input {
        flex: 1;
        min-height: 40px;
        border-radius: .7rem;
        border: 1px solid rgba(204,211,217,.16);
        background: rgba(52,56,64,.4);
        color: rgba(204,211,217,.92);
        padding: 0 12px;
        font-family: inherit;
        font-size: .88rem;
        outline: none;
        transition: border-color .18s ease;
      }
      .lw-input:focus { border-color: rgba(204,211,217,.38); }
      .lw-input::placeholder { color: rgba(204,211,217,.28); }

      .lw-btn--primary {
        min-height: 40px;
        padding: 0 16px;
        border-radius: .7rem;
        border: none;
        background: rgba(204,211,217,.92);
        color: #0d0d0d;
        font-family: inherit;
        font-size: .76rem;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
        cursor: pointer;
        white-space: nowrap;
        transition: opacity .18s ease;
      }
      .lw-btn--primary:hover { opacity: .85; }
      .lw-btn--primary:disabled { opacity: .45; cursor: default; }

      .detalle-btn.is-saved {
        border-color: rgba(74,222,128,.45) !important;
        color: #4ade80 !important;
      }
    `
    document.head.appendChild(style)
  }

  // ── API pública ───────────────────────────────────────────────
  window.JAM_LISTAS = {
    bindGuardarBtn(btnGuardar, idContenido) {
      if (!btnGuardar || !idContenido) return
      injectStyles()

      btnGuardar.addEventListener('click', async (e) => {
        e.stopPropagation()
        const user = getUser()
        if (!user?.email) { window.location.href = './landing.html'; return }
        await openListasPopup(Number(idContenido), btnGuardar)
      })
    }
  }

}())