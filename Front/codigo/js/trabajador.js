;(function () {

    const esc =
      window.JAM?.escapeHtml ||
      ((v) =>
        String(v ?? '')
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#39;'))
    function getId() {
      return new URLSearchParams(window.location.search).get('id')
    }
  
    function getYear(fecha) {
      return fecha ? fecha.substring(0, 4) : ''
    }
  
    function getInitials(nombre) {
      if (!nombre) return '?'
      return nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    }
  
    function formatType(tipo) {
      const t = String(tipo || '').toUpperCase()
      if (t === 'PELICULA') return 'Pela­cula'
      if (t === 'SERIE') return 'Serie'
      return tipo || 'â€”'
    }
  
    function backSvg() {
      return `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m15 6-6 6 6 6"/></svg>`
    }
    async function fetchTrabajador(id) {
      const r = await fetch(`${API_BASE}/trabajadores/${id}`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    }
  
    async function fetchFilmografia(id) {
      const r = await fetch(`${API_BASE}/trabajadores/${id}/filmografia`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    }
    function buildContentCard(item) {
      const year = getYear(item.fecha)
      const rawTipo = String(item.tipoContenido || '').toUpperCase()
      const tipo = formatType(rawTipo)
      const href = rawTipo === 'SERIE' ? `./serie.html?id=${item.id}` : `./pelicula.html?id=${item.id}`

      return window.JAM.buildCatalogCard({
        tag: 'a',
        href,
        id: item.id,
        title: item.tituloPrincipal || 'Contenido',
        image: item.imagenUrl || '',
        rating: item.nota,
        subtitle: item.directorNombre || tipo,
        metaStart: year || '-',
        metaEnd: tipo,
        ariaLabel: item.tituloPrincipal || 'Contenido',
      })
    }
  
    function render(root, trabajador, filmografia) {
      const seen = new Set()
      const items = (Array.isArray(filmografia) ? filmografia : []).filter(item => {
        if (seen.has(item.id)) return false
        seen.add(item.id)
        return true
      })
      items.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
  
      const totalFilms   = items.filter(i => String(i.tipoContenido||'').toUpperCase() === 'PELICULA').length
      const totalSeries  = items.filter(i => String(i.tipoContenido||'').toUpperCase() === 'SERIE').length
      const photoHtml    = trabajador.rutaFoto
        ? `<img src="${esc(trabajador.rutaFoto)}" alt="${esc(trabajador.nombre)}" />`
        : `<div class="tw-photo-initials">${esc(getInitials(trabajador.nombre))}</div>`
  
      const bio = trabajador.biografia
        || 'No hay biografi­a disponible para este profesional en nuestra base de datos.'
      const backdropUrl = (items.find(i => i.imagenUrl) || {}).imagenUrl || ''
  
      root.innerHTML = `
<nav class="tw-breadcrumb tw-anim">
          <a href="javascript:history.back()">${backSvg()} Volver</a>
          <span class="tw-breadcrumb__sep">/</span>
          <span>${esc(trabajador.nombre)}</span>
        </nav>
<section class="tw-hero tw-anim tw-anim-delay-1">
          <div class="tw-hero__backdrop" id="tw-backdrop" ${backdropUrl ? `style="background-image:url('${esc(backdropUrl)}')"` : ''}></div>
          <div class="tw-hero__veil"></div>
          <div class="tw-hero__content">
            <div class="tw-photo-wrap">
              ${photoHtml}
            </div>
            <div class="tw-hero__copy">
              <div class="tw-hero__eyebrow">Perfil profesional</div>
              <h1 class="tw-hero__name">${esc(trabajador.nombre)}</h1>
              <div class="tw-hero__meta">
                ${items.length ? `<span class="tw-pill">${items.length} produccion${items.length !== 1 ? 'es' : ''}</span>` : ''}
                ${totalFilms  ? `<span class="tw-pill">${totalFilms} peli­cula${totalFilms !== 1 ? 's' : ''}</span>` : ''}
                ${totalSeries ? `<span class="tw-pill">${totalSeries} serie${totalSeries !== 1 ? 's' : ''}</span>` : ''}
              </div>
            </div>
          </div>
        </section>
<section class="tw-filmografia tw-anim tw-anim-delay-3" id="tw-filmografia">
          <div class="tw-filmografia__head">
            <div>
              <div class="tw-card__label">Trayectoria</div>
              <h2 class="tw-card__title">Filmografi­a</h2>
            </div>
            <div class="tw-filmografia__filters">
              <button class="tw-filter-btn is-active" data-filter="todos">Todos</button>
              ${totalFilms  ? `<button class="tw-filter-btn" data-filter="PELICULA">Peli­culas</button>` : ''}
              ${totalSeries ? `<button class="tw-filter-btn" data-filter="SERIE">Series</button>` : ''}
            </div>
          </div>
          <div class="tw-grid" id="tw-grid">
            ${items.length
              ? items.map(buildContentCard).join('')
              : `<div class="tw-empty"><strong>Sin filmografi­a</strong>No hay producciones registradas.</div>`
            }
          </div>
        </section>
      `
      const grid       = root.querySelector('#tw-grid')
      const filterBtns = root.querySelectorAll('.tw-filter-btn')
  
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('is-active'))
          btn.classList.add('is-active')
  
          const f = btn.dataset.filter
          const filtered = f === 'todos' ? items : items.filter(i => String(i.tipoContenido||'').toUpperCase() === f)
  
          grid.innerHTML = filtered.length
            ? filtered.map(buildContentCard).join('')
            : `<div class="tw-empty"><strong>Sin resultados</strong>No hay contenido de este tipo.</div>`
  
          animateGrid(grid)
        })
      })
      document.title = `${trabajador.nombre} | JAM`
    }
  
    function animateGrid(grid) {
      if (!window.gsap) return
      const cards = grid.querySelectorAll('.pelicula-card')
      if (!cards.length) return
      window.gsap.fromTo(cards,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.04, ease: 'power2.out', overwrite: 'auto' }
      )
    }
    function renderLoading(root) {
      root.innerHTML = `
        <div class="tw-breadcrumb tw-anim" style="opacity:.4">
          <span style="width:120px;height:10px;border-radius:999px;background:rgba(204,211,217,.18);display:inline-block"></span>
        </div>
        <div class="tw-hero" style="min-height:260px;animation:tw-shimmer 1.5s infinite">
          <div style="position:absolute;inset:0;background:rgba(32,33,38,.9)"></div>
        </div>
        <div class="tw-card">
          <div style="height:10px;width:60px;border-radius:999px;background:rgba(204,211,217,.12);margin-bottom:10px"></div>
          <div style="height:18px;width:200px;border-radius:999px;background:rgba(204,211,217,.18);margin-bottom:16px"></div>
          <div style="display:grid;gap:8px">
            ${[100,90,85,70,55].map(w=>`<div style="height:9px;width:${w}%;border-radius:999px;background:rgba(204,211,217,.1)"></div>`).join('')}
          </div>
        </div>
        <div class="tw-filmografia">
          <div style="height:18px;width:180px;border-radius:999px;background:rgba(204,211,217,.16);margin-bottom:22px"></div>
          <div class="tw-grid">${Array.from({ length: 12 }).map(() => window.JAM.buildCatalogSkeletonCard()).join('')}</div>
        </div>
      `
    }
  
    function renderError(root, msg) {
      root.innerHTML = `
        <div style="padding:64px 24px;text-align:center;color:rgba(204,211,217,.5)">
          <div style="font-size:3rem;margin-bottom:16px">ðŸŽ¬</div>
          <h2 style="font-size:1.6rem;letter-spacing:-0.04em;color:rgba(204,211,217,.7);margin:0 0 10px">No encontrado</h2>
          <p style="margin:0 0 24px;line-height:1.7">${esc(msg || 'No se pudo cargar este perfil.')}</p>
          <a href="javascript:history.back()" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:999px;border:1px solid rgba(204,211,217,.2);background:rgba(52,56,64,.5);color:rgba(204,211,217,.8);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase">
            Volver
          </a>
        </div>
      `
    }
    async function init() {
      const root = document.getElementById('trabajador-root')
      if (!root) return
  
      const id = getId()
      if (!id) { renderError(root, 'No se especifica un trabajador.'); return }
  
      renderLoading(root)
  
      try {
        const [trabajador, filmografia] = await Promise.all([
          fetchTrabajador(id),
          fetchFilmografia(id).catch(() => []),
        ])
        render(root, trabajador, filmografia)
        const grid = root.querySelector('#tw-grid')
        if (grid) animateGrid(grid)
  
      } catch (err) {
        console.error('[trabajador.js]', err)
        renderError(root, `No se pudo cargar el perfil con ID ${id}.`)
      }
    }
  
    document.addEventListener('DOMContentLoaded', init)
  })()
