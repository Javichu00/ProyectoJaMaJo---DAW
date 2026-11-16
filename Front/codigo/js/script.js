  (function () {
    const logoPath = '../../multimedia/LogoJAM.png'
    const BACKEND_CATEGORY_NAMES = [
      'Accion',
      'Animacion',
      'Aventura',
      'Biografia',
      'Ciencia Ficcion',
      'Cine Negro',
      'Comedia',
      'Crimen',
      'Deporte',
      'Documental',
      'Drama',
      'Familia',
      'Fantasía',
      'Game-Show',
      'Guerra',
      'Historia',
      'Misterio',
      'Música',
      'Musical',
      'News',
      'Reality-TV',
      'Romance',
      'Short',
      'Suspense',
      'Talk-Show',
      'Terror',
      'Western',
    ]

    const sharedData = {
      brandLockup: 'JAM | Cine y series',
      menuLinks: [
        { label: 'Inicio', href: './index.html' },
        { label: 'Peliculas', href: './peliculas.html' },
        { label: 'Series', href: './series.html' },
        { label: 'Explorar', href: './explorar.html' },
      ],
      categoryLinks: [
        { label: 'Drama', href: './explorar.html?categoria=Drama#categorias' },
        { label: 'Comedia', href: './explorar.html?categoria=Comedia#categorias' },
        { label: 'Accion', href: './explorar.html?categoria=Accion#categorias' },
        { label: 'Terror / Horror', href: './explorar.html?categoria=Terror#categorias' },
        { label: 'Suspense / Thriller', href: './explorar.html?categoria=Suspense#categorias' },
        { label: 'Romance', href: './explorar.html?categoria=Romance#categorias' },
        { label: 'Familiar', href: './explorar.html?categoria=Familia#categorias' },
        { label: 'Juvenil / Teen', href: './explorar.html?categoria=Juvenil#categorias' },
        { label: 'Ciencia ficcion', href: './explorar.html?categoria=Ciencia%20ficcion#categorias' },
        { label: 'Fantasi­a', href: './explorar.html?categoria=Fantasia#categorias' },
      ],
      footerColumns: [
        {
          title: 'Navegacion',
          links: [
            { label: 'Inicio', href: './index.html' },
            { label: 'Peliculas', href: './peliculas.html' },
            { label: 'Series', href: './series.html' },
            { label: 'Explorar', href: './explorar.html' },
          ],
        },
        {
          title: 'Descubrir',
          links: [
            { label: 'Categorias', href: './explorar.html#categorias' },
            { label: 'Actores', href: './explorar.html#xpeople-actors-block' },
            { label: 'Directores', href: './explorar.html#xpeople-directors-block' },
          ],
        },
        {
          title: 'Cuenta',
          links: [
            { label: 'Iniciar sesion', href: './landing.html' },
            { label: 'Mi cuenta', href: './cuenta.html' },
            { label: 'Mis listas', href: './listas.html' },
            { label: 'Planes', href: './planes.html' },
          ],
        },
      ],
      searchIndex: [],
    }

    sharedData.categoryLinks = BACKEND_CATEGORY_NAMES.map((category) => ({
      label: category,
      href: `./categoria.html?categoria=${encodeURIComponent(category)}`,
    }))

    function menuIcon() {
      return `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <path d="M4 7h16"></path>
          <path d="M4 12h12"></path>
          <path d="M4 17h16"></path>
        </svg>
      `
    }

    function searchIcon() {
      return `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <circle cx="11" cy="11" r="6"></circle>
          <path d="m20 20-4-4"></path>
        </svg>
      `
    }

    function closeIcon() {
      return `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <path d="m6 6 12 12"></path>
          <path d="M18 6 6 18"></path>
        </svg>
      `
    }

    function chevronIcon() {
      return `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <path d="m6 9 6 6 6-6"></path>
        </svg>
      `
    }

    function arrowIcon(direction) {
      if (direction === 'left') {
        return `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <path d="m15 6-6 6 6 6"></path>
          </svg>
        `
      }

      return `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <path d="m9 6 6 6-6 6"></path>
        </svg>
      `
    }


    function escapeHtml(value) {
      return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('\"', '&quot;')
        .replaceAll("'", '&#39;')
    }

    function normalizeSearchText(value) {
      return String(value ??'')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    }

    function buildContentQueryParams(params = {}) {
      const query = new URLSearchParams()

      if (params.q !== undefined) query.set('q', params.q ?? '')
      if (params.tipo) query.set('tipo', params.tipo)
      if (params.orden) query.set('orden', params.orden)
      if (params.dir) query.set('dir', params.dir)
      if (params.page !== undefined) query.set('page', String(params.page))

      ;(Array.isArray(params.categorias) ? params.categorias : [])
        .filter(Boolean)
        .forEach((category) => query.append('categorias', category))

      return query.toString()
    }

    function normalizeApiContenido(item) {
      if (!item) return null

      return {
        ...item,
        nota: Number(item.nota ?? 0),
        nVotos: Number(item.nVotos ?? 0),
        duracion: Number(item.duracion ?? 0),
        tituloPrincipal: item.tituloPrincipal ?? 'Sin ti­tulo',
        directorNombre: item.director?.nombre ?? 'Direccion no disponible',
        year: item.fecha ? Number(String(item.fecha).slice(0, 4)) : 0,
      }
    }

    function extractContentPage(data) {
      const items = (Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [])
        .map(normalizeApiContenido)
        .filter(Boolean)

      return {
        items,
        total: Number(data?.totalElements ?? items.length),
        page: Number(data?.number ?? 0),
        totalPages: Number(data?.totalPages ?? (items.length ? 1 : 0)),
        last: Boolean(data?.last ?? true),
      }
    }

    async function fetchContentList(path, options = {}) {
      const response = await fetch(`${API_BASE}${path}`, options)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return extractContentPage(await response.json()).items
    }

    async function fetchContentSearch(params = {}) {
      const query = buildContentQueryParams({
        q: params.q ?? '',
        tipo: params.tipo || '',
        orden: params.orden || 'puntos',
        dir: params.dir || 'desc',
        page: params.page ?? 0,
      })

      const response = await fetch(`${API_BASE}/contenidos/buscar?${query}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return extractContentPage(await response.json())
    }

    async function fetchContentByCategories(params = {}) {
      const query = buildContentQueryParams({
        categorias: params.categorias || [],
        tipo: params.tipo || '',
        orden: params.orden || 'puntos',
        dir: params.dir || 'desc',
        page: params.page ?? 0,
      })

      const response = await fetch(`${API_BASE}/contenidos/por-categorias?${query}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return extractContentPage(await response.json())
    }

    async function fetchContentTotals() {
      const response = await fetch(`${API_BASE}/contenidos/contar`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      return {
        total: Number(data.totalContenido ?? data.total ?? 0),
        movies: Number(data.totalPeliculas ?? data.peliculas ?? data.movies ?? 0),
        series: Number(data.totalSeries ?? data.series ?? 0),
      }
    }

    async function fetchUsuarioByEmail(email) {
      if (!email) throw new Error('Email requerido')

      const response = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(email)}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      return response.json()
    }

    async function fetchContentsByTitles(titles = []) {
      const safeTitles = (Array.isArray(titles) ? titles : []).filter(Boolean)
      if (!safeTitles.length) return []

      const response = await fetch(`${API_BASE}/contenidos/top/por-nombres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safeTitles),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return extractContentPage(await response.json()).items
    }

    async function fetchRecommendedContents(idContenido) {
      if (!idContenido) return []
      return fetchContentList(`/contenidos/${idContenido}/recomendados`)
    }

    let runtimeCategoryMapPromise = null
    let runtimeCategoryMap = new Map()

    function registerRuntimeCategory(map, item, categoryName) {
      ;[item?.idApi, item?.id]
        .filter((value) => value !== undefined && value !== null && value !== '')
        .forEach((key) => {
          const normalizedKey = String(key)
          if (!map.has(normalizedKey)) {
            map.set(normalizedKey, new Set())
          }
          map.get(normalizedKey).add(categoryName)
        })
    }

    async function fetchContentsByCategory(categoryName) {
      if (typeof API_BASE !== 'string' || !API_BASE.trim()) {
        return []
      }

      const response = await fetch(
        `${API_BASE}/contenidos/categoria/${encodeURIComponent(categoryName)}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const payload = await response.json()
      return Array.isArray(payload) ?payload : []
    }

    async function ensureRuntimeCategories() {
      if (runtimeCategoryMapPromise) {
        return runtimeCategoryMapPromise
      }

      runtimeCategoryMapPromise = (async () => {
        const map = new Map()

        await Promise.all(
          BACKEND_CATEGORY_NAMES.map(async (categoryName) => {
            try {
              const items = await fetchContentsByCategory(categoryName)
              items.forEach((item) => registerRuntimeCategory(map, item, categoryName))
            } catch (error) {
              console.warn(
                `[script.js] No se pudo cargar la categor\u00eda ${categoryName}:`,
                error,
              )
            }
          }),
        )

        runtimeCategoryMap = new Map(
          [...map.entries()].map(([key, values]) => [key, [...values].sort((a, b) => a.localeCompare(b, 'es'))]),
        )

        return runtimeCategoryMap
      })()

      return runtimeCategoryMapPromise
    }

    function getRuntimeCategoriesForContent(item) {
      if (!item) return []

      const directKeys = [item.idApi, item.id]
        .filter((value) => value !== undefined && value !== null && value !== '')
        .map((value) => String(value))

      for (const key of directKeys) {
        const categories = runtimeCategoryMap.get(key)
        if (categories?.length) {
          return categories
        }
      }

      return []
    }

  
    function formatYear(value) {
      return value ?String(value).substring(0, 4) : '-'
    }

    function formatDuration(minutes) {
      if (!minutes) return '-'
      const h = Math.floor(minutes / 60)
      const m = minutes % 60
      return h > 0 ?`${h}h ${m}m` : `${m}m`
    }

    function formatCompact(value) {
      return new Intl.NumberFormat('es-ES', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(Number(value || 0))
    }

    function starIcon() {
      return `<svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
    }

    function buildCatalogCard(options) {
      const {
        tag = 'article',
        href = '',
        id = '',
        title = '',
        image = '',
        rating = '',
        subtitle = '',
        metaStart = '',
        metaEnd = '',
        className = '',
        searchTitle = '',
        searchCategory = '',
        searchNote = '',
        ariaLabel = '',
        lazy = false,
      } = options || {}
    
      const cardClass = ['pelicula-card', className].filter(Boolean).join(' ')
      const attrs = [`class="${cardClass}"`]
      const Tag = tag === 'a' ? 'a' : 'article'
    
      if (Tag === 'a') attrs.push(`href="${href || '#'}"`)
      if (id !== '' && id !== null && id !== undefined) attrs.push(`data-id="${escapeHtml(id)}"`)
      if (searchTitle || searchCategory || searchNote) {
        attrs.push('data-search-item')
        attrs.push(`data-search-title="${escapeHtml(searchTitle || title)}"`)
        attrs.push(`data-search-category="${escapeHtml(searchCategory || 'Contenido')}"`)
        attrs.push(`data-search-note="${escapeHtml(searchNote || '')}"`)
      }
      if (ariaLabel) attrs.push(`aria-label="${escapeHtml(ariaLabel)}"`)
    
      const imgAttr = lazy
        ? `data-src="${escapeHtml(image || '')}"` 
        : `src="${escapeHtml(image || '')}"`
    
      return `
        <${Tag} ${attrs.join(' ')}>
          <div class="pelicula-card__poster">
            <img ${imgAttr} alt="${escapeHtml(title)}" decoding="async" onerror="this.style.opacity='0'" />
            ${Number(rating || 0) > 0 ? `<div class="pelicula-card__badge">${starIcon()} ${escapeHtml(rating)}</div>` : ''}
          </div>
          <div class="pelicula-card__body">
            <h3 class="pelicula-card__title">${escapeHtml(title)}</h3>
            <p class="pelicula-card__director">${escapeHtml(subtitle || '-')}</p>
            <div class="pelicula-card__footer">
              <span>${escapeHtml(metaStart || '-')}</span>
              <span>${escapeHtml(metaEnd || '-')}</span>
            </div>
          </div>
        </${Tag}>
      `
    }

    function buildCatalogSkeletonCard(className = '') {
      const cardClass = ['skeleton-card', className].filter(Boolean).join(' ')
      return `
        <div class="${cardClass}" aria-hidden="true">
          <div class="skeleton-card__poster skeleton-shimmer"></div>
          <div class="skeleton-card__body">
            <span class="skeleton-line skeleton-line--sm skeleton-shimmer"></span>
            <span class="skeleton-line skeleton-line--lg skeleton-shimmer"></span>
            <span class="skeleton-line skeleton-line--md skeleton-shimmer"></span>
          </div>
        </div>`
    }

    function buildHighlightSkeleton() {
      return `
        <article class="pulse-highlight pulse-highlight--skeleton" aria-hidden="true">
          <span class="skeleton-line skeleton-line--sm skeleton-shimmer"></span>
          <span class="skeleton-line skeleton-line--xl skeleton-shimmer"></span>
          <span class="skeleton-line skeleton-line--lg skeleton-shimmer"></span>
          <span class="skeleton-line skeleton-line--md skeleton-shimmer"></span>
        </article>`
    }

    function buildTickerSkeleton(count = 8) {
      return Array.from({ length: count })
        .map(() => `<span class="ticker-chip-skeleton skeleton-shimmer" aria-hidden="true"></span>`)
        .join('')
    }

    function buildDetailSkeleton() {
      return `
        <section class="detalle-skeleton" aria-hidden="true">
          <div class="detalle-skeleton__breadcrumb">
            <span class="skeleton-line skeleton-line--sm skeleton-shimmer"></span>
            <span class="skeleton-line skeleton-line--xs skeleton-shimmer"></span>
            <span class="skeleton-line skeleton-line--sm skeleton-shimmer"></span>
          </div>
          <div class="detalle-skeleton__hero">
            <div class="detalle-skeleton__poster skeleton-shimmer"></div>
            <div class="detalle-skeleton__hero-copy">
              <span class="skeleton-line skeleton-line--sm skeleton-shimmer"></span>
              <span class="skeleton-line skeleton-line--hero skeleton-shimmer"></span>
              <span class="skeleton-line skeleton-line--hero skeleton-shimmer"></span>
              <div class="detalle-skeleton__pills">
                <span class="skeleton-pill skeleton-shimmer"></span>
                <span class="skeleton-pill skeleton-shimmer"></span>
                <span class="skeleton-pill skeleton-shimmer"></span>
              </div>
              <div class="detalle-skeleton__buttons">
                <span class="skeleton-button skeleton-shimmer"></span>
                <span class="skeleton-button skeleton-shimmer"></span>
              </div>
            </div>
          </div>
          <div class="detalle-skeleton__body">
            <div class="detalle-skeleton__main">
              <div class="detalle-skeleton__card">
                <span class="skeleton-line skeleton-line--sm skeleton-shimmer"></span>
                <span class="skeleton-line skeleton-line--xl skeleton-shimmer"></span>
                <span class="skeleton-line skeleton-line--xl skeleton-shimmer"></span>
                <span class="skeleton-line skeleton-line--lg skeleton-shimmer"></span>
              </div>
              <div class="detalle-skeleton__trailer skeleton-shimmer"></div>
            </div>
            <div class="detalle-skeleton__side">
              <div class="detalle-skeleton__card">
                <span class="skeleton-line skeleton-line--sm skeleton-shimmer"></span>
                <div class="detalle-skeleton__stats">
                  <span class="skeleton-stat skeleton-shimmer"></span>
                  <span class="skeleton-stat skeleton-shimmer"></span>
                  <span class="skeleton-stat skeleton-shimmer"></span>
                  <span class="skeleton-stat skeleton-shimmer"></span>
                </div>
              </div>
              <div class="detalle-skeleton__card">
                <span class="skeleton-line skeleton-line--sm skeleton-shimmer"></span>
                <div class="detalle-skeleton__director">
                  <span class="skeleton-avatar skeleton-shimmer"></span>
                  <div class="detalle-skeleton__director-copy">
                    <span class="skeleton-line skeleton-line--md skeleton-shimmer"></span>
                    <span class="skeleton-line skeleton-line--lg skeleton-shimmer"></span>
                    <span class="skeleton-line skeleton-line--sm skeleton-shimmer"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>`
    }

    function buildCatalogEmptyCard(className = '') {
      const cardClass = ['pelicula-card', 'pelicula-card--empty', className].filter(Boolean).join(' ')
      return `
        <article class="${cardClass}">
          <div class="pelicula-card__empty-card">
            <span class="pelicula-card__empty-badge">Pendiente</span>
            <span class="pelicula-card__empty-line pelicula-card__empty-line--title"></span>
            <span class="pelicula-card__empty-line pelicula-card__empty-line--meta"></span>
          </div>
        </article>
      `
    }

    
    function getStoredSessionUser() {
      try {
        return JSON.parse(localStorage.getItem('JAM_user') || 'null')
      } catch {
        return null
      }
    }

    function getStoredActiveProfile() {
      try {
        const user = getStoredSessionUser()
        const profile = JSON.parse(localStorage.getItem('JAM_profile') || 'null')
        if (!user?.email || !profile?.idCuenta || profile?.email !== user.email) {
          return null
        }
        return profile
      } catch {
        return null
      }
    }

    function clearStoredSession() {
      try {
        localStorage.removeItem('JAM_token')
        localStorage.removeItem('JAM_user')
        localStorage.removeItem('JAM_profile')
        localStorage.removeItem('JAM_plan')
        sessionStorage.removeItem('JAM_profile_onboarding')
      } catch {}
    }

    function buildAccountLink() {
      try {
        const user = getStoredSessionUser()
        const profile = getStoredActiveProfile()
        const isAdmin = user?.tipoUsuario === 'ADMIN'
    
        if (user?.email) {
          const rawName = isAdmin ? (user.username || user.email) : (profile?.username || user.email)
          const displayName = escapeHtml(rawName)
          const initial = String(rawName).charAt(0).toUpperCase()
          const idFoto = profile?.idFoto || 1
          const avatarContent = (!isAdmin && profile?.idFoto)
            ? `<img src="../../multimedia/AvataresCuentas/Perfil${idFoto}.png" alt="Avatar" />`
            : initial

          return `
            <div class="account-dropdown" data-account-dropdown>
              <button class="account-dropdown__trigger" type="button" data-account-trigger aria-expanded="false" aria-haspopup="true">
                <span class="account-dropdown__avatar">${avatarContent}</span>
                <span class="account-dropdown__name">${displayName}</span>
                <svg class="account-dropdown__caret" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              <div class="account-dropdown__panel" data-account-panel>
                <div class="account-dropdown__header">
                  <span class="account-dropdown__avatar account-dropdown__avatar--lg">${avatarContent}</span>
                  <span class="account-dropdown__panel-name">${displayName}</span>
                </div>
                <div class="account-dropdown__divider"></div>
                ${isAdmin ? '' : `
                  <a class="account-dropdown__item" href="./perfiles.html">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="4"/><path d="M8 12h8"/></svg>
                    Cambiar perfil
                  </a>
                  <a class="account-dropdown__item" href="./cuenta.html">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    Mi cuenta
                  </a>
                  <a class="account-dropdown__item" href="./listas.html">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
                    Mis listas
                  </a>
                  <div class="account-dropdown__divider"></div>
                `}
                <button class="account-dropdown__item account-dropdown__item--danger" type="button" data-account-logout>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Cerrar sesion
                </button>
              </div>
            </div>
          `
        }
      } catch {}
      return `<a class="site-header__account-link" href="./landing.html">Iniciar sesion</a>`
    }


    function buildHeaderMarkup() {
      const user = getStoredSessionUser()
      const isAdmin = user?.tipoUsuario === 'ADMIN'
    
      const menuLinksMarkup = sharedData.menuLinks
        .map((link) => `
          <a class="menu-link" href="${link.href}" data-close-menu>
            <span>${escapeHtml(link.label)}</span>
          </a>
        `).join('')
    
      const categoryLinksMarkup = sharedData.categoryLinks
        .map((link) => `
          <a class="menu-category-link" href="${link.href}" data-close-menu>${escapeHtml(link.label)}</a>
        `).join('')
    
      const leftSlot = isAdmin
        ? `<span style="font-size:.82rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--mist-deep);opacity:.6">Dashboard</span>`
        : `
          <button class="site-header__menu-trigger" type="button" data-menu-open aria-label="Abrir menu">
            <span class="site-header__menu-icon">${menuIcon()}</span>
            <span>Menu</span>
          </button>
        `
    
      return `
        <div class="site-header" data-site-header>
          <div class="site-header__bar" data-header-bar>
            <div class="site-header__inner">
              ${leftSlot}
    
              <a class="site-header__logo" href="${isAdmin ? './dashboard.html' : './index.html'}" aria-label="Ir al inicio">
                <img src="${logoPath}" alt="JAM" />
              </a>
    
              <div class="site-header__account">
                ${buildAccountLink()}
              </div>
            </div>
          </div>
    
          ${isAdmin ? '' : `
            <div class="menu-overlay" data-menu-overlay>
              <aside class="menu-panel" data-menu-panel aria-label="Menu principal">
                <div class="menu-panel__inner">
                  <button class="menu-close" type="button" data-menu-close aria-label="Cerrar menu">
                    ${closeIcon()}
                  </button>
                  <section class="menu-search" data-menu-search-block>
                    <p class="menu-search__label">Buscar</p>
                    <div class="menu-search__field">
                      ${searchIcon()}
                      <input type="text" placeholder="Buscar contenido o trabajadores" data-menu-search />
                    </div>
                    <div class="menu-results" data-menu-results></div>
                  </section>
                  <nav class="menu-nav">
                    ${menuLinksMarkup}
                    <div class="menu-categories" data-categories>
                      <button class="menu-categories__toggle" type="button" data-categories-toggle aria-expanded="false">
                        <span>Categori­as</span>
                        <span class="menu-categories__caret">${chevronIcon()}</span>
                      </button>
                      <div class="menu-categories__panel" data-categories-panel>
                        ${categoryLinksMarkup}
                      </div>
                    </div>
                  </nav>
                </div>
              </aside>
            </div>
          `}
        </div>
      `
    }

    function buildFooterMarkup() {
      const columnsMarkup = sharedData.footerColumns
        .map((column) => {
          const linksMarkup = column.links
            .map((link) => `<a href="${link.href}">${escapeHtml(link.label)}</a>`)
            .join('')

          return `
            <section class="site-footer__column">
              <div class="site-footer__column-title">${escapeHtml(column.title)}</div>
              ${linksMarkup}
            </section>
          `
        })
        .join('')

      return `
        <div class="site-footer" id="footer">
          <div class="site-footer__inner shell-width">
            <section>
              <div class="site-footer__brand">
                <img src="${logoPath}" alt="JAM" />
                <div class="site-footer__brand-name">${sharedData.brandLockup}</div>
              </div>

              <p class="site-footer__brand-copy">
                Peliculas, series y anime con una identidad entre streaming y catalogo cinematografico.
              </p>
            </section>

            <section class="site-footer__links">
              ${columnsMarkup}
            </section>

            <section class="site-footer__contact">
              <div class="site-footer__column-title">Contacto</div>
              <a class="site-footer__mail" href="mailto:jamajocompany@gmail.com">jamajocompany@gmail.com</a>
              <p class="site-footer__app-copy">
                Correo oficial de JAM para soporte, dudas y contacto del proyecto.
              </p>
            </section>
          </div>
        </div>
      `
    }

    function renderHeader() {
      const target = document.getElementById('site-header')
      if (!target) {
        return
      }

      target.innerHTML = buildHeaderMarkup()
    }

    function renderFooter() {
      const target = document.getElementById('site-footer')
      if (!target) {
        return
      }

      target.innerHTML = buildFooterMarkup()
    }

    
    function buildLocalMenuMatches(query) {
      const normalizedQuery = normalizeSearchText(query)

      return sharedData.searchIndex
        .map((item) => {
          const title = normalizeSearchText(item.title)
          const category = normalizeSearchText(item.category)
          const note = normalizeSearchText(item.note || '')
          const haystack = `${title} ${category} ${note}`

          if (title === normalizedQuery) return { ...item, score: 0 }
          if (title.startsWith(normalizedQuery)) return { ...item, score: 1 }
          if (title.includes(normalizedQuery)) return { ...item, score: 2 }
          if (note.startsWith(normalizedQuery)) return { ...item, score: 3 }
          if (haystack.includes(normalizedQuery)) return { ...item, score: 4 }
          return null
        })
        .filter(Boolean)
        .sort((a, b) => a.score - b.score || a.title.localeCompare(b.title, 'es'))
        .slice(0, 6)
    }

    function renderMenuResults(query, matches = buildLocalMenuMatches(query)) {
      const resultsNode = document.querySelector('[data-menu-results]')
      if (!resultsNode) {
        return
      }

      const normalizedQuery = normalizeSearchText(query)

      if (!normalizedQuery) {
        resultsNode.classList.remove('is-active')
        resultsNode.innerHTML = ''
        return
      }

      if (!matches.length) {
        resultsNode.classList.add('is-active')
        resultsNode.innerHTML = `
          <div class="menu-result">
            <div class="menu-result__meta">Busqueda</div>
              <div class="menu-result__title">No hay coincidencias en el ca¡logo.</div>
          </div>
        `
        return
      }

      resultsNode.classList.add('is-active')
      resultsNode.innerHTML = matches
        .map(
          (item) => `
            <a class="menu-result" href="${item.href}" data-close-menu>
              <div class="menu-result__meta">${escapeHtml(item.category)}</div>
              <div class="menu-result__title">${escapeHtml(item.title)}</div>
            </a>
          `,
        )
        .join('')
    }

    let menuSearchTimer = null
    let menuSearchToken = 0

    async function fetchContentMenuMatches(query) {
      const page = await fetchContentSearch({
        q: query,
        orden: 'puntos',
        dir: 'desc',
        page: 0,
      })

      return page.items
        .filter((item) => item?.id)
        .slice(0, 6)
        .map((item) => ({
          title: item.tituloPrincipal,
          category: item.tipoContenido === 'SERIE' ? 'Serie' : 'Peli­cula',
          note: item.director?.nombre || item.directorNombre || formatYear(item.fecha),
          href: item.tipoContenido === 'SERIE'
            ? `./serie.html?id=${item.id}`
            : `./pelicula.html?id=${item.id}`,
          score: 0,
        }))
    }

    async function fetchWorkerMenuMatches(query) {
      const response = await fetch(
        `${API_BASE}/trabajadores/buscar?q=${encodeURIComponent(query)}&limit=4`,
      )

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      const workers = Array.isArray(data) ? data : Array.isArray(data?.value) ? data.value : []

      return workers
        .filter((item) => item?.id && item?.nombre)
        .slice(0, 4)
        .map((item) => ({
          title: item.nombre,
          category: 'Trabajador',
          href: `./trabajador.html?id=${item.id}`,
          score: 0,
        }))
    }

    async function fetchMenuMatches(query) {
      const [workerResult, contentResult] = await Promise.allSettled([
        fetchWorkerMenuMatches(query),
        fetchContentMenuMatches(query),
      ])

      if (workerResult.status === 'rejected') {
        console.warn('[script.js] No se pudo consultar trabajadores:', workerResult.reason)
      }
      if (contentResult.status === 'rejected') {
        console.warn('[script.js] No se pudo consultar contenidos:', contentResult.reason)
      }

      const workerMatches = workerResult.status === 'fulfilled' ? workerResult.value : []
      const contentMatches = contentResult.status === 'fulfilled' ? contentResult.value : []

      return [...workerMatches, ...contentMatches].slice(0, 6)
    }

    function scheduleMenuResults(query) {
      const normalizedQuery = normalizeSearchText(query)
      const localMatches = normalizedQuery ? buildLocalMenuMatches(query) : []
      renderMenuResults(query, localMatches)

      clearTimeout(menuSearchTimer)

      if (!normalizedQuery) {
        return
      }

      const requestToken = ++menuSearchToken

      menuSearchTimer = window.setTimeout(async () => {
        try {
          const remoteMatches = await fetchMenuMatches(query)
          if (requestToken !== menuSearchToken) return

          const merged = [...remoteMatches, ...localMatches].reduce((acc, item) => {
            if (!item?.href) return acc
            if (!acc.some((entry) => entry.href === item.href)) {
              acc.push(item)
            }
            return acc
          }, []).slice(0, 6)

          renderMenuResults(query, merged)
        } catch (error) {
          if (requestToken !== menuSearchToken) return
          console.warn('[script.js] No se pudo consultar el buscador global:', error)
          renderMenuResults(query, localMatches)
        }
      }, 180)
    }

    
    function bindAccountDropdown() {
      const dropdown = document.querySelector('[data-account-dropdown]')
      if (!dropdown) return

      const trigger  = dropdown.querySelector('[data-account-trigger]')
      const panel    = dropdown.querySelector('[data-account-panel]')
      const logoutBtn = dropdown.querySelector('[data-account-logout]')

      if (!trigger || !panel) return

      function openDropdown() {
        dropdown.classList.add('is-open')
        trigger.setAttribute('aria-expanded', 'true')

        if (window.gsap) {
          gsap.fromTo(
            panel,
            { y: -6, opacity: 0, scale: 0.97 },
            { y: 0, opacity: 1, scale: 1, duration: 0.22, ease: 'power2.out' },
          )
        }
      }

      function closeDropdown() {
        dropdown.classList.remove('is-open')
        trigger.setAttribute('aria-expanded', 'false')
      }

      trigger.addEventListener('click', (e) => {
        e.stopPropagation()
        dropdown.classList.contains('is-open') ? closeDropdown() : openDropdown()
      })

    
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) closeDropdown()
      })


      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDropdown()
      })

      logoutBtn?.addEventListener('click', () => {
        clearStoredSession()
        window.location.href = './landing.html'
      })
    }

    async function enforceProfileSelection() {
      const currentPath = (window.location.pathname || '').toLowerCase()
      const user = getStoredSessionUser()
    
    
      if (!user?.email) {
        const privatePages = ['dashboard.html', 'perfiles.html', 'cuenta.html', 'perfil.html']
        const isPrivate = privatePages.some(p => currentPath.endsWith(`/${p}`) || currentPath.endsWith(p))
        if (isPrivate) {
          window.location.href = './landing.html'
          return true
        }
        return false
      }
    
      try {
        const fresh = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(user.email)}`).then(r => r.ok ? r.json() : null)
        if (!fresh || fresh.enabled === false) {
          clearStoredSession()
          window.location.href = './landing.html'
          return true
        }
        localStorage.setItem('JAM_user', JSON.stringify({ ...user, ...fresh }))
      } catch {
   
      }
    
      const updatedUser = getStoredSessionUser()
    

      if (updatedUser?.tipoUsuario === 'ADMIN') {
        const enDashboard = currentPath.endsWith('/dashboard.html') || currentPath.endsWith('dashboard.html')
        const enLanding   = currentPath.endsWith('/landing.html')  || currentPath.endsWith('landing.html')
        if (!enDashboard && !enLanding) {
          window.location.href = './dashboard.html'
          return true
        }
        return false
      }
    
      const exemptPages = ['landing.html', 'planes.html', 'pago.html', 'perfiles.html', 'perfil.html', 'cuenta.html']
      const isExempt = exemptPages.some(p => currentPath.endsWith(`/${p}`) || currentPath.endsWith(p))
      if (isExempt) return false
    
      const profile = getStoredActiveProfile()
      if (profile?.idCuenta) return false
    
      window.location.href = './perfiles.html'
      return true
    }
    function bindHeader() {

      bindAccountDropdown()

      const headerBar = document.querySelector('[data-header-bar]')
      const menuOverlay = document.querySelector('[data-menu-overlay]')
      const menuPanel = document.querySelector('[data-menu-panel]')
      const menuOpenButton = document.querySelector('[data-menu-open]')
      const menuCloseButton = document.querySelector('[data-menu-close]')
      const searchInput = document.querySelector('[data-menu-search]')
      const categoriesRoot = document.querySelector('[data-categories]')
      const categoriesToggle = document.querySelector('[data-categories-toggle]')
      const closeTargets = document.querySelectorAll('[data-close-menu]')

      if (
        !headerBar ||
        !menuOverlay ||
        !menuPanel ||
        !menuOpenButton ||
        !menuCloseButton ||
        !searchInput ||
        !categoriesRoot ||
        !categoriesToggle
      ) {
        return
      }

      const hideThreshold = 28
      const isIndexPage = document.body.classList.contains('page-index')
      let lastScrollY = window.scrollY
      let ticking = false

      function closeCategories() {
        categoriesRoot.classList.remove('is-open')
        categoriesToggle.setAttribute('aria-expanded', 'false')
      }

      function syncHeaderState() {
        const currentScrollY = window.scrollY
        const atTop = currentScrollY <= 8
        const movingDown = currentScrollY > lastScrollY
        const movingUp = currentScrollY < lastScrollY
        const menuIsOpen = menuOverlay.classList.contains('is-open')
        const shouldHide = !isIndexPage && currentScrollY > hideThreshold && movingDown
        const shouldShow = isIndexPage || atTop || movingUp || currentScrollY <= hideThreshold || menuIsOpen
        const shouldStayTransparent = false

        headerBar.classList.toggle('is-transparent', shouldStayTransparent)

        if (shouldHide) {
          headerBar.classList.add('is-hidden')
        } else if (shouldShow) {
          headerBar.classList.remove('is-hidden')
        }

        lastScrollY = currentScrollY
        ticking = false
      }

      function openMenu() {
        closeCategories()
        document.body.classList.add('is-locked')
        menuOverlay.classList.add('is-open')
        headerBar.classList.remove('is-hidden')

        if (window.gsap) {
          gsap.fromTo(
            menuPanel,
            { xPercent: -7, autoAlpha: 0 },
            { xPercent: 0, autoAlpha: 1, duration: 0.42, ease: 'power3.out' },
          )
        }
      }

      function closeMenu() {
        closeCategories()
        renderMenuResults('')
        searchInput.value = ''
        clearTimeout(menuSearchTimer)
        menuSearchToken += 1

        if (window.gsap) {
          gsap.to(menuPanel, {
            xPercent: -5,
            autoAlpha: 0,
            duration: 0.2,
            ease: 'power2.out',
            onComplete() {
              menuOverlay.classList.remove('is-open')
              document.body.classList.remove('is-locked')
              gsap.set(menuPanel, { clearProps: 'all' })
            },
          })
          return
        }

        menuOverlay.classList.remove('is-open')
        document.body.classList.remove('is-locked')
      }

      menuOpenButton.addEventListener('click', openMenu)
      menuCloseButton.addEventListener('click', closeMenu)
      menuOverlay.addEventListener('click', (event) => {
        if (event.target === menuOverlay) {
          closeMenu()
        }
      })

      closeTargets.forEach((target) => {
        target.addEventListener('click', closeMenu)
      })

      categoriesToggle.addEventListener('click', () => {
        const willOpen = !categoriesRoot.classList.contains('is-open')
        categoriesRoot.classList.toggle('is-open', willOpen)
        categoriesToggle.setAttribute('aria-expanded', String(willOpen))
      })

      searchInput.addEventListener('input', (event) => {
        scheduleMenuResults(event.target.value)
      })

      window.addEventListener(
        'scroll',
        () => {
          if (!ticking) {
            window.requestAnimationFrame(syncHeaderState)
            ticking = true
          }
        },
        { passive: true },
      )

      syncHeaderState()


      
    }


    function mergeSearchIndex(items) {
      const current = new Map(sharedData.searchIndex.map((item) => [item.href, item]))

      ;(Array.isArray(items) ?items : []).forEach((item) => {
        if (!item?.href) return
        current.set(item.href, item)
      })

      sharedData.searchIndex = [...current.values()]
    }

    function buildTrabajadoresSection(trabajadores, options = {}) {
      const safeTrabajadores = (Array.isArray(trabajadores) ? trabajadores : [])
        .filter((item) => item && item.nombre)
        .slice(0, 4)

      if (!safeTrabajadores.length) return ''

      const label = options.label || 'Actores'
      const title = options.title || 'Reparto principal'

      return `
        <article class="detalle-card detalle-card--workers">
          <div class="detalle-card__label">${escapeHtml(label)}</div>
          <h2 class="detalle-card__title">${escapeHtml(title)}</h2>
          <div class="detalle-workers-grid">
            ${safeTrabajadores
              .map((trabajador) => {
                const nombre = String(trabajador?.nombre || '').trim()
                const rol = String(trabajador?.rolEnContenido || '').trim()
                const initials = nombre
                  .split(' ')
                  .slice(0, 2)
                  .map((word) => word[0] || '')
                  .join('')
                  .toUpperCase()

                const media = trabajador?.rutaFoto
                  ? `
                    <img
                      class="detalle-worker__photo"
                      src="${trabajador.rutaFoto}"
                      alt="${escapeHtml(nombre)}"
                      loading="lazy"
                    />
                  `
                  : `<div class="detalle-worker__avatar">${escapeHtml(initials || '?')}</div>`

                return `
                  <article class="detalle-worker">
                    ${media}
                    <div class="detalle-worker__copy">
                      <strong class="detalle-worker__name">${escapeHtml(nombre)}</strong>
                      <span class="detalle-worker__role">${escapeHtml(rol || 'Actor')}</span>
                    </div>
                  </article>
                `
              })
              .join('')}
          </div>
        </article>
      `
    }


    window.JAM = {
      data: sharedData,
      icons: {
        arrow: arrowIcon,
      },
      escapeHtml,
      formatCompact,
      formatDuration,
      formatYear,
      buildCatalogCard,
      buildCatalogEmptyCard,
      buildCatalogSkeletonCard,
      buildHighlightSkeleton,
      buildTickerSkeleton,
      buildDetailSkeleton,
      buildTrabajadoresSection,
      normalizeApiContenido,
      fetchContentList,
      fetchContentSearch,
      fetchContentByCategories,
      fetchContentTotals,
      fetchUsuarioByEmail,
      fetchContentsByTitles,
      fetchRecommendedContents,
      ensureRuntimeCategories,
      getCategoriesForContent: getRuntimeCategoriesForContent,
      setSearchIndex(items) {
        mergeSearchIndex(items)
        const searchInput = document.querySelector('[data-menu-search]')
        if (searchInput) {
          scheduleMenuResults(searchInput.value || '')
        }
      },
    }

    document.addEventListener('DOMContentLoaded', async () => {
      if (await enforceProfileSelection()) return
      renderHeader()
      renderFooter()
      bindHeader()
    })
  })()

  async function fetchImagenesDePeliculaByIdTmdb(idTmdb) {
    if (!idTmdb) return []

    const res = await fetch(`${API_BASE}/tmdb/${idTmdb}/movieImages`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.value)) return data.value
    return []
  }

  async function fetchImagenesDeSerieByIdTmdb(idTmdb) {
    if (!idTmdb) return []

    const res = await fetch(`${API_BASE}/tmdb/${idTmdb}/serieImages`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.value)) return data.value
    return []
  }

  async function fetchImagenesDeEpisodioByIdTmdb(tvId, season, episode) {
    if (!tvId) return []

    const res = await fetch(
      `${API_BASE}/tmdb/${tvId}/season/${season}/episode/${episode}/images`
    )

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const contentType = res.headers.get('content-type') || ''

    if (contentType.includes('text/plain')) {
      const text = (await res.text()).trim()
      return text ?[text] : []
    }

    const raw = await res.text()
    if (!raw.trim()) return []

    let data

    try {
      data = JSON.parse(raw)
    } catch {
      return [raw.trim()]
    }

    if (typeof data === 'string') return data ?[data] : []
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.value)) return data.value
    return []
  }

  async function fetchDetalleEpisodioByIdTmdb(tvId, season, episode) {
    if (!tvId) return null

    const res = await fetch(`${API_BASE}/tmdb/${tvId}/season/${season}/episode/${episode}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    return res.json()
  }

  async function fetchTrabajadores() {
    const res = await fetch(`${API_BASE}/trabajadores`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    return res.json()
  }

  async function fetchTrabajadorById(id) {
    if (!id) return null

    const res = await fetch(`${API_BASE}/trabajadores/${id}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    return res.json()
  }

  async function fetchTrabajadoresByContenido(idContenido) {
    if (!idContenido) return []

    const res = await fetch(`${API_BASE}/contenidos/${idContenido}/actores`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()

    return (Array.isArray(data) ? data : [])
      .map((item) => ({
        id: item?.id ?? null,
        nombre: String(item?.nombre || '').trim(),
        rutaFoto: item?.rutaFoto || '',
        rolEnContenido: String(item?.rolEnContenido || '').trim(),
      }))
      .filter((item) => item.nombre)
  }

  function getSharedContentCategories(item) {
    const raw = window.JAM?.getCategoriesForContent?.(item)
    return Array.isArray(raw) ?raw.map(String).filter(Boolean) : []
  }


  function normalizeRecommendationText(value) {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
  }

  function getRecommendationReason(current, candidate) {
    const currentCategories = getSharedContentCategories(current).map(normalizeRecommendationText)
    const shared = getSharedContentCategories(candidate).filter((category) =>
      currentCategories.includes(normalizeRecommendationText(category)),
    )

    if (shared.length) return shared.slice(0, 2).join(' + ')
    if (current.tipoContenido === candidate.tipoContenido) {
      return current.tipoContenido === 'SERIE' ?'Otra serie cercana' : 'Otra peli­cula cercana'
    }
    return 'Coincidencia por tono'
  }

  function buildRecommendationCard(item, current) {
    const isSerie = item.tipoContenido === 'SERIE'
    return window.JAM.buildCatalogCard({
      tag: 'a',
      href: isSerie ?`./serie.html?id=${item.id}` : `./pelicula.html?id=${item.id}`,
      title: item.tituloPrincipal || 'Contenido',
      image: item.imagenUrl || '',
      rating: item.nota ??'',
      subtitle: getRecommendationReason(current, item),
      metaStart: isSerie ?'Serie' : 'Peli­cula',
      metaEnd: window.JAM.formatYear(item.fecha),
      className: 'recommendation-card',
      ariaLabel: `Ver ${item.tituloPrincipal || 'contenido recomendado'}`,
    })
  }

  async function hydrateRecommendationsForContent(root, current, options = {}) {
    const target = root?.querySelector?.('[data-recommendations]')
    if (!target || !current || !window.JAM?.buildCatalogCard) return

    try {
      await window.JAM?.ensureRuntimeCategories?.()
      const recommendations = await window.JAM.fetchRecommendedContents(current.id)

      target.innerHTML = recommendations.length
        ?recommendations
        .slice(0, options.limit || 12)
          .map((item) => buildRecommendationCard(item, current))
          .join('')
        : `<div class="detalle-recommendations__empty">No hay recomendaciones cercanas todavi­a.</div>`
    } catch (error) {
      console.warn('[script.js] No se pudieron cargar recomendaciones:', error)
      target.innerHTML = `<div class="detalle-recommendations__empty">No se pudieron cargar recomendaciones.</div>`
    }
  }
