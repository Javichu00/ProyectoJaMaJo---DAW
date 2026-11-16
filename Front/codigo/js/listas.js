;(function () {


  let user    = null
  let listas  = []
  let activeListaId = null

  function getUser() {
    try { return JSON.parse(localStorage.getItem('JAM_user') || 'null') } catch { return null }
  }
  
  function getProfile() {
    try { return JSON.parse(localStorage.getItem('JAM_profile') || 'null') } catch { return null }
  }

  function esc(v) {
    return String(v ?? '')
      .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
      .replaceAll('"','&quot;').replaceAll("'",'&#39;')
  }

  function setError(id, msg) {
    const el = document.getElementById(id)
    if (!el) return
    el.hidden = !msg
    el.textContent = msg || ''
  }

  function showToast(msg, type = 'ok') {
    const colors = { ok: '#4ade80', err: '#f87171' }
    const t = document.createElement('div')
    t.style.cssText = `
      position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;
      padding:.75rem 1.25rem;border-radius:1rem;font-size:.82rem;font-weight:600;
      background:rgba(20,21,26,.98);border:1px solid rgba(204,211,217,.16);
      color:${colors[type]||colors.ok};box-shadow:0 12px 32px rgba(0,0,0,.5);
    `
    t.textContent = msg
    document.body.appendChild(t)
    setTimeout(() => t.remove(), 3000)
  }


  async function apiGetListas(idCuenta) {
    const r = await fetch(`${API_BASE}/listas/cuenta/${idCuenta}`)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  }

  async function apiCrearLista(idCuenta, nombre) {
    const r = await fetch(`${API_BASE}/listas/cuenta/${idCuenta}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre }),
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  }

  async function apiRenombrarLista(idLista, nombre) {
    const r = await fetch(`${API_BASE}/listas/${idLista}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre }),
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  }

  async function apiEliminarLista(idLista) {
    const r = await fetch(`${API_BASE}/listas/${idLista}`, { method: 'DELETE' })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
  }

  async function apiGetContenidos(idLista) {
    const r = await fetch(`${API_BASE}/listas/${idLista}/contenidos`)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  }

  async function apiQuitarContenido(idLista, idContenido) {
    const r = await fetch(`${API_BASE}/listas/${idLista}/contenidos/${idContenido}`, { method: 'DELETE' })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
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

  async function comprobarLimite(idCuenta) {
    const { limite, plan } = await getLimitePlan(idCuenta)
    if (listas.length >= limite) {
      const msg = limite === Infinity
        ? 'No puedes crear más listas.'
        : `Tu plan ${plan} solo permite ${limite} lista${limite === 1 ? '' : 's'} por cuenta. Mejora tu plan para crear más.`
      showToast(msg, 'err')
      return false
    }
    return true
  }


  let _modalResolve = null

  function openModal({ title, desc, confirmLabel = 'Confirmar', danger = false, withInput = false, inputValue = '', inputPlaceholder = 'Nombre de la lista' }) {
    return new Promise(resolve => {
      _modalResolve = resolve

      document.getElementById('modal-title').textContent = title
      const descEl = document.getElementById('modal-desc')
      if (desc) { descEl.textContent = desc; descEl.hidden = false }
      else descEl.hidden = true

      const inputEl = document.getElementById('modal-input')
      if (withInput) {
        inputEl.hidden = false
        inputEl.value = inputValue
        inputEl.placeholder = inputPlaceholder
        setTimeout(() => inputEl.focus(), 60)
      } else {
        inputEl.hidden = true
      }

      setError('modal-error', '')

      const confirmBtn = document.getElementById('modal-confirm')
      confirmBtn.textContent = confirmLabel
      confirmBtn.className = `listas-btn ${danger ? 'listas-btn--danger' : 'listas-btn--primary'}`

      document.getElementById('listas-modal').classList.add('is-open')
      document.body.classList.add('is-locked')
    })
  }

  function closeModal(val) {
    document.getElementById('listas-modal').classList.remove('is-open')
    document.body.classList.remove('is-locked')
    if (_modalResolve) { _modalResolve(val); _modalResolve = null }
  }

  function bindModal() {
    document.getElementById('modal-cancel').addEventListener('click', () => closeModal(null))
    document.getElementById('modal-backdrop').addEventListener('click', () => closeModal(null))
    document.getElementById('modal-confirm').addEventListener('click', () => {
      const inputEl = document.getElementById('modal-input')
      closeModal(inputEl.hidden ? true : inputEl.value.trim())
    })
    document.getElementById('modal-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const val = e.target.value.trim()
        closeModal(val)
      }
    })
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal(null)
    })
  }

  function buildListaCard(lista) {
    const count = lista._count ?? 0
    const preview = (lista._preview || []).slice(0, 4)

    const thumbs = preview.length
      ? preview.map(img => `<img src="${esc(img)}" alt="" />`).join('')
      : `<div class="lista-card__empty-thumb">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".4"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>
        </div>`

    return `
      <article class="lista-card" data-lista-id="${lista.id}" role="button" tabindex="0" aria-label="Abrir lista ${esc(lista.nombre)}">
        <div class="lista-card__thumbs lista-card__thumbs--${Math.min(preview.length, 4) || 'empty'}">
          ${thumbs}
        </div>
        <div class="lista-card__body">
          <h3 class="lista-card__name">${esc(lista.nombre)}</h3>
          <span class="lista-card__count">${count} ${count === 1 ? 'título' : 'títulos'}</span>
        </div>
      </article>
    `
  }

  function buildSkeletonGrid(n = 4) {
    return Array.from({ length: n }).map(() => `
      <div class="lista-card lista-card--skeleton" aria-hidden="true">
        <div class="lista-card__thumbs lista-card__thumbs--empty skeleton-shimmer"></div>
        <div class="lista-card__body">
          <span class="skeleton-line skeleton-line--lg skeleton-shimmer" style="height:1rem;border-radius:4px;display:block;margin-bottom:6px"></span>
          <span class="skeleton-line skeleton-line--sm skeleton-shimmer" style="height:.75rem;border-radius:4px;display:block;width:40%"></span>
        </div>
      </div>
    `).join('')
  }

  async function renderListas(idCuenta) {
    const grid = document.getElementById('listas-grid')
    grid.innerHTML = buildSkeletonGrid()
    setError('listas-error', '')

    try {
      const raw = await apiGetListas(idCuenta)
      listas = Array.isArray(raw) ? raw : []

      await Promise.all(listas.map(async lista => {
        try {
          const contenidos = await apiGetContenidos(lista.id)
          lista._count = Array.isArray(contenidos) ? contenidos.length : 0
          lista._preview = (Array.isArray(contenidos) ? contenidos : [])
            .slice(0, 4)
            .map(c => c.imagenUrl || c.imagen || '')
            .filter(Boolean)
          lista._contenidos = contenidos
        } catch {
          lista._count = 0
          lista._preview = []
          lista._contenidos = []
        }
      }))

      if (!listas.length) {
        grid.innerHTML = `
          <div class="listas-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".3"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>
            <p>Aún no tienes listas.<br>Crea una para guardar tus títulos favoritos.</p>
          </div>
        `
        return
      }

      grid.innerHTML = listas.map(buildListaCard).join('')

      grid.querySelectorAll('.lista-card').forEach(card => {
        card.addEventListener('click', () => openPanel(Number(card.dataset.listaId)))
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') openPanel(Number(card.dataset.listaId))
        })
      })

    } catch (err) {
      grid.innerHTML = ''
      setError('listas-error', 'No se pudieron cargar las listas: ' + err.message)
    }
  }

  function buildContenidoRow(contenido, idLista) {
    const isSerie = contenido.tipoContenido === 'SERIE'
    const href = isSerie ? `./serie.html?id=${contenido.id}` : `./pelicula.html?id=${contenido.id}`
    const year = contenido.fecha ? String(contenido.fecha).slice(0, 4) : '—'
    const img = contenido.imagenUrl || contenido.imagen || ''

    return `
      <div class="panel-row" data-contenido-id="${contenido.id}">
        <a class="panel-row__link" href="${href}" aria-label="Ver ${esc(contenido.tituloPrincipal)}">
          <div class="panel-row__poster">
            ${img
              ? `<img src="${esc(img)}" alt="${esc(contenido.tituloPrincipal)}" loading="lazy" />`
              : `<div class="panel-row__poster-fallback"></div>`}
          </div>
          <div class="panel-row__copy">
            <strong class="panel-row__title">${esc(contenido.tituloPrincipal || '—')}</strong>
            <span class="panel-row__meta">${isSerie ? 'Serie' : 'Película'} · ${year}</span>
            ${contenido.nota > 0 ? `<span class="panel-row__rating">★ ${Number(contenido.nota).toFixed(1)}</span>` : ''}
          </div>
        </a>
        <button class="listas-icon-btn listas-icon-btn--danger panel-row__remove"
          data-lista-id="${idLista}" data-contenido-id="${contenido.id}"
          title="Quitar de la lista" type="button">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
      </div>
    `
  }

  async function openPanel(idLista) {
    activeListaId = idLista
    const lista = listas.find(l => l.id === idLista)
    if (!lista) return

    document.getElementById('panel-title').textContent = lista.nombre
    document.getElementById('panel-count').textContent = ''
    document.getElementById('panel-contenidos').innerHTML = `<div class="panel-loading">Cargando…</div>`
    setError('panel-error', '')

    document.getElementById('lista-panel').classList.add('is-open')
    document.body.classList.add('is-locked')

    await loadPanelContenidos(lista)
  }

  async function loadPanelContenidos(lista) {
    try {
      const contenidos = Array.isArray(lista._contenidos) ? lista._contenidos : await apiGetContenidos(lista.id)
      lista._contenidos = contenidos
      lista._count = contenidos.length

      document.getElementById('panel-count').textContent =
        `${contenidos.length} ${contenidos.length === 1 ? 'título' : 'títulos'}`

      const container = document.getElementById('panel-contenidos')

      if (!contenidos.length) {
        container.innerHTML = `<div class="panel-empty">Esta lista está vacía.</div>`
        return
      }

      container.innerHTML = contenidos.map(c => buildContenidoRow(c, lista.id)).join('')

      container.querySelectorAll('.panel-row__remove').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idContenido = Number(btn.dataset.contenidoId)
          const idLista    = Number(btn.dataset.listaId)
          try {
            await apiQuitarContenido(idLista, idContenido)
            lista._contenidos = lista._contenidos.filter(c => c.id !== idContenido)
            lista._count = lista._contenidos.length
            lista._preview = lista._contenidos.slice(0, 4).map(c => c.imagenUrl || c.imagen || '').filter(Boolean)
            await loadPanelContenidos(lista)
            refreshCard(lista)
          } catch (err) {
            showToast('Error al quitar: ' + err.message, 'err')
          }
        })
      })
    } catch (err) {
      setError('panel-error', 'Error cargando contenidos: ' + err.message)
    }
  }

  function refreshCard(lista) {
    const card = document.querySelector(`.lista-card[data-lista-id="${lista.id}"]`)
    if (!card) return
    const temp = document.createElement('div')
    temp.innerHTML = buildListaCard(lista)
    const newCard = temp.firstElementChild
    newCard.addEventListener('click', () => openPanel(Number(newCard.dataset.listaId)))
    newCard.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openPanel(Number(newCard.dataset.listaId))
    })
    card.replaceWith(newCard)
  }

  function closePanel() {
    document.getElementById('lista-panel').classList.remove('is-open')
    document.body.classList.remove('is-locked')
    activeListaId = null
  }

  function bindPanel() {
    document.getElementById('btn-close-panel').addEventListener('click', closePanel)
    document.getElementById('lista-panel-backdrop').addEventListener('click', closePanel)

    document.getElementById('btn-rename').addEventListener('click', async () => {
      if (!activeListaId) return
      const lista = listas.find(l => l.id === activeListaId)
      if (!lista) return

      const nuevoNombre = await openModal({
        title: 'Renombrar lista',
        confirmLabel: 'Guardar',
        withInput: true,
        inputValue: lista.nombre,
        inputPlaceholder: 'Nuevo nombre',
      })
      if (!nuevoNombre) return
      try {
        await apiRenombrarLista(lista.id, nuevoNombre)
        lista.nombre = nuevoNombre
        document.getElementById('panel-title').textContent = nuevoNombre
        refreshCard(lista)
        showToast('Lista renombrada', 'ok')
      } catch (err) {
        showToast('Error: ' + err.message, 'err')
      }
    })

    document.getElementById('btn-delete-lista').addEventListener('click', async () => {
      if (!activeListaId) return
      const lista = listas.find(l => l.id === activeListaId)
      if (!lista) return
    
      const confirmed = await openModal({
        title: '¿Eliminar lista?',
        desc: `Se eliminará "${lista.nombre}" y todos sus títulos. Esta acción no se puede deshacer.`,
        confirmLabel: 'Sí, eliminar',
        danger: true,
      })
      if (!confirmed) return
      try {
        await apiEliminarLista(lista.id)
        listas = listas.filter(l => l.id !== lista.id)
        closePanel()
        const profile = getProfile()
        await renderListas(profile.idCuenta)
        showToast('Lista eliminada', 'ok')
      } catch (err) {
        showToast('Error: ' + err.message, 'err')
      }
    })
  }
  function bindNuevaLista() {
    document.getElementById('btn-nueva-lista').addEventListener('click', async () => {
      const profile = getProfile()

      try {
        const permitido = await comprobarLimite(profile.idCuenta)
        if (!permitido) return
      } catch {
        showToast('No se pudo comprobar el límite de listas.', 'err')
        return
      }

      const nombre = await openModal({
        title: 'Nueva lista',
        confirmLabel: 'Crear',
        withInput: true,
        inputPlaceholder: 'Nombre de la lista',
      })
      if (!nombre) return
      try {
        const nueva = await apiCrearLista(profile.idCuenta, nombre)
        nueva._count = 0
        nueva._preview = []
        nueva._contenidos = []
        listas.push(nueva)

        const emptyEl = document.querySelector('.listas-empty')
        if (emptyEl) {
          await renderListas(profile.idCuenta)
        } else {
          const grid = document.getElementById('listas-grid')
          const temp = document.createElement('div')
          temp.innerHTML = buildListaCard(nueva)
          const newCard = temp.firstElementChild
          newCard.addEventListener('click', () => openPanel(Number(newCard.dataset.listaId)))
          newCard.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') openPanel(Number(newCard.dataset.listaId))
          })
          grid.appendChild(newCard)
        }
        showToast('Lista creada', 'ok')
      } catch (err) {
        showToast('Error al crear: ' + err.message, 'err')
      }
    })
  }

  // ── Init ──────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    user = getUser()
    const profile = getProfile()
  
    if (!user?.email || !profile?.idCuenta) {
      window.location.href = './landing.html'
      return
    }

    bindModal()
    bindPanel()
    bindNuevaLista()
    await renderListas(profile.idCuenta)
  })

}())