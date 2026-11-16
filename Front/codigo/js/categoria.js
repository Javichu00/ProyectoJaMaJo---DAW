(function () {
  let currentPage = 0
  let isLoading   = false
  let hasMore     = true
  let categoria   = ''
  let totalLoaded = 0

  function getCategoriaFromUrl() {
    return new URLSearchParams(window.location.search).get('categoria') || ''
  }

  function formatCompact(value) {
    return new Intl.NumberFormat('es-ES', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(Number(value || 0))
  }

  function buildCards(items) {
    return items.map((item) => {
      const isSerie = item.tipoContenido === 'SERIE'
      return window.JAM.buildCatalogCard({
        tag: 'a',
        href: isSerie ? `./serie.html?id=${item.id}` : `./pelicula.html?id=${item.id}`,
        id: item.id,
        title: item.tituloPrincipal || 'Contenido',
        image: item.imagenUrl || '',
        rating: item.nota,
        subtitle: isSerie ? 'Serie' : 'Película',
        metaStart: item.fecha ? String(item.fecha).slice(0, 4) : '-',
        metaEnd: item.nVotos ? `${formatCompact(item.nVotos)} votos` : '-',
        ariaLabel: item.tituloPrincipal || 'Contenido',
        lazy: true,
      })
    }).join('')
  }

  function renderInitial(root) {
    root.innerHTML = `
      <div class="eyebrow" style="margin-bottom: 0.5rem;">Categoría</div>
      <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">${window.JAM.escapeHtml(categoria)}</h1>
      <p id="cat-meta" style="opacity: 0.55; margin-bottom: 2.5rem; font-size: 0.9rem;">Cargando…</p>
      <div id="cat-grid" class="catalog-card-grid">
        ${Array.from({ length: 12 }).map(() => window.JAM.buildCatalogSkeletonCard()).join('')}
      </div>
      <div id="cat-footer" style="display:flex; justify-content:center; margin-top: 2.5rem;"></div>
    `
  }

  function updateMeta() {
    const meta = document.getElementById('cat-meta')
    if (meta) meta.textContent = `${totalLoaded} título${totalLoaded !== 1 ? 's' : ''} cargados`
  }

  function setFooter(state) {
    const footer = document.getElementById('cat-footer')
    if (!footer) return

    if (state === 'loading') {
      footer.innerHTML = `<span style="opacity:0.5; font-size:0.9rem;">Cargando…</span>`
    } else if (state === 'button') {
      footer.innerHTML = `
        <button id="btn-load-more" style="
          padding: 0.65rem 2rem;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 999px;
          background: transparent;
          color: inherit;
          font-family: inherit;
          font-size: 0.85rem;
          cursor: pointer;
          transition: background 0.2s;
        ">
          Cargar más
        </button>
      `
      document.getElementById('btn-load-more')?.addEventListener('click', loadMore)
    } else if (state === 'end') {
      footer.innerHTML = `<span style="opacity:0.35; font-size:0.82rem;">— Has llegado al final —</span>`
    } else {
      footer.innerHTML = ''
    }
  }

  function lazyLoadImages(grid) {
    const imgs = [...grid.querySelectorAll('img[data-src]')]
    if (!imgs.length) return
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const img = entry.target
        img.src = img.dataset.src
        img.removeAttribute('data-src')
        observer.unobserve(img)
      })
    }, {
      rootMargin: '200px 0px',
    })
  
    imgs.forEach((img) => observer.observe(img))
  }

  async function loadMore() {
    if (isLoading || !hasMore) return
    isLoading = true
    setFooter('loading')

    try {
      const response = await fetch(
        `${API_BASE}/contenidos/categoria/${encodeURIComponent(categoria)}?page=${currentPage}`
      )
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data     = await response.json()
      const items    = Array.isArray(data.content) ? data.content : []
      const isLast   = data.last ?? (items.length < 49)

      const grid = document.getElementById('cat-grid')
      if (!grid) return

      if (currentPage === 0) grid.innerHTML = ''

      if (!items.length && currentPage === 0) {
        grid.innerHTML = `<p style="opacity:0.6; grid-column:1/-1;">No hay títulos disponibles en esta categoría todavía.</p>`
        setFooter('end')
        return
      }

      grid.insertAdjacentHTML('beforeend', buildCards(items))
      lazyLoadImages(grid)
      totalLoaded += items.length
      updateMeta()

      if (window.gsap) {
        const allCards = grid.querySelectorAll('.pelicula-card')
        const newCards = [...allCards].slice(totalLoaded - items.length)
        window.gsap.fromTo(
          newCards,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.03 }
        )
      }

      currentPage++

      if (isLast) {
        hasMore = false
        setFooter('end')
      } else {
        setFooter('button')
      }

    } catch (error) {
      console.error('[categoria.js]', error)
      setFooter('button') 
    } finally {
      isLoading = false
    }
  }

  async function init() {
    const root = document.getElementById('categoria-root')
    if (!root) return

    categoria = getCategoriaFromUrl()
    if (!categoria) {
      root.innerHTML = `<p style="opacity:0.6;">No se especificó ninguna categoría.</p>`
      return
    }

    document.title = `${categoria} | JAM`
    renderInitial(root)
    await loadMore()
  }

  document.addEventListener('DOMContentLoaded', init)
})()
