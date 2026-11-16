(function () {
  function escapeHtml(value) {
    if (window.JAM?.escapeHtml) return window.JAM.escapeHtml(value)
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }

  function formatCompact(value) {
    if (window.JAM?.formatCompact) return window.JAM.formatCompact(value)
    return new Intl.NumberFormat('es-ES', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(Number(value || 0))
  }

  function formatYear(value) {
    if (window.JAM?.formatYear) return window.JAM.formatYear(value)
    return value ? String(value).slice(0, 4) : '-'
  }

  function formatDuration(value) {
    if (window.JAM?.formatDuration) return window.JAM.formatDuration(value)
    if (!value) return '-'
    const h = Math.floor(value / 60)
    const m = value % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  function getCardMetaEnd(item, options) {
    if (options.kind === 'SERIE') {
      return item.nVotos > 0 ? formatCompact(item.nVotos) : 'Serie'
    }

    return formatDuration(item.duracion)
  }

  function average(items, key) {
    if (!items.length) return 0
    const total = items.reduce((sum, item) => sum + Number(item[key] || 0), 0)
    return total / items.length
  }

  function buildMetricCard(metric) {
    return `
      <article class="discovery-metric">
        <div class="discovery-metric__label">${escapeHtml(metric.label)}</div>
        <div class="discovery-metric__value">${escapeHtml(metric.value)}</div>
        <p class="discovery-metric__note">${escapeHtml(metric.note)}</p>
      </article>`
  }

  function buildMetricSkeleton() {
    return `
      <article class="discovery-metric" aria-hidden="true">
        <span class="skeleton-line skeleton-line--sm skeleton-shimmer"></span>
        <span class="skeleton-line skeleton-line--lg skeleton-shimmer"></span>
        <span class="skeleton-line skeleton-line--xl skeleton-shimmer"></span>
      </article>`
  }

  function buildShelfSkeleton(title = 'Cargando') {
    const cards = Array.from({ length: 8 })
      .map(() => window.JAM.buildCatalogSkeletonCard('pelicula-card--compact'))
      .join('')

    return `
      <article class="discovery-shelf">
        <div class="discovery-shelf__head">
          <div>
            <div class="discovery-shelf__eyebrow">${escapeHtml(title)}</div>
            <h2 class="discovery-shelf__title">Preparando fila</h2>
            <p class="discovery-shelf__description">Organizando contenido real del catálogo.</p>
          </div>
        </div>
        <div class="discovery-shelf__track">${cards}</div>
      </article>`
  }

  function buildShelfMarkup(section, options, rootKey) {
    const shelfId = `${rootKey}-${section.id}`
    const cards = section.items
      .map((item) =>
        window.JAM.buildCatalogCard({
          tag: 'a',
          href: options.getHref(item),
          id: item.id,
          title: item.tituloPrincipal,
          image: item.imagenUrl || '',
          rating: item.nota,
          subtitle: item.directorNombre,
          metaStart: formatYear(item.fecha),
          metaEnd: getCardMetaEnd(item, options),
          className: 'pelicula-card--compact',
          searchTitle: item.tituloPrincipal,
          searchCategory: options.typeLabel,
          searchNote: item.directorNombre,
          ariaLabel: `${options.openVerb} ${item.tituloPrincipal}`,
        }),
      )
      .join('')

    return `
      <article class="discovery-shelf">
        <div class="discovery-shelf__head">
          <div>
            <div class="discovery-shelf__eyebrow">${escapeHtml(section.eyebrow || options.sectionLabel)}</div>
            <h2 class="discovery-shelf__title">${escapeHtml(section.title)}</h2>
            <p class="discovery-shelf__description">${escapeHtml(section.description)}</p>
          </div>
          <div class="discovery-shelf__aside">
            <span class="discovery-shelf__count">${section.items.length} títulos</span>
            <div class="discovery-shelf__controls">
              <button class="discovery-shelf__button" type="button" data-shelf-prev="${shelfId}" aria-label="Mover carrusel a la izquierda">
                ${window.JAM?.icons?.arrow ? window.JAM.icons.arrow('left') : '&lt;'}
              </button>
              <button class="discovery-shelf__button" type="button" data-shelf-next="${shelfId}" aria-label="Mover carrusel a la derecha">
                ${window.JAM?.icons?.arrow ? window.JAM.icons.arrow('right') : '&gt;'}
              </button>
            </div>
          </div>
        </div>
        <div class="discovery-shelf__track" id="${shelfId}">${cards}</div>
      </article>`
  }

  function normalizeKey(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
  }

  function enhanceSelect(select) {
    if (!select) return null

    const wrapper = document.createElement('div')
    wrapper.className = 'discovery-selectbox'

    const trigger = document.createElement('button')
    trigger.type = 'button'
    trigger.className = 'discovery-selectbox__trigger'
    trigger.setAttribute('aria-haspopup', 'listbox')
    trigger.setAttribute('aria-expanded', 'false')

    const triggerLabel = document.createElement('span')
    triggerLabel.className = 'discovery-selectbox__label'

    const triggerArrow = document.createElement('span')
    triggerArrow.className = 'discovery-selectbox__arrow'
    triggerArrow.setAttribute('aria-hidden', 'true')

    trigger.append(triggerLabel, triggerArrow)

    const panel = document.createElement('div')
    panel.className = 'discovery-selectbox__panel'
    panel.setAttribute('role', 'listbox')

    wrapper.append(trigger, panel)
    select.classList.add('discovery-select--native')
    select.insertAdjacentElement('afterend', wrapper)

    function close() {
      wrapper.classList.remove('is-open')
      trigger.setAttribute('aria-expanded', 'false')
    }

    function open() {
      if (trigger.disabled) return
      wrapper.classList.add('is-open')
      trigger.setAttribute('aria-expanded', 'true')
    }

    function sync() {
      const current = select.options[select.selectedIndex]
      triggerLabel.textContent = current?.textContent?.trim() || ''

      panel.innerHTML = [...select.options]
        .map((option) => {
          const selected = option.value === select.value
          return `
            <button
              class="discovery-selectbox__option ${selected ? 'is-active' : ''}"
              type="button"
              role="option"
              data-value="${escapeHtml(option.value)}"
              aria-selected="${selected ? 'true' : 'false'}"
            >
              ${escapeHtml(option.textContent?.trim() || '')}
            </button>`
        })
        .join('')
    }

    function setDisabled(disabled) {
      trigger.disabled = disabled
      wrapper.classList.toggle('is-disabled', disabled)
      if (disabled) close()
    }

    trigger.addEventListener('click', () => {
      if (wrapper.classList.contains('is-open')) {
        close()
      } else {
        open()
      }
    })

    panel.addEventListener('click', (event) => {
      const option = event.target.closest('[data-value]')
      if (!option) return

      const nextValue = option.getAttribute('data-value')
      if (nextValue === null) return

      if (select.value !== nextValue) {
        select.value = nextValue
        select.dispatchEvent(new Event('change', { bubbles: true }))
      }

      sync()
      close()
    })

    document.addEventListener('click', (event) => {
      if (!wrapper.contains(event.target)) {
        close()
      }
    })

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        close()
      }
    })

    sync()

    return {
      sync,
      setDisabled,
    }
  }

  function mountCatalogDiscovery(options) {
    if (!window.JAM || !options?.pageId) return

    const root = document.getElementById(options.pageId)
    if (!root) return

    const state = {
      query: '',
      sort: options.defaultSort || 'popular',
      currentPage: 0,
      heroIndex: 0,
      results: [],
      totalResults: 0,
      hasMore: false,
      totals: { total: 0, movies: 0, series: 0 },
      shelves: [],
      heroMatches: [],
      requestToken: 0,
    }

    const elements = {
      stageBackdrop: document.getElementById(options.ids.stageBackdrop),
      stageKicker: document.getElementById(options.ids.stageKicker),
      stageBrand: document.getElementById(options.ids.stageBrand),
      stageTitle: document.getElementById(options.ids.stageTitle),
      stageText: document.getElementById(options.ids.stageText),
      stageMeta: document.getElementById(options.ids.stageMeta),
      stageOpen: document.getElementById(options.ids.stageOpen),
      stageSelector: document.getElementById(options.ids.stageSelector),
      search: document.getElementById(options.ids.search),
      sort: document.getElementById(options.ids.sort),
      reset: document.getElementById(options.ids.reset),
      summary: document.getElementById(options.ids.summary),
      metrics: document.getElementById(options.ids.metrics),
      shelves: document.getElementById(options.ids.shelves),
      grid: document.getElementById(options.ids.grid),
      resultsMeta: document.getElementById(options.ids.resultsMeta),
      loadMoreWrap: document.getElementById(options.ids.loadMoreWrap),
      loadMoreBtn: document.getElementById(options.ids.loadMoreBtn),
    }

    elements.sortControl = enhanceSelect(elements.sort)
    elements.resultsSection = elements.grid?.closest('.discovery-results') || null
    elements.resultsTitle = elements.resultsSection?.querySelector('.discovery-shelf__title') || null
    elements.resultsEyebrow = elements.resultsSection?.querySelector('.discovery-shelf__eyebrow') || null

    const defaultResultsTitle = elements.resultsTitle?.textContent?.trim() || 'Resultados'
    const defaultResultsEyebrow = elements.resultsEyebrow?.textContent?.trim() || 'Resultados'

    const heroActionButtons = elements.stageOpen?.parentElement
      ? [...elements.stageOpen.parentElement.querySelectorAll('.discovery-btn')]
      : []

    heroActionButtons.forEach((button) => {
      if (!button.dataset.label) {
        button.dataset.label = button.textContent.trim()
      }
    })

    function getCatalogTotal() {
      return options.kind === 'SERIE' ? state.totals.series : state.totals.movies
    }

    function getSortRequest(key = state.sort) {
      return options.sortRequests?.[key] || options.sortRequests?.[options.defaultSort] || {
        orden: 'puntos',
        dir: 'desc',
      }
    }

    async function fetchResultsPage(page = 0) {
      const sortRequest = getSortRequest()
      const payload = await window.JAM.fetchContentSearch({
        q: state.query,
        tipo: options.kind,
        orden: sortRequest.orden,
        dir: sortRequest.dir,
        page,
      })

      return {
        ...payload,
        items: payload.items.filter((item) => item?.imagenUrl),
      }
    }

    async function fetchHeroMatches() {
      const titles = (options.heroPresets || [])
        .map((preset) => preset.matchTitle || preset.title)
        .filter(Boolean)

      return window.JAM.fetchContentsByTitles(titles)
    }

    async function fetchShelfSection(section) {
      const request = section.request || {}
      let items = []

      if (request.kind === 'top' && request.endpoint) {
        items = await window.JAM.fetchContentList(request.endpoint)
      } else if (request.kind === 'titles') {
        items = await window.JAM.fetchContentsByTitles(request.titles || [])
      } else {
        const payload = await window.JAM.fetchContentSearch({
          q: request.q ?? '',
          tipo: request.tipo || options.kind,
          orden: request.orden || 'puntos',
          dir: request.dir || 'desc',
          page: request.page ?? 0,
        })
        items = payload.items
      }

      return {
        ...section,
        items: items
          .filter((item) => item?.imagenUrl)
          .slice(0, section.limit || 18),
      }
    }

    async function fetchShelves() {
      const sections = Array.isArray(options.shelves) ? options.shelves : []
      if (!sections.length) return []
      return Promise.all(sections.map(fetchShelfSection))
    }

    function setControlsLoading(isLoading, config = {}) {
      const keepSearchEnabled = Boolean(config.keepSearchEnabled)

      ;[elements.search, elements.sort, elements.reset, elements.loadMoreBtn].forEach((control) => {
        if (!control) return
        if (keepSearchEnabled && control === elements.search) return
        control.disabled = isLoading
      })

      elements.sortControl?.setDisabled(isLoading)

      heroActionButtons.forEach((button) => {
        button.classList.toggle('is-skeleton', isLoading)
        if (isLoading) {
          button.setAttribute('aria-hidden', 'true')
          button.setAttribute('tabindex', '-1')
          button.innerHTML = '<span class="skeleton-button skeleton-shimmer"></span>'
          return
        }

        button.removeAttribute('aria-hidden')
        button.removeAttribute('tabindex')
        button.textContent = button.dataset.label || button.textContent
      })

      root.setAttribute('aria-busy', isLoading ? 'true' : 'false')
    }

    function renderLoading() {
      setControlsLoading(true)

      if (elements.stageBackdrop) {
        elements.stageBackdrop.style.backgroundImage = 'none'
      }

      if (elements.stageKicker) {
        elements.stageKicker.innerHTML = '<span class="skeleton-line skeleton-line--sm skeleton-shimmer"></span>'
      }

      if (elements.stageBrand) {
        elements.stageBrand.innerHTML = '<span class="discovery-stage__brand-skeleton skeleton-shimmer"></span>'
      }

      if (elements.stageTitle) {
        elements.stageTitle.classList.remove('is-hidden')
        elements.stageTitle.classList.add('is-skeleton')
        elements.stageTitle.innerHTML = `
          <span class="skeleton-line skeleton-line--hero skeleton-shimmer"></span>
          <span class="skeleton-line skeleton-line--hero skeleton-shimmer"></span>`
      }

      if (elements.stageText) {
        elements.stageText.classList.add('is-skeleton')
        elements.stageText.innerHTML = `
          <span class="skeleton-line skeleton-line--xl skeleton-shimmer"></span>
          <span class="skeleton-line skeleton-line--lg skeleton-shimmer"></span>`
      }

      if (elements.stageMeta) {
        elements.stageMeta.classList.add('is-skeleton')
        elements.stageMeta.innerHTML = Array.from({ length: 3 })
          .map(() => '<span class="skeleton-pill skeleton-shimmer"></span>')
          .join('')
      }

      if (elements.stageSelector) {
        elements.stageSelector.innerHTML = ''
      }

      if (elements.metrics) {
        elements.metrics.innerHTML = Array.from({ length: 4 })
          .map(() => buildMetricSkeleton())
          .join('')
      }

      if (elements.shelves) {
        elements.shelves.innerHTML = Array.from({ length: 4 })
          .map((_, index) => buildShelfSkeleton(`Fila ${index + 1}`))
          .join('')
      }

      if (elements.grid) {
        elements.grid.innerHTML = Array.from({ length: 12 })
          .map(() => window.JAM.buildCatalogSkeletonCard())
          .join('')
      }

      if (elements.summary) {
        elements.summary.innerHTML = '<span class="skeleton-line skeleton-line--lg skeleton-shimmer"></span>'
      }

      if (elements.resultsMeta) {
        elements.resultsMeta.textContent = 'Cargando resultados'
      }
    }

    function getHeroData() {
      const presets = options.heroPresets || []

      if (!presets.length) {
        return {
          preset: null,
          matchedItem: state.results[0] || state.shelves[0]?.items?.[0] || null,
        }
      }

      const preset = presets[state.heroIndex % presets.length]
      const matchedItem =
        state.heroMatches.find((item) =>
          normalizeKey(item.tituloPrincipal) === normalizeKey(preset.matchTitle || preset.title),
        ) ||
        state.results.find((item) =>
          normalizeKey(item.tituloPrincipal) === normalizeKey(preset.matchTitle || preset.title),
        ) ||
        null

      return { preset, matchedItem }
    }

    function renderStage() {
      const { preset, matchedItem } = getHeroData()
      const featured = matchedItem || state.results[0] || state.shelves[0]?.items?.[0] || null
      const heroText = options.buildHeroText({
        state,
        featured,
        visible: state.results,
        totalCatalog: getCatalogTotal(),
      })

      if (elements.stageBackdrop) {
        const imageUrl = preset?.image || featured?.imagenUrl || ''
        elements.stageBackdrop.style.backgroundImage = imageUrl ? `url('${imageUrl}')` : 'none'
      }

      if (elements.stageKicker) {
        elements.stageKicker.textContent = preset?.kicker || options.sectionLabel
      }

      if (elements.stageBrand) {
        elements.stageBrand.innerHTML = preset?.logo
          ? `<img src="${preset.logo}" alt="${escapeHtml(preset.title)}" />`
          : ''
      }

      if (elements.stageTitle) {
        elements.stageTitle.classList.remove('is-skeleton')
        elements.stageTitle.textContent = preset?.title || heroText.title
        elements.stageTitle.classList.toggle('is-hidden', Boolean(preset?.logo))
      }

      if (elements.stageText) {
        elements.stageText.classList.remove('is-skeleton')
        elements.stageText.textContent = preset?.summary || heroText.text
      }

      if (elements.stageMeta) {
        elements.stageMeta.classList.remove('is-skeleton')
        elements.stageMeta.innerHTML = `
          ${featured?.duracion ? `<span class="discovery-pill">${formatDuration(featured.duracion)}</span>` : ''}
          ${featured?.fecha ? `<span class="discovery-pill">${formatYear(featured.fecha)}</span>` : ''}
          ${featured?.nota ? `<span class="discovery-pill">${featured.nota}/10</span>` : ''}`
      }

      if (elements.stageOpen) {
        elements.stageOpen.href = featured ? options.getHref(featured) : `#${options.ids.grid}`
      }

      if (elements.stageSelector) {
        elements.stageSelector.innerHTML = (options.heroPresets || [])
          .map(
            (hero, index) => `
              <button
                class="discovery-stage__selector-dot ${index === state.heroIndex ? 'is-active' : ''}"
                type="button"
                data-hero-index="${index}"
                aria-label="Cambiar a ${escapeHtml(hero.title)}"
              ></button>`,
          )
          .join('')
      }
    }

    function renderMetrics() {
      if (!elements.metrics) return

      const currentSet = state.results.length
        ? state.results
        : state.shelves.flatMap((section) => section.items).slice(0, 24)

      const metrics = options.buildMetrics({
        totalCatalog: getCatalogTotal(),
        totalVisible: state.totalResults,
        currentSet,
        average,
        formatCompact,
      })

      elements.metrics.innerHTML = metrics.map(buildMetricCard).join('')
    }

    function renderShelves() {
      if (!elements.shelves) return

      if (state.query.trim()) {
        elements.shelves.hidden = true
        elements.shelves.innerHTML = ''
        return
      }

      elements.shelves.hidden = false
      elements.shelves.innerHTML = state.shelves
        .filter((section) => section.items.length)
        .map((section) => buildShelfMarkup(section, options, options.rootKey))
        .join('')
    }

    function syncSearchLayout() {
      const isSearching = Boolean(state.query.trim())

      root.classList.toggle('is-searching', isSearching)
      elements.resultsSection?.classList.toggle('is-searching', isSearching)

      if (elements.resultsEyebrow) {
        elements.resultsEyebrow.textContent = isSearching ? 'Búsqueda' : defaultResultsEyebrow
      }

      if (elements.resultsTitle) {
        elements.resultsTitle.textContent = isSearching
          ? `Coincidencias para "${state.query.trim()}"`
          : defaultResultsTitle
      }

      if (elements.resultsMeta && isSearching && state.totalResults) {
        elements.resultsMeta.textContent = `${state.totalResults.toLocaleString('es-ES')} coincidencias`
      }
    }

    function renderEmpty() {
      elements.grid.innerHTML = `
        <article class="catalog-empty">
          <h3 class="catalog-empty__title">${escapeHtml(options.empty.title)}</h3>
          <p class="catalog-empty__text">${escapeHtml(options.empty.text)}</p>
        </article>`
    }

    function updateLoadMore() {
      if (!elements.loadMoreWrap || !elements.loadMoreBtn) return

      elements.loadMoreWrap.hidden = !state.hasMore
      elements.loadMoreBtn.textContent = state.hasMore ? 'Cargar más' : 'No hay más'
    }

    function renderGrid(reset = true, itemsToRender = state.results) {
      if (!elements.grid) return

      setControlsLoading(false)
      renderStage()
      renderMetrics()
      syncSearchLayout()
      renderShelves()

      if (elements.summary) {
        elements.summary.textContent = options.buildSummary({
          state,
          totalCatalog: getCatalogTotal(),
          totalVisible: state.totalResults,
        })
      }

      if (elements.resultsMeta) {
        elements.resultsMeta.textContent = `${state.totalResults.toLocaleString('es-ES')} resultados`
      }

      if (!state.results.length) {
        renderEmpty()
        updateLoadMore()
        return
      }

      const markup = itemsToRender
        .map((item) =>
          window.JAM.buildCatalogCard({
            tag: 'a',
            href: options.getHref(item),
            id: item.id,
            title: item.tituloPrincipal,
            image: item.imagenUrl || '',
            rating: item.nota,
            subtitle: item.directorNombre,
            metaStart: formatYear(item.fecha),
            metaEnd: getCardMetaEnd(item, options),
            searchTitle: item.tituloPrincipal,
            searchCategory: options.typeLabel,
            searchNote: item.directorNombre,
            ariaLabel: `${options.openVerb} ${item.tituloPrincipal}`,
          }),
        )
        .join('')

      if (reset) {
        elements.grid.innerHTML = markup
      } else {
        elements.grid.insertAdjacentHTML('beforeend', markup)
      }

      updateLoadMore()
    }

    async function loadResultsPage(page = 0, append = false, token = state.requestToken) {
      const payload = await fetchResultsPage(page)
      if (token !== state.requestToken) return

      state.currentPage = payload.page
      state.totalResults = payload.total
      state.hasMore = !payload.last
      state.results = append ? [...state.results, ...payload.items] : payload.items

      renderGrid(!append, append ? payload.items : state.results)
    }

    async function refreshResults(config = {}) {
      const token = config.token ?? ++state.requestToken
      setControlsLoading(true, { keepSearchEnabled: config.keepSearchEnabled })
      await loadResultsPage(0, false, token)
    }

    async function loadMore() {
      if (!state.hasMore) return

      elements.loadMoreBtn?.setAttribute('disabled', 'disabled')

      try {
        await loadResultsPage(state.currentPage + 1, true)
      } finally {
        elements.loadMoreBtn?.removeAttribute('disabled')
      }
    }

    function bindEvents() {
      if (elements.search) {
        let timer = null

        elements.search.addEventListener('input', () => {
          clearTimeout(timer)
          state.query = elements.search.value.trim()
          const token = ++state.requestToken
          timer = window.setTimeout(async () => {
            await refreshResults({ keepSearchEnabled: true, token })
          }, 220)
        })

        elements.search.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' && elements.resultsSection && state.query.trim()) {
            elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })
      }

      if (elements.sort) {
        elements.sort.addEventListener('change', async () => {
          state.sort = elements.sort.value
          elements.sortControl?.sync()
          await refreshResults()
        })
      }

      if (elements.reset) {
        elements.reset.addEventListener('click', async () => {
          state.query = ''
          state.sort = options.defaultSort || 'popular'
          if (elements.search) elements.search.value = ''
          if (elements.sort) elements.sort.value = state.sort
          elements.sortControl?.sync()
          await refreshResults()
        })
      }

      if (elements.loadMoreBtn) {
        elements.loadMoreBtn.addEventListener('click', loadMore)
      }

      root.addEventListener('click', (event) => {
        const heroButton = event.target.closest('[data-hero-index]')
        if (heroButton) {
          state.heroIndex = Number(heroButton.getAttribute('data-hero-index')) || 0
          renderStage()
          return
        }

        const prev = event.target.closest('[data-shelf-prev]')
        const next = event.target.closest('[data-shelf-next]')
        const trackId = prev?.getAttribute('data-shelf-prev') || next?.getAttribute('data-shelf-next')
        if (!trackId) return

        const track = document.getElementById(trackId)
        if (!track) return

        track.scrollBy({
          left: (prev ? -1 : 1) * track.clientWidth * 0.88,
          behavior: 'smooth',
        })
      })
    }

    async function init() {
      renderLoading()
      bindEvents()

      try {
        const [totals, firstPage, heroMatches, shelves] = await Promise.all([
          window.JAM.fetchContentTotals(),
          fetchResultsPage(0),
          fetchHeroMatches(),
          fetchShelves(),
        ])

        state.totals = totals
        state.heroMatches = heroMatches.filter((item) => item?.imagenUrl)
        state.shelves = shelves
        state.currentPage = firstPage.page
        state.totalResults = firstPage.total
        state.hasMore = !firstPage.last
        state.results = firstPage.items
      } catch (error) {
        setControlsLoading(false)
        console.error(`[${options.rootKey}] Error al cargar catálogo:`, error)
        if (elements.grid) {
          elements.grid.innerHTML = `
            <article class="catalog-empty">
              <h3 class="catalog-empty__title">No se pudo cargar el catálogo.</h3>
              <p class="catalog-empty__text">Prueba otra vez cuando el backend esté activo.</p>
            </article>`
        }
        if (elements.summary) {
          elements.summary.textContent = 'No se pudo conectar con la API.'
        }
        return
      }

      window.JAM.setSearchIndex(
        state.results.map((item) => ({
          title: item.tituloPrincipal,
          category: options.typeLabel,
          href: options.getHref(item),
          note: item.directorNombre,
        })),
      )

      renderGrid(true)
    }

    init()
  }

  window.JAM = window.JAM || {}
  window.JAM.enhanceDiscoverySelect = enhanceSelect
  window.JAM.mountCatalogDiscovery = mountCatalogDiscovery
})()
