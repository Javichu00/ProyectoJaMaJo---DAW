;(function () {
  'use strict'

  const SORTS = {
    popular: { orden: 'votos', dir: 'desc', label: 'mas populares' },
    rating: { orden: 'puntos', dir: 'desc', label: 'mejor valoradas' },
    newest: { orden: 'fecha', dir: 'desc', label: 'mas recientes' },
    oldest: { orden: 'fecha', dir: 'asc', label: 'mas antiguas' },
    az: { orden: 'alfabetico', dir: 'asc', label: 'A-Z' },
  }

  const SHELVES = [
    {
      id: 'popular',
      endpoint: '/contenidos/top/votados',
      kicker: 'Populares',
      title: 'Lo que mas se esta moviendo',
      text: 'Titulos con mas votos para entrar rapido por donde el catalogo ya tiene traccion.',
    },
    {
      id: 'rating',
      endpoint: '/contenidos/top/puntos',
      kicker: 'Valoradas',
      title: 'Mejor puntuadas',
      text: 'Peliculas y series con mejor recepcion para cuando quieres ir a tiro fijo.',
    },
    {
      id: 'recent',
      endpoint: '/contenidos/top/recientes',
      kicker: 'Recientes',
      title: 'Lo ultimo del catalogo',
      text: 'Contenido mas nuevo o cercano en fecha para descubrir sin bajar demasiado.',
    },
    {
      id: 'long',
      endpoint: '/contenidos/top/largas',
      kicker: 'Sesion larga',
      title: 'Peliculas para meterte de lleno',
      text: 'Historias con mas duracion para cuando quieres una noche completa.',
    },
  ]

  const ACTORS = [
    'Leonardo DiCaprio',
    'Morgan Freeman',
    'Tom Hanks',
    'Robert De Niro',
    'Scarlett Johansson',
    'Natalie Portman',
    'Brad Pitt',
    'Christian Bale',
    'Samuel L. Jackson',
    'Meryl Streep',
  ]

  const DIRECTORS = [
    'Christopher Nolan',
    'Quentin Tarantino',
    'David Fincher',
    'Martin Scorsese',
    'Steven Spielberg',
    'Ridley Scott',
    'James Cameron',
    'Stanley Kubrick',
    'Denis Villeneuve',
    'Greta Gerwig',
  ]

  const WORKER_SHELVES = [
    {
      id: 'directors',
      names: DIRECTORS,
      role: 'Director',
      kicker: 'Directores',
      title: 'Directores para seguir',
      text: 'Perfiles clave del catalogo para saltar rapido a toda su filmografia.',
    },
    {
      id: 'actors',
      names: ACTORS,
      role: 'Actor',
      kicker: 'Actores',
      title: 'Actores en el radar',
      text: 'Caras reconocibles para descubrir peliculas y series desde sus perfiles.',
    },
  ]

  const state = {
    query: '',
    category: '',
    sort: 'popular',
    page: 0,
    total: 0,
    displayedTotal: 0,
    last: true,
    results: [],
    workers: [],
    shelves: [],
    workerShelves: [],
    totals: { total: 0, movies: 0, series: 0 },
    featured: null,
    heroEndgame: null,
    requestToken: 0,
    loading: false,
  }

  const els = {}
  const selectControls = {}

  const byId = (id) => document.getElementById(id)
  const apiBase = () => {
    const base = typeof API_BASE === 'string' && API_BASE.trim()
      ? API_BASE
      : window.API_BASE || window.API_ROOT || '/api'

    return String(base).replace(/\/$/, '')
  }
  const escapeHtml = (value) => window.JAM?.escapeHtml ? window.JAM.escapeHtml(value) : String(value ?? '')
  const number = (value) => Number(value || 0).toLocaleString('es-ES')
  const year = (value) => (value ? String(value).slice(0, 4) : '-')

  function normalizeText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
  }

  function payloadItems(data) {
    if (Array.isArray(data)) return data
    if (data && typeof data === 'object' && (data.id || data.idTrabajador || data.idContenido || data.nombre || data.tituloPrincipal)) return [data]
    return data?.items || data?.content || data?.value || data?.contenidos || data?.trabajadores || data?.results || []
  }

  function normalizeItems(items) {
    return (Array.isArray(items) ? items : [])
      .map((item) => (window.JAM?.normalizeApiContenido ? window.JAM.normalizeApiContenido(item) : normalizeContenido(item)))
      .filter((item) => item?.id)
  }

  function normalizeContenido(item) {
    const titulo = item?.tituloPrincipal || item?.titulo || item?.nombre || item?.title || ''
    return {
      ...item,
      id: item?.id ?? item?.idContenido,
      tituloPrincipal: titulo,
      imagenUrl: item?.imagenUrl || item?.posterUrl || item?.rutaImagen || item?.imagen || '',
      nota: item?.nota ?? item?.puntos ?? item?.rating ?? 0,
      nVotos: item?.nVotos ?? item?.votos ?? 0,
      fecha: item?.fecha ?? item?.fechaLanzamiento ?? item?.anio,
      tipoContenido: item?.tipoContenido || item?.tipo || item?.tipoContenidoEnum,
      directorNombre: item?.directorNombre || item?.director?.nombre || item?.director || '',
    }
  }

  function normalizeWorkers(items) {
    return (Array.isArray(items) ? items : [])
      .map((item) => ({
        id: item?.id ?? item?.idTrabajador,
        nombre: String(item?.nombre || item?.nombreCompleto || item?.name || '').trim(),
        rutaFoto: item?.rutaFoto || item?.foto || item?.imagenUrl || item?.profilePath || '',
        rol: item?.rol || item?.tipo || item?.tipoTrabajador || '',
      }))
      .filter((item) => item.id && item.nombre)
  }

  function uniqueItems(items) {
    const seen = new Set()
    return normalizeItems(items)
      .filter((item) => item?.id && item?.imagenUrl)
      .filter((item) => {
        const key = String(item.id)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
  }

  function initials(name) {
    return (
      String(name || '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || '?'
    )
  }

  function hrefFor(item) {
    return item?.tipoContenido === 'SERIE'
      ? `./serie.html?id=${encodeURIComponent(item.id)}`
      : `./pelicula.html?id=${encodeURIComponent(item.id)}`
  }

  function typeLabel(item) {
    return item?.tipoContenido === 'SERIE' ? 'Serie' : 'Pelicula'
  }

  function directorName(item) {
    return item?.directorNombre || item?.director?.nombre || 'Direccion no disponible'
  }

  function categories() {
    return (window.JAM?.data?.categoryLinks || [])
      .map((item) => String(item?.label || '').trim())
      .filter(Boolean)
  }

  function readUrlState() {
    const params = new URLSearchParams(window.location.search)
    state.category = String(params.get('categoria') || '').trim()
    state.query = String(params.get('q') || '').trim()
  }

  function writeUrlState() {
    const url = new URL(window.location.href)
    if (state.category) url.searchParams.set('categoria', state.category)
    else url.searchParams.delete('categoria')
    if (state.query) url.searchParams.set('q', state.query)
    else url.searchParams.delete('q')
    window.history.replaceState({}, '', url)
  }

  function populateCategories() {
    if (!els.category) return
    const html = ['<option value="">Todas</option>']
    categories().forEach((category) => {
      const selected = normalizeText(category) === normalizeText(state.category)
      if (selected) state.category = category
      html.push(`<option value="${escapeHtml(category)}"${selected ? ' selected' : ''}>${escapeHtml(category)}</option>`)
    })
    els.category.innerHTML = html.join('')
  }

  function enhanceSelects() {
    if (!window.JAM?.enhanceDiscoverySelect) return
    selectControls.sort = window.JAM.enhanceDiscoverySelect(els.sort)
    selectControls.category = window.JAM.enhanceDiscoverySelect(els.category)
  }

  function syncSelects() {
    selectControls.sort?.sync()
    selectControls.category?.sync()
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  }

  async function fetchResults(page) {
    const sort = SORTS[state.sort] || SORTS.popular
    if (state.category) {
      return window.JAM.fetchContentByCategories({
        categorias: [state.category],
        orden: sort.orden,
        dir: sort.dir,
        page,
      })
    }
    return window.JAM.fetchContentSearch({
      q: state.query,
      orden: sort.orden,
      dir: sort.dir,
      page,
    })
  }

  async function fetchWorkers(query, limit = 8) {
    const clean = String(query || '').trim()
    if (clean.length < 2) return []

    const encoded = encodeURIComponent(clean)

    try {
      const data = await fetchJson(`${apiBase()}/trabajadores/buscar?q=${encoded}&limit=${limit}`)
      return rankWorkers(normalizeWorkers(payloadItems(data)), clean).slice(0, limit)
    } catch (error) {
      console.warn('[explorar] No se pudieron buscar trabajadores:', error)
      return []
    }
  }

  function rankWorkers(workers, query) {
    const target = normalizeText(query)

    return [...workers].sort((a, b) => {
      const aName = normalizeText(a.nombre)
      const bName = normalizeText(b.nombre)

      const aScore = aName === target ? 0 : aName.startsWith(target) ? 1 : aName.includes(target) ? 2 : 3
      const bScore = bName === target ? 0 : bName.startsWith(target) ? 1 : bName.includes(target) ? 2 : 3

      return aScore - bScore || aName.localeCompare(bName)
    })
  }

  async function fetchWorkerByName(name, role = 'Trabajador') {
    const matches = await fetchWorkers(name, 12)
    const target = normalizeText(name)

    const worker = (
      matches.find((item) => normalizeText(item.nombre) === target) ||
      matches.find((item) => normalizeText(item.nombre).includes(target)) ||
      matches[0] ||
      null
    )

    return worker ? { ...worker, rol: worker.rol || role } : null
  }

  async function fetchWorkerFilmography(workerId) {
    if (!workerId) return []

    try {
      const data = await fetchJson(`${apiBase()}/trabajadores/${encodeURIComponent(workerId)}/filmografia`)
      return uniqueItems(payloadItems(data))
    } catch (error) {
      console.warn('[explorar] No se pudo cargar filmografia:', error)
      return []
    }
  }

  async function fetchFilmographiesForWorkers(workers) {
    if (!Array.isArray(workers) || !workers.length) return []

    const settled = await Promise.allSettled(
      workers.map(async (worker) => ({
        workerId: worker.id,
        items: await fetchWorkerFilmography(worker.id),
      })),
    )

    settled.forEach((result) => {
      if (result.status !== 'fulfilled') return

      const worker = workers.find((item) => String(item.id) === String(result.value.workerId))
      if (worker) worker.totalContenido = result.value.items.length
    })

    return uniqueItems(
      settled.flatMap((result) => result.status === 'fulfilled' ? result.value.items : []),
    )
  }

  function pickEndgame(data) {
    const items = normalizeItems(payloadItems(data)).filter((item) => item?.id)
    return (
      items.find((item) => normalizeText(item.tituloPrincipal).includes('avengers endgame')) ||
      items.find((item) => normalizeText(item.tituloPrincipal).includes('endgame')) ||
      items[0] ||
      null
    )
  }

  async function fetchHeroEndgame() {
    try {
      const data = await fetchJson(`${apiBase()}/contenidos/top/por-nombres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(['Avengers: Endgame', 'Endgame']),
      })

      const found = pickEndgame(data)
      if (found?.id) return found
    } catch (error) {
      console.warn('[explorar] No se pudo resolver Endgame por nombres:', error)
    }

    try {
      const data = await window.JAM.fetchContentSearch({
        q: 'Endgame',
        orden: 'puntos',
        dir: 'desc',
        page: 0,
      })

      return pickEndgame(data)
    } catch (error) {
      console.warn('[explorar] No se pudo resolver Endgame por busqueda:', error)
      return null
    }
  }

  async function resolvePeople(names, role = 'Trabajador') {
    const settled = await Promise.allSettled(names.map((name) => fetchWorkerByName(name, role)))
    const seen = new Set()

    return settled
      .filter((result) => result.status === 'fulfilled' && result.value)
      .map((result) => result.value)
      .filter((item) => {
        const key = String(item.id)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
  }

  async function loadWorkerShelf(definition) {
    const items = await resolvePeople(definition.names, definition.role)
    await fetchFilmographiesForWorkers(items)
    return { ...definition, items }
  }

  async function loadStartData() {
    const [totals, shelves, workerShelves, endgame] = await Promise.allSettled([
      window.JAM.fetchContentTotals(),
      Promise.allSettled(SHELVES.map(loadShelf)),
      Promise.allSettled(WORKER_SHELVES.map(loadWorkerShelf)),
      fetchHeroEndgame(),
    ])

    if (totals.status === 'fulfilled') state.totals = totals.value
    if (shelves.status === 'fulfilled') {
      state.shelves = shelves.value
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)
        .filter((shelf) => shelf.items.length)
    }
    if (workerShelves.status === 'fulfilled') {
      state.workerShelves = workerShelves.value
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)
        .filter((shelf) => shelf.items.length)
    }
    if (endgame.status === 'fulfilled' && endgame.value?.id) state.heroEndgame = endgame.value

    state.featured = state.heroEndgame || state.shelves[0]?.items?.[0] || null
  }

  async function loadShelf(definition) {
    const items = normalizeItems(await window.JAM.fetchContentList(definition.endpoint))
      .filter((item) => item.imagenUrl)
      .slice(0, 18)
    return { ...definition, items }
  }

  function renderHero() {
    const target = state.heroEndgame || state.featured
    if (!target || !els.featureLink) return

    els.featureLink.href = hrefFor(target)
    els.featureLink.textContent = 'Ver Endgame'
  }

  function renderStats() {
    if (els.total) els.total.textContent = number(state.totals.total)
    if (els.movies) els.movies.textContent = number(state.totals.movies)
    if (els.series) els.series.textContent = number(state.totals.series)
  }

  function cardFor(item, compact = false) {
    if (!window.JAM?.buildCatalogCard) return fallbackContentCard(item)

    return window.JAM.buildCatalogCard({
      tag: 'a',
      href: hrefFor(item),
      id: item.id,
      title: item.tituloPrincipal,
      image: item.imagenUrl || '',
      rating: item.nota,
      subtitle: directorName(item),
      metaStart: typeLabel(item),
      metaEnd: year(item.fecha),
      className: compact ? 'pelicula-card--compact' : '',
      searchTitle: item.tituloPrincipal,
      searchCategory: typeLabel(item),
      searchNote: directorName(item),
      ariaLabel: `Ver ${item.tituloPrincipal}`,
    })
  }

  function fallbackContentCard(item) {
    return `
      <a class="pelicula-card" href="${escapeHtml(hrefFor(item))}" aria-label="Ver ${escapeHtml(item.tituloPrincipal)}">
        <div class="pelicula-card__poster">
          <img src="${escapeHtml(item.imagenUrl || '')}" alt="${escapeHtml(item.tituloPrincipal)}" loading="lazy" />
          <span class="pelicula-card__badge">★ ${escapeHtml(Number(item.nota || 0).toFixed(1))}</span>
        </div>
        <div class="pelicula-card__body">
          <h3 class="pelicula-card__title">${escapeHtml(item.tituloPrincipal)}</h3>
          <p class="pelicula-card__director">${escapeHtml(directorName(item))}</p>
          <div class="pelicula-card__footer">
            <span>${escapeHtml(typeLabel(item))}</span>
            <span>${escapeHtml(year(item.fecha))}</span>
          </div>
        </div>
      </a>`
  }

  function skeletonCards(count = 12) {
    if (!window.JAM?.buildCatalogSkeletonCard) {
      return Array.from({ length: count }, () => '<article class="skeleton-card"></article>').join('')
    }
    return Array.from({ length: count }, () => window.JAM.buildCatalogSkeletonCard()).join('')
  }

  function buildPersonResultCard(person, compact = false) {
    const fallback = !person.rutaFoto
    const totalContenido = Number(person.totalContenido)
    const hasTotalContenido = Number.isFinite(totalContenido)
    const filmographyLabel = hasTotalContenido
      ? `${number(totalContenido)} ${totalContenido === 1 ? 'titulo disponible' : 'titulos disponibles'}`
      : 'Titulos disponibles'
    const className = [
      'pelicula-card',
      'explore-worker-card',
      compact ? 'pelicula-card--compact' : '',
      fallback ? 'has-fallback' : '',
    ].filter(Boolean).join(' ')
    const image = person.rutaFoto
      ? `<img src="${escapeHtml(person.rutaFoto)}" alt="${escapeHtml(person.nombre)}" loading="lazy" onerror="this.closest('.explore-worker-card').classList.add('has-fallback')" /><span class="explore-person__initials">${escapeHtml(initials(person.nombre))}</span>`
      : `<span class="explore-person__initials">${escapeHtml(initials(person.nombre))}</span>`

    return `
      <a class="${className}" href="./trabajador.html?id=${encodeURIComponent(person.id)}" aria-label="Ver filmografia de ${escapeHtml(person.nombre)}">
        <div class="pelicula-card__poster explore-worker-card__poster">
          ${image}
        </div>
        <div class="pelicula-card__body">
          <h3 class="pelicula-card__title">${escapeHtml(person.nombre)}</h3>
          <p class="pelicula-card__director">FILMOGRAFIA:</p>
          <div class="pelicula-card__footer explore-worker-card__footer">
            <span>${escapeHtml(filmographyLabel)}</span>
          </div>
        </div>
      </a>`
  }

  function renderResults() {
    if (!els.grid) return

    const personCards = state.query.length >= 2 ? state.workers.map((person) => buildPersonResultCard(person)) : []
    const contentCards = state.results.map((item) => cardFor(item))
    const html = [...personCards, ...contentCards].join('')

    if (!html) {
      els.grid.innerHTML = `
        <article class="explore-empty">
          <h3 class="explore-empty__title">No encontramos coincidencias.</h3>
          <p class="explore-empty__text">Prueba otro termino, limpia la busqueda o cambia de categoria.</p>
        </article>`
      return
    }

    els.grid.innerHTML = html
  }

  function renderResultsHead() {
    const sortLabel = SORTS[state.sort]?.label || SORTS.popular.label
    const total = state.query ? state.displayedTotal : state.total

    if (els.resultsKicker) els.resultsKicker.textContent = state.query ? 'Busqueda' : state.category ? 'Categoria' : 'Catalogo'
    if (els.resultsTitle) els.resultsTitle.textContent = state.query ? `"${state.query}"` : state.category || 'Resultados'
    if (els.resultsCount) els.resultsCount.textContent = `${number(total)} resultados`

    if (!els.summary) return

    if (state.query) {
      const people = state.workers.length ? ` Incluye ${number(state.workers.length)} actor(es) o director(es).` : ''
      els.summary.textContent = `${number(total)} coincidencias para "${state.query}".${people}`
    } else if (state.category) {
      els.summary.textContent = `${number(state.total)} titulos en ${state.category}. Orden actual: ${sortLabel}.`
    } else {
      els.summary.textContent = `Explorando peliculas y series por ${sortLabel}.`
    }
  }

  function renderLoadMore() {
    if (!els.loadMore || !els.loadMoreBtn) return
    els.loadMore.hidden = state.last
    els.loadMoreBtn.disabled = state.loading
  }

  function renderWorkerResults() {
    if (!els.peopleSearch || !els.peopleGrid) return
    els.peopleSearch.hidden = true
    els.peopleGrid.innerHTML = ''
  }

  function personCard(person) {
    const fallback = !person.rutaFoto
    const image = person.rutaFoto
      ? `<img src="${escapeHtml(person.rutaFoto)}" alt="${escapeHtml(person.nombre)}" loading="lazy" onerror="this.closest('.explore-person').classList.add('has-fallback')" /><span class="explore-person__initials">${escapeHtml(initials(person.nombre))}</span>`
      : `<span class="explore-person__initials">${escapeHtml(initials(person.nombre))}</span>`

    return `
      <a class="explore-person${fallback ? ' has-fallback' : ''}" href="./trabajador.html?id=${encodeURIComponent(person.id)}">
        <span class="explore-person__media">${image}</span>
        <span class="explore-person__name">${escapeHtml(person.nombre)}</span>
        <span class="explore-person__hint">Ver contenidos</span>
      </a>`
  }

  function personRow(person) {
    const fallback = !person.rutaFoto
    const image = person.rutaFoto
      ? `<img src="${escapeHtml(person.rutaFoto)}" alt="${escapeHtml(person.nombre)}" loading="lazy" onerror="this.closest('.explore-person-row').classList.add('has-fallback')" /><span class="explore-person__initials">${escapeHtml(initials(person.nombre))}</span>`
      : `<span class="explore-person__initials">${escapeHtml(initials(person.nombre))}</span>`

    return `
      <a class="explore-person-row${fallback ? ' has-fallback' : ''}" href="./trabajador.html?id=${encodeURIComponent(person.id)}">
        <span class="explore-person-row__media">${image}</span>
        <span class="explore-person-row__copy">
          <span class="explore-person-row__name">${escapeHtml(person.nombre)}</span>
          <span class="explore-person-row__role">Actor / director</span>
        </span>
      </a>`
  }

  function renderPeopleRail(target, people) {
    if (!target) return
    target.innerHTML = people.length
      ? people.map(personCard).join('')
      : `<article class="explore-empty"><h3 class="explore-empty__title">Sin datos</h3><p class="explore-empty__text">No se pudieron cargar estos nombres.</p></article>`
  }

  function renderShelf(definition, cards) {
    const id = `explore-shelf-${definition.id}`
    return `
      <section class="explore-shelf">
        <div class="explore-section-head">
          <div>
            <p class="explore-kicker">${escapeHtml(definition.kicker)}</p>
            <h2 class="explore-shelf__title">${escapeHtml(definition.title)}</h2>
            <p class="explore-shelf__text">${escapeHtml(definition.text)}</p>
          </div>
          <div class="explore-shelf__controls">
            <button class="explore-shelf__nav" type="button" data-rail-prev="${id}" aria-label="Anterior">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>
            </button>
            <button class="explore-shelf__nav" type="button" data-rail-next="${id}" aria-label="Siguiente">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>
            </button>
          </div>
        </div>
        <div class="explore-shelf__track" id="${id}">
          ${cards}
        </div>
      </section>`
  }

  function renderShelves() {
    if (!els.shelves) return
    const show = !state.query && !state.category
    els.shelves.hidden = !show
    if (!show) {
      els.shelves.innerHTML = ''
      return
    }

    const contentShelves = state.shelves
      .map((shelf) => renderShelf(shelf, shelf.items.map((item) => cardFor(item, true)).join('')))

    const workerShelves = state.workerShelves
      .map((shelf) => renderShelf(shelf, shelf.items.map((person) => buildPersonResultCard(person, true)).join('')))

    els.shelves.innerHTML = [...contentShelves, ...workerShelves].join('')
  }

  function syncMenuIndex() {
    if (!window.JAM?.setSearchIndex) return

    const contentMap = new Map()
    ;[state.heroEndgame, ...state.results, ...state.shelves.flatMap((shelf) => shelf.items)]
      .filter(Boolean)
      .forEach((item) => {
        if (item?.id) {
          contentMap.set(String(item.id), {
            title: item.tituloPrincipal,
            category: typeLabel(item),
            href: hrefFor(item),
            note: directorName(item),
          })
        }
      })

    const peopleMap = new Map()
    ;[...state.workers, ...state.workerShelves.flatMap((shelf) => shelf.items)]
      .filter(Boolean)
      .forEach((item) => {
        if (item?.id) {
          peopleMap.set(String(item.id), {
            title: item.nombre,
            category: item.rol || 'Filmografia',
            href: `./trabajador.html?id=${encodeURIComponent(item.id)}`,
            note: 'Filmografia relacionada',
          })
        }
      })

    window.JAM.setSearchIndex([...peopleMap.values(), ...contentMap.values()])
  }

  function renderAll() {
    renderStats()
    renderHero()
    renderResultsHead()
    renderWorkerResults()
    renderResults()
    renderLoadMore()
    renderShelves()
    syncMenuIndex()
  }

  async function refreshResults(options = {}) {
    const append = Boolean(options.append)
    const token = ++state.requestToken
    state.loading = true
    renderLoadMore()
    if (!append && els.grid) els.grid.innerHTML = skeletonCards()

    try {
      const page = append ? state.page + 1 : 0
      const [contentResult, workerResult] = await Promise.allSettled([
        fetchResults(page),
        state.category ? Promise.resolve([]) : fetchWorkers(state.query, 8),
      ])

      if (token !== state.requestToken) return
      if (contentResult.status === 'rejected') throw contentResult.reason

      const payload = contentResult.value
      let items = normalizeItems(payloadItems(payload)).filter((item) => item.imagenUrl)
      const workers = !append && workerResult.status === 'fulfilled' ? workerResult.value : []

      if (!append && state.query.length >= 2 && workers.length) {
        const filmography = await fetchFilmographiesForWorkers(workers)
        items = uniqueItems([...items, ...filmography])
      }

      state.page = Number(payload.page ?? page)
      state.total = Number(payload.total ?? items.length)
      state.last = Boolean(payload.last ?? true)
      state.results = append ? uniqueItems([...state.results, ...items]) : uniqueItems(items)
      if (!append) state.workers = workers
      state.displayedTotal = Math.max(Number(state.total || 0), state.results.length) + (state.query.length >= 2 ? state.workers.length : 0)
    } catch (error) {
      console.error('[explorar] No se pudo cargar:', error)
      state.total = 0
      state.displayedTotal = 0
      state.last = true
      state.results = []
      state.workers = []
    } finally {
      if (token === state.requestToken) {
        state.loading = false
        renderAll()
      }
    }
  }

  function bindEvents() {
    let timer = null

    els.search?.addEventListener('input', () => {
      clearTimeout(timer)
      state.query = els.search.value.trim()
      if (state.query) {
        state.category = ''
        if (els.category) els.category.value = ''
        syncSelects()
      }
      writeUrlState()
      timer = window.setTimeout(() => refreshResults(), 220)
    })

    els.sort?.addEventListener('change', () => {
      state.sort = els.sort.value || 'popular'
      syncSelects()
      refreshResults()
    })

    els.category?.addEventListener('change', () => {
      state.category = els.category.value || ''
      state.query = ''
      if (els.search) els.search.value = ''
      syncSelects()
      writeUrlState()
      refreshResults()
    })

    els.reset?.addEventListener('click', () => {
      state.query = ''
      state.category = ''
      state.sort = 'popular'
      state.displayedTotal = 0
      if (els.search) els.search.value = ''
      if (els.sort) els.sort.value = 'popular'
      if (els.category) els.category.value = ''
      syncSelects()
      writeUrlState()
      refreshResults()
    })

    els.loadMoreBtn?.addEventListener('click', () => {
      if (!state.last && !state.loading) refreshResults({ append: true })
    })

    els.page?.addEventListener('click', (event) => {
      const prev = event.target.closest('[data-rail-prev]')
      const next = event.target.closest('[data-rail-next]')
      const id = prev?.dataset.railPrev || next?.dataset.railNext
      if (!id) return
      const track = byId(id)
      if (track) track.scrollBy({ left: track.clientWidth * (prev ? -0.86 : 0.86), behavior: 'smooth' })
    })
  }

  function collect() {
    els.page = byId('page-explorar')
    els.heroMedia = byId('explore-hero-media')
    els.feature = byId('explore-feature')
    els.featureLink = byId('explore-feature-link')
    els.total = byId('explore-total')
    els.movies = byId('explore-movies')
    els.series = byId('explore-series')
    els.search = byId('explore-search')
    els.sort = byId('explore-sort')
    els.category = byId('explore-category')
    els.reset = byId('explore-reset')
    els.summary = byId('explore-summary')
    els.peopleSearch = byId('explore-people-search')
    els.peopleGrid = byId('explore-people-grid')
    els.resultsKicker = byId('explore-results-kicker')
    els.resultsTitle = byId('explore-results-title')
    els.resultsCount = byId('explore-results-count')
    els.grid = byId('explore-results-grid')
    els.loadMore = byId('explore-loadmore')
    els.loadMoreBtn = byId('explore-loadmore-btn')
    els.shelves = byId('explore-shelves')
    els.actorsRail = byId('explore-actors-rail')
    els.directorsRail = byId('explore-directors-rail')
  }

  async function init() {
    collect()
    readUrlState()
    populateCategories()
    if (els.search) els.search.value = state.query
    if (els.sort) els.sort.value = state.sort
    if (els.category) els.category.value = state.category
    enhanceSelects()
    bindEvents()
    await loadStartData()
    renderStats()
    renderHero()
    renderShelves()
    await refreshResults()
  }

  document.addEventListener('DOMContentLoaded', () => {
    init().catch((error) => {
      console.error('[explorar] Error de arranque:', error)
      if (els.grid) {
        els.grid.innerHTML = `
          <article class="explore-empty">
            <h3 class="explore-empty__title">No se pudo cargar Explorar.</h3>
            <p class="explore-empty__text">Verifica que el backend este activo y recarga la pagina.</p>
          </article>`
      }
    })
  })
})()
