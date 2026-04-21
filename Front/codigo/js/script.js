(function () {
  const logoPath = '../../multimedia/LogoJAM.png'

  const sharedData = {
    brandLockup: 'JAMAJO | Cine',
    menuLinks: [
      { label: 'Inicio', href: './index.html' },
      { label: 'Peliculas', href: './peliculas.html' },
      { label: 'Series', href: './series.html' },
      { label: 'Explorar', href: './explorar.html' },
    ],
    categoryLinks: [
      { label: 'Drama', href: './explorar.html#categorias' },
      { label: 'Comedia', href: './explorar.html#categorias' },
      { label: 'Accion', href: './explorar.html#categorias' },
      { label: 'Terror / Horror', href: './explorar.html#categorias' },
      { label: 'Suspense / Thriller', href: './explorar.html#categorias' },
      { label: 'Romance', href: './explorar.html#categorias' },
      { label: 'Familiar', href: './explorar.html#categorias' },
      { label: 'Juvenil / Teen', href: './explorar.html#categorias' },
      { label: 'Ciencia ficcion', href: './explorar.html#categorias' },
      { label: 'Fantasia', href: './explorar.html#categorias' },
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
          { label: 'Trending', href: './explorar.html' },
          { label: 'Categorias', href: './explorar.html#categorias' },
          { label: 'Reparto', href: './explorar.html#categorias' },
          { label: 'Colecciones', href: './explorar.html' },
        ],
      },
      {
        title: 'Cuenta',
        links: [
          { label: 'Iniciar sesion', href: './iniciarsesion.html' },
          { label: 'Biblioteca', href: './iniciarsesion.html' },
          { label: 'Listas', href: './iniciarsesion.html' },
          { label: 'Resenas', href: './iniciarsesion.html' },
        ],
      },
    ],
    searchIndex: [],
  }

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
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }

  function buildHeaderMarkup() {
    const menuLinksMarkup = sharedData.menuLinks
      .map(
        (link) => `
          <a class="menu-link" href="${link.href}" data-close-menu>
            <span>${escapeHtml(link.label)}</span>
          </a>
        `,
      )
      .join('')

    const categoryLinksMarkup = sharedData.categoryLinks
      .map(
        (link) => `
          <a class="menu-category-link" href="${link.href}" data-close-menu>${escapeHtml(link.label)}</a>
        `,
      )
      .join('')

    return `
      <div class="site-header" data-site-header>
        <div class="site-header__bar" data-header-bar>
          <div class="site-header__inner">
            <button class="site-header__menu-trigger" type="button" data-menu-open aria-label="Abrir menu">
              <span class="site-header__menu-icon">${menuIcon()}</span>
              <span>Menu</span>
            </button>

            <a class="site-header__logo" href="./index.html" aria-label="Ir al inicio">
              <img src="${logoPath}" alt="JAM" />
            </a>

            <div class="site-header__account">
              <a class="site-header__account-link" href="./iniciarsesion.html">Iniciar sesion</a>
            </div>
          </div>
        </div>

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
                  <input type="text" placeholder="Buscar contenido" data-menu-search />
                </div>
                <div class="menu-results" data-menu-results></div>
              </section>

              <nav class="menu-nav">
                ${menuLinksMarkup}

                <div class="menu-categories" data-categories>
                  <button class="menu-categories__toggle" type="button" data-categories-toggle aria-expanded="false">
                    <span>Categorias</span>
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

            <div style="margin-top:40px;">
              <div class="site-footer__social-label">Siguenos en</div>
              <div class="site-footer__social">
                <a href="./index.html#footer">Instagram</a>
                <a href="./index.html#footer">TikTok</a>
                <a href="./index.html#footer">YouTube</a>
              </div>
            </div>
          </section>

          <section class="site-footer__links">
            ${columnsMarkup}
          </section>

          <section class="site-footer__app">
            <div class="site-footer__app-box">App</div>
            <div class="site-footer__app-copy">
              Acceso directo a biblioteca, listas y actividad personal.
            </div>
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

  function renderMenuResults(query) {
    const resultsNode = document.querySelector('[data-menu-results]')
    if (!resultsNode) {
      return
    }

    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      resultsNode.classList.remove('is-active')
      resultsNode.innerHTML = ''
      return
    }

    const matches = sharedData.searchIndex
      .filter((item) =>
        `${item.title} ${item.category} ${item.note || ''}`.toLowerCase().includes(normalizedQuery),
      )
      .slice(0, 4)

    if (!matches.length) {
      resultsNode.classList.add('is-active')
      resultsNode.innerHTML = `
        <div class="menu-result">
          <div class="menu-result__meta">Busqueda</div>
          <div class="menu-result__title">Sin coincidencias por ahora.</div>
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

  function bindHeader() {
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

    let lastScrollY = window.scrollY

    function closeCategories() {
      categoriesRoot.classList.remove('is-open')
      categoriesToggle.setAttribute('aria-expanded', 'false')
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
      renderMenuResults(event.target.value)
    })

    window.addEventListener(
      'scroll',
      () => {
        if (menuOverlay.classList.contains('is-open')) {
          headerBar.classList.remove('is-hidden')
          return
        }

        const currentScrollY = window.scrollY

        if (currentScrollY < 24) {
          headerBar.classList.remove('is-hidden')
        } else if (currentScrollY > lastScrollY) {
          headerBar.classList.add('is-hidden')
        } else if (currentScrollY < lastScrollY) {
          headerBar.classList.remove('is-hidden')
        }

        lastScrollY = currentScrollY
      },
      { passive: true },
    )
  }

  window.JAM = {
    data: sharedData,
    icons: {
      arrow: arrowIcon,
    },
    escapeHtml,
    setSearchIndex(items) {
      sharedData.searchIndex = Array.isArray(items) ? items : []
      const searchInput = document.querySelector('[data-menu-search]')
      if (searchInput) {
        renderMenuResults(searchInput.value || '')
      }
    },
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderHeader()
    renderFooter()
    bindHeader()
  })
})()
