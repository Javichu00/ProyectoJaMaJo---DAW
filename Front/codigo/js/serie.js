(function () {
  const escapeHtml =
    window.JAM?.escapeHtml ||
    ((value) =>
      String(value ??'')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;'))

  const EMPTY_VALUE = ''
  const episodeImageCache = new Map()
  const episodeDetailCache = new Map()

  function getIdFromUrl() {
    return new URLSearchParams(window.location.search).get('id')
  }

  function getYear(fecha) {
    return fecha ?fecha.substring(0, 4) : EMPTY_VALUE
  }

  function formatDuration(min) {
    if (!min) return EMPTY_VALUE
    const hours = Math.floor(min / 60)
    const minutes = min % 60
    return hours > 0 ?`${hours}h ${minutes}m` : `${minutes}m`
  }

  function formatEpisodeDuration(min) {
    return min ?`${min} min` : EMPTY_VALUE
  }

  function formatDate(date) {
    if (!date) return EMPTY_VALUE

    try {
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(`${date}T00:00:00`))
    } catch {
      return date
    }
  }

  function pluralize(count, singular, plural) {
    if (!count) return `0 ${plural}`
    return `${count} ${count === 1 ?singular : plural}`
  }

  function formatType(value) {
    if (String(value || '').toUpperCase() === 'SERIE') return 'Serie'
    return escapeHtml(value || 'Contenido')
  }

  function getInitials(nombre) {
    if (!nombre) return '?'
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
  }

  function getDirectorName(director) {
    return normalizeCatalogText(director?.nombre || EMPTY_VALUE)
  }

  function buildDirectorAvatar(director) {
    const directorName = normalizeCatalogText(director?.nombre || 'Director')

    if (director?.rutaFoto) {
      return `
        <img
          class="detalle-director__photo"
          src="${director.rutaFoto}"
          alt="${escapeHtml(directorName)}"
          loading="lazy"
        />
      `
    }

    return `<div class="detalle-director__avatar">${escapeHtml(getInitials(directorName))}</div>`
  }

  function normalizeCatalogText(value) {
    return String(value ?? '')
  }

  function getCategories(item) {
    if (Array.isArray(item?.categorias)) {
      return item.categorias.filter(Boolean).slice(0, 4)
    }
    const raw = window.JAM?.getCategoriesForContent?.(item)
    return Array.isArray(raw)
      ? raw.map((cat) => normalizeCatalogText(cat)).filter(Boolean).slice(0, 4)
      : []
  }

  function getCategoryHref(category) {
    return `./categoria.html?categoria=${encodeURIComponent(category)}`
  }

  function buildCategoryChip(category) {
    const label = escapeHtml(category)
    return `<a class="detalle-genre-chip" href="${getCategoryHref(category)}" aria-label="Ver categoria ${label}">${label}</a>`
  }

  function getSeriesGuide(idApi) {
    return window.JAM_SERIES_GUIDE?.[idApi] || null
  }

  function buildEpisodeMeta(episode) {
    const parts = [formatEpisodeDuration(episode.duration), formatDate(episode.date)].filter(Boolean)
    return parts.length ?parts.join(' · ') : 'Episodio'
  }

  function getEpisodeCacheKey(tvId, season, episode) {
    return `${tvId}-${season}-${episode}`
  }

  function toYoutubeEmbed(url) {
    if (!url) return null
    const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    return match ?`https://www.youtube.com/embed/${match[1]}?rel=0` : null
  }

  function backSvg() {
    return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>`
  }

  function starSvg() {
    return `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
  }

  function playSvg() {
    return `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`
  }

  function imageSvg() {
    return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m8 13 2.5-2.5L16 16"></path><circle cx="9" cy="9" r="1"></circle></svg>`
  }

  function formatVisualLabel(index, total) {
    return `Imagen ${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
  }

  function buildVisualSet(serie, tmdbImages) {
    const normalized = (Array.isArray(tmdbImages) ?tmdbImages : [])
      .map((item, index) => ({
        url: item?.url || '',
        width: Number(item?.width || 0),
        height: Number(item?.height || 0),
        key: item?.url || `${serie.id}-${index}`,
      }))
      .filter((item) => item.url)

    const seen = new Set()
    const unique = normalized.filter((item) => {
      if (seen.has(item.url)) return false
      seen.add(item.url)
      return true
    })

    if (!unique.length && serie.imagenUrl) {
      unique.push({
        url: serie.imagenUrl,
        width: 0,
        height: 0,
        key: `${serie.id}-poster`,
      })
    }

    return {
      backdrops: unique.slice(0, 10),
      featured: unique[0] || null,
    }
  }

  function buildReel(images, title) {
    return images
      .map(
        (image, index) => `
          <button
            class="detalle-stage__reel-item${index === 0 ?' is-active' : ''}"
            type="button"
            data-visual-button
            data-visual-index="${index}"
          >
            <img src="${image.url}" />
          </button>
        `,
      )
      .join('')
  }

  async function fetchContenido(id) {
    const response = await fetch(`${API_BASE}/contenidos/${id}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  }

  function buildGuideFromEpisodes(contentId, episodes) {
    const safeEpisodes = Array.isArray(episodes) ? episodes : []
    if (!safeEpisodes.length) return null

    const seasonMap = new Map()

    safeEpisodes.forEach((episode) => {
      const season = episode?.temporada
      const seasonNumber = Number(
        season?.numeroTemporada ?? season?.seasonNumber ?? season?.number ?? 0,
      )
      if (!seasonNumber) return

      if (!seasonMap.has(seasonNumber)) {
        seasonMap.set(seasonNumber, {
          number: seasonNumber,
          name: normalizeCatalogText(season?.nombre || `Temporada ${seasonNumber}`),
          description: normalizeCatalogText(season?.descripcion || ''),
          episodes: [],
        })
      }

      seasonMap.get(seasonNumber).episodes.push({
        number: Number(episode?.numeroEpisodio ?? 0),
        title: normalizeCatalogText(episode?.titulo || `Episodio ${episode?.numeroEpisodio ?? ''}`),
        description: normalizeCatalogText(episode?.descripcion || ''),
        duration: Number(episode?.duracion || 0),
        date: episode?.fechaEmision || '',
      })
    })

    const seasons = [...seasonMap.values()]
      .sort((a, b) => a.number - b.number)
      .map((season) => {
        const uniqueEpisodes = season.episodes
          .filter((ep) => Number(ep.number) > 0)
          .sort((a, b) => a.number - b.number)
        return { ...season, episodes: uniqueEpisodes, episodeCount: uniqueEpisodes.length }
      })
      .filter((season) => season.episodes.length)

    if (!seasons.length) return null

    return {
      seasonCount: seasons.length,
      episodeCount: seasons.reduce((total, s) => total + s.episodeCount, 0),
      seasons,
    }
  }

  function normalizeEpisodeDetailPayload(payload, seasonNumber, episodeNumber) {
    if (!payload) return null

    if (typeof payload === 'string') {
      return { descripcion: payload }
    }

    if (Array.isArray(payload)) {
      return (
        payload.find((item) => {
          const itemSeason =
            item?.temporada?.numeroTemporada ??
            item?.numeroTemporada ??
            item?.seasonNumber ??
            item?.season
          const itemEpisode =
            item?.numeroEpisodio ??item?.episodeNumber ??item?.episode

          return Number(itemSeason) === Number(seasonNumber) && Number(itemEpisode) === Number(episodeNumber)
        }) || null
      )
    }

    return payload
  }

  async function fetchEpisodeDetailFromCatalog(contentId, seasonNumber, episodeNumber) {
    const url = `${API_BASE}/episodios/contenido/${contentId}/temporada/${seasonNumber}/episodio/${episodeNumber}`
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('respuesta no ok')

      const contentType = response.headers.get('content-type') || ''
      const raw = contentType.includes('application/json')
        ? await response.json()
        : await response.text()
      const normalized = normalizeEpisodeDetailPayload(raw, seasonNumber, episodeNumber)
      if (normalized) return normalized
    } catch {
      // cae al error final
    }

    throw new Error('No se pudo resolver la descripción del episodio')
  }

  function getInitialGuideState(guide) {
    const firstSeason = guide?.seasons?.[0] || null
    return {
      seasonNumber: firstSeason?.number ??null,
      episodeNumber: firstSeason?.episodes?.[0]?.number ??null,
    }
  }

  function getActiveSeason(guide, seasonNumber) {
    if (!guide?.seasons?.length) return null
    return guide.seasons.find((season) => season.number === seasonNumber) || guide.seasons[0]
  }

  function getActiveEpisode(season, episodeNumber) {
    if (!season?.episodes?.length) return null
    return season.episodes.find((episode) => episode.number === episodeNumber) || season.episodes[0]
  }

  function formatEpisodeCode(seasonNumber, episodeNumber) {
    return `T${String(seasonNumber).padStart(2, '0')} · E${String(episodeNumber).padStart(2, '0')}`
  }

  function getEpisodeDescription(episode) {
    return episode?.description || episode?.descripcion || episode?.overview || ''
  }

  function buildEpisodeSpotlight(season, episode, imageUrl) {
    if (!season || !episode) return ''
    return `
      <article class="detalle-episode-spotlight">
        ${imageUrl ? `
          <div class="detalle-episode-spotlight__image">
            <img src="${imageUrl}" alt="${escapeHtml(episode.title || '')}" loading="lazy" />
          </div>
        ` : ''}
        <div class="detalle-episode-spotlight__info">
          <div class="detalle-episode-spotlight__meta">
            <span>${formatEpisodeCode(season.number, episode.number)}</span>
            <span>${escapeHtml(buildEpisodeMeta(episode))}</span>
          </div>
          <h3>${escapeHtml(episode.title || `Episodio ${episode.number}`)}</h3>
          <p>${escapeHtml(getEpisodeDescription(episode) || 'Sin descripción disponible.')}</p>
        </div>
      </article>
    `
  }

  function buildTrailerSection(serie) {
    const embedUrl = toYoutubeEmbed(serie.trailerUrl)

    if (embedUrl && window.location.protocol !== 'file:') {
      return `
        <div class="detalle-trailer">
          <iframe
            src="${embedUrl}"
            title="Tráiler de ${escapeHtml(normalizeCatalogText(serie.tituloPrincipal))}"
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
      `
    }

    if (serie.trailerUrl) {
      return `
        <a
          class="detalle-trailer detalle-trailer--fallback"
          href="${serie.trailerUrl}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div
            class="detalle-trailer__backdrop"
            style="background-image:url('${serie.imagenUrl || ''}')"
            aria-hidden="true"
          ></div>
          <div class="detalle-trailer__overlay" aria-hidden="true"></div>
          <div class="detalle-trailer__copy">
            <span class="detalle-trailer__eyebrow">Tráiler</span>
            <strong>Abrir en YouTube</strong>
            <span>Si lo abres en localhost se reproduce aquí dentro de la ficha.</span>
          </div>
          <span class="detalle-trailer__button">${playSvg()}</span>
        </a>
      `
    }

    return `
      <div class="detalle-trailer detalle-trailer--placeholder">
        <div class="detalle-trailer__placeholder">
          <span>${imageSvg()}</span>
          <p>No hay tráiler disponible para esta serie.</p>
        </div>
      </div>
    `
  }

  function buildSeasonButtons(guide, activeSeasonNumber) {
    return guide.seasons
      .map(
        (season) => `
          <button
            class="detalle-season-chip${season.number === activeSeasonNumber ?' is-active' : ''}"
            type="button"
            data-season-button
            data-season-number="${season.number}"
          >
            T${season.number}
          </button>
        `,
      )
      .join('')
  }

  function buildEpisodeCards(season, activeEpisodeNumber) {
    return season.episodes.map((episode) => `
      <button
        class="detalle-episode-card${episode.number === activeEpisodeNumber ? ' is-active' : ''}"
        type="button"
        data-episode-button
        data-episode-number="${episode.number}"
      >
        <span class="detalle-episode-card__backdrop" data-episode-backdrop></span>
        <span class="detalle-episode-card__overlay"></span>
        <span class="detalle-episode-card__body">
          <span class="detalle-episode-card__code">${formatEpisodeCode(season.number, episode.number)}</span>
          <strong>${escapeHtml(episode.title)}</strong>
          <span class="detalle-episode-card__meta">${escapeHtml(buildEpisodeMeta(episode))}</span>
        </span>
      </button>
    `).join('')
  }

  async function resolveEpisodeImage(tvId, seasonNumber, episodeNumber) {
    const cacheKey = getEpisodeCacheKey(tvId, seasonNumber, episodeNumber)

    if (episodeImageCache.has(cacheKey)) {
      return episodeImageCache.get(cacheKey)
    }

    try {
      const images = await fetchImagenesDeEpisodioByIdTmdb(tvId, seasonNumber, episodeNumber)
      let url = null

      if (Array.isArray(images) && images.length) {
        if (typeof images[0] === 'string') {
          url = images[0]
        } else if (images[0]?.url) {
          url = images[0].url
        }
      }

      episodeImageCache.set(cacheKey, url)
      return url
    } catch {
      episodeImageCache.set(cacheKey, null)
      return null
    }
  }

  async function hydrateEpisodeDetail(panel, serie, season, episode) {
    const externalDetail = document.querySelector('[data-episode-detail]')
    if (!externalDetail || !serie?.id || !season || !episode || getEpisodeDescription(episode)) return

    const cacheKey = `${serie.id}-${season.number}-${episode.number}`
    try {
      let details = episodeDetailCache.get(cacheKey)
      if (!details) {
        details = await fetchEpisodeDetailFromCatalog(serie.id, season.number, episode.number)
        episodeDetailCache.set(cacheKey, details)
      }

      const overview =
        details?.descripcion || details?.description || details?.overview || ''

      if (overview) {
        episode.description = overview
        const cachedImg = episodeImageCache.get(getEpisodeCacheKey(serie.id, season.number, episode.number)) || null
        externalDetail.innerHTML = buildEpisodeSpotlight(season, episode, cachedImg)

        const activeCard = panel?.querySelector(`[data-episode-button][data-episode-number="${episode.number}"]`)
        const cardDescription = activeCard?.querySelector('.detalle-episode-card__description')
        if (cardDescription) {
          cardDescription.textContent = overview
        }
      }
    } catch {
      episodeDetailCache.set(cacheKey, null)
    }
  }

  async function hydrateEpisodeImages(panel, tvId, season, fallbackImage) {
    if (!panel || !tvId || !season?.episodes?.length) return

    const cards = [...panel.querySelectorAll('[data-episode-button]')]

    await Promise.all(
      season.episodes.map(async (episode, index) => {
        const imageUrl = await resolveEpisodeImage(tvId, season.number, episode.number)
        const card = cards[index]
        const backdrop = card?.querySelector('[data-episode-backdrop]')
        if (!backdrop) return
        backdrop.style.backgroundImage = `url('${imageUrl || fallbackImage || ''}')`
        card.classList.toggle('has-image', Boolean(imageUrl || fallbackImage))
      }),
    )
  }

  async function hydrateGuideBackdrop(panel, tvId, season, episode, fallbackImage) {
    if (!panel || !season || !episode) return

    const guideBackdrop = panel.querySelector('[data-guide-backdrop]')
    if (!guideBackdrop) return

    const imageUrl = tvId
      ?await resolveEpisodeImage(tvId, season.number, episode.number)
      : null

    const finalUrl = imageUrl || fallbackImage || ''
    guideBackdrop.style.backgroundImage = finalUrl ?`url('${finalUrl}')` : ''
    panel.classList.toggle('has-guide-image', Boolean(finalUrl))
  }

  function animateEpisodePanel(panel) {
    if (panel.dataset.animated === 'true') return

    panel.dataset.animated = 'true'

    if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const items = panel.querySelectorAll(
      '.detalle-season-chip, .detalle-episode-spotlight, .detalle-episode-card, .detalle-empty-panel',
    )

    if (!items.length) return

    window.gsap.fromTo(
      items,
      { y: 12, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.34,
        ease: 'power2.out',
        stagger: 0.03,
        overwrite: 'auto',
      },
    )
  }

  function renderEpisodeGuide(panel, guide, state, serie) {
    if (!panel) return

    if (!guide?.seasons?.length) {
      panel.innerHTML = `
        <div class="detalle-card__label">Temporadas</div>
        <h2 class="detalle-card__title">Guía de episodios</h2>
        <div class="detalle-empty-panel">
          <span>${imageSvg()}</span>
          <p>Esta serie todavía no tiene temporadas importadas.</p>
        </div>
      `
      animateEpisodePanel(panel)
      return
    }
    const prevTrack = panel.querySelector('.detalle-episode-track')
    const scrollLeft = prevTrack ?prevTrack.scrollLeft : 0
    const activeSeason = getActiveSeason(guide, state.seasonNumber)
    const activeEpisode = getActiveEpisode(activeSeason, state.episodeNumber)

    state.seasonNumber = activeSeason?.number ??null
    state.episodeNumber = activeEpisode?.number ??null

    panel.innerHTML = `
      <div class="detalle-guide-surface">
        <span class="detalle-guide-surface__backdrop" data-guide-backdrop></span>
        <span class="detalle-guide-surface__overlay"></span>
        <div class="detalle-guide-surface__content">
          <div class="detalle-card__label">Temporadas</div>
          <h2 class="detalle-card__title">Guía de episodios</h2>

          <div class="detalle-season-strip">
            ${buildSeasonButtons(guide, state.seasonNumber)}
          </div>

          <div class="detalle-season-summary">
            <div>
              <strong>${escapeHtml(activeSeason.name || `Temporada ${activeSeason.number}`)}</strong>
              <span>${pluralize(activeSeason.episodeCount || activeSeason.episodes.length, 'episodio', 'episodios')}</span>
            </div>
          </div>

          <div class="detalle-episode-track">
            ${buildEpisodeCards(activeSeason, state.episodeNumber)}
          </div>
        </div>
      </div>
    `
    const newTrack = panel.querySelector('.detalle-episode-track')
    if (newTrack) newTrack.scrollLeft = scrollLeft

    panel.querySelectorAll('[data-season-button]').forEach((button) => {
      button.addEventListener('click', () => {
        const nextSeason = getActiveSeason(guide, Number(button.dataset.seasonNumber))
        state.seasonNumber = nextSeason?.number ??null
        state.episodeNumber = nextSeason?.episodes?.[0]?.number ??null
        renderEpisodeGuide(panel, guide, state, serie)
        enableHorizontalScroll(panel)
      })
    })

    panel.querySelectorAll('[data-episode-button]').forEach((button) => {
      button.addEventListener('click', () => {
        const newEpisodeNumber = Number(button.dataset.episodeNumber)
        if (newEpisodeNumber === state.episodeNumber) return

        state.episodeNumber = newEpisodeNumber

        panel.querySelectorAll('[data-episode-button]').forEach((btn) => {
          btn.classList.toggle('is-active', Number(btn.dataset.episodeNumber) === newEpisodeNumber)
        })

        const activeSeasonNow = getActiveSeason(guide, state.seasonNumber)
        const activeEpisodeNow = getActiveEpisode(activeSeasonNow, newEpisodeNumber)
        const spotlight = panel.querySelector('.detalle-episode-spotlight')
        if (spotlight) {
          spotlight.outerHTML = buildEpisodeSpotlight(activeSeasonNow, activeEpisodeNow, null)
        }

        const externalDetail = document.querySelector('[data-episode-detail]')
        if (externalDetail) {
          const cachedImg = episodeImageCache.get(getEpisodeCacheKey(serie.idTmdb, state.seasonNumber, newEpisodeNumber)) || null
          externalDetail.innerHTML = buildEpisodeSpotlight(activeSeasonNow, activeEpisodeNow, cachedImg)
        }

        hydrateGuideBackdrop(panel, serie.idTmdb, activeSeasonNow, activeEpisodeNow, serie.imagenUrl)
        hydrateEpisodeDetail(panel, serie, activeSeasonNow, activeEpisodeNow)
      })
    })

    animateEpisodePanel(panel)
    hydrateEpisodeImages(panel, serie.idTmdb, activeSeason, serie.imagenUrl)
    hydrateGuideBackdrop(panel, serie.idTmdb, activeSeason, activeEpisode, serie.imagenUrl)
    hydrateEpisodeDetail(panel, serie, activeSeason, activeEpisode)
  }

  function renderLoading(container) {
    container.innerHTML = window.JAM?.buildDetailSkeleton
      ?window.JAM.buildDetailSkeleton()
      : `
        <div class="detalle-loading">
          <div class="detalle-loading__spinner"></div>
          <div class="detalle-loading__text">Cargando...</div>
        </div>
      `
  }

  function renderError(container, message) {
    container.innerHTML = `
      <div class="detalle-error">
        <div class="detalle-error__icon">${imageSvg()}</div>
        <h2>No encontrado</h2>
        <p>${message || 'No se pudo cargar la información de esta serie.'}</p>
        <a class="detalle-btn detalle-btn--primary" href="./series.html">
          ${backSvg()} Volver al catálogo
        </a>
      </div>
    `
  }

  function enableHorizontalScroll(panel) {
    const track = panel.querySelector('.detalle-episode-track')
    const seasonStrip = panel.querySelector('.detalle-season-strip')

    ;[track, seasonStrip].forEach((el) => {
      if (!el) return

      el.addEventListener(
        'wheel',
        (e) => {
          if (el.scrollWidth > el.clientWidth) {
            e.preventDefault()
            el.scrollLeft += e.deltaY
          }
        },
        { passive: false }
      )
    })
  }

  function renderDetalle(container, serie, tmdbImages, dbGuide, trabajadores) {
    const title = normalizeCatalogText(serie.tituloPrincipal)
    const description = normalizeCatalogText(serie.descripcion || 'Sin descripción disponible.')
    const directorName = getDirectorName(serie.director)
    const categories = getCategories(serie)
    const guide = dbGuide || getSeriesGuide(serie.idApi)
    const hasGuide = Boolean(guide?.seasons?.length)
    const state = getInitialGuideState(guide)
    const workersSection =
      window.JAM?.buildTrabajadoresSection?.(trabajadores, {
        label: 'Actores',
        title: 'Reparto principal',
      }) || ''
    const visuals = buildVisualSet(serie, tmdbImages)
    const featured = visuals.featured
    const genresMarkup = categories
      .map(buildCategoryChip)
      .join('')

    const metaPills = [
      serie.nota ?`<span class="detalle-pill detalle-pill--nota">${starSvg()} ${escapeHtml(serie.nota)} / 10</span>` : '',
      serie.duracion ?`<span class="detalle-pill">${escapeHtml(formatDuration(serie.duracion))}</span>` : '',
      guide?.seasonCount ?`<span class="detalle-pill">${escapeHtml(pluralize(guide.seasonCount, 'temporada', 'temporadas'))}</span>` : '',
      guide?.episodeCount ?`<span class="detalle-pill">${escapeHtml(pluralize(guide.episodeCount, 'episodio', 'episodios'))}</span>` : '',
    ]
      .filter(Boolean)
      .join('')

    container.innerHTML = `
      <section class="detalle-film-shell">
        <section class="detalle-stage anim-fade-in" data-stage>
          <div
            class="detalle-stage__backdrop"
            data-stage-backdrop
            style="background-image:url('${featured?.url || serie.imagenUrl || ''}')"
            aria-hidden="true"
          ></div>
          <div class="detalle-stage__wash" aria-hidden="true"></div>
          <div class="detalle-stage__noise" aria-hidden="true"></div>

          <div class="detalle-stage__content">
            <nav class="detalle-breadcrumb" aria-label="Navegación">
              <a href="./series.html">${backSvg()} Series</a>
              <span class="detalle-breadcrumb__sep">/</span>
              <span>${escapeHtml(serie.tituloPrincipal)}</span>
            </nav>

            <div class="detalle-stage__main">
              <div class="detalle-poster-wrap" data-stage-poster>
                <div class="detalle-poster">
                  <img
                    src="${serie.imagenUrl || ''}"
                    alt="Poster de ${escapeHtml(serie.tituloPrincipal)}"
                    onerror="this.style.opacity='0'"
                  />
                </div>
              </div>

              <div class="detalle-stage__copy">
                <div class="detalle-stage__eyebrow">
                  <span>${formatType(serie.tipoContenido)}</span>
                  <span>/</span>
                  <span>${escapeHtml(getYear(serie.fecha))}</span>
                </div>

                <h1 class="detalle-stage__title">${escapeHtml(title)}</h1>

                ${genresMarkup ?`<div class="detalle-stage__genres">${genresMarkup}</div>` : ''}

                <div class="detalle-stage__meta">
                  ${metaPills}
                </div>

                <div class="detalle-stage__actions">
                  <button class="detalle-btn detalle-btn--ghost" id="btn-guardar" type="button">
                    + Mi lista
                  </button>
                  <button class="detalle-btn detalle-btn--primary" id="btn-ver-jam" type="button">
                    Ver en JAM
                  </button>
                </div>
              </div>
            </div>

            <div class="detalle-stage__reel">
              <div class="detalle-stage__reel-head">
                <div>
                  <p class="detalle-stage__reel-label">Galería</p>
                  <h2 class="detalle-stage__reel-title">FOTOS</h2>
                </div>
              </div>
              <div class="detalle-stage__reel-track">
                ${buildReel(visuals.backdrops, serie.tituloPrincipal)}
              </div>
            </div>

          </div>
        </section>

        <section class="detalle-layout${hasGuide ?'' : ' detalle-layout--no-guide'}">
          <article class="detalle-card detalle-card--story">
            <div class="detalle-card__label">Sinopsis</div>
            <h2 class="detalle-card__title">De qué va</h2>
            <p class="detalle-desc">${escapeHtml(description)}</p>
          </article>

          ${
            hasGuide
              ?`
          <article class="detalle-card detalle-card--episodes" data-episode-guide></article>
          <aside class="detalle-card detalle-card--episode-detail" data-episode-detail></aside>
          `
              : ''
          }

          ${workersSection}

          <article class="detalle-card detalle-card--trailer">
            <div class="detalle-card__label">Tráiler</div>
            ${buildTrailerSection(serie)}
          </article>

          <aside class="detalle-card detalle-card--director" data-director-id="${serie.director?.id || ''}">
            <div class="detalle-card__label">Dirección</div>
            <h2 class="detalle-card__title">Dirección</h2>
            <div class="detalle-director">
              ${buildDirectorAvatar(serie.director)}
              <div class="detalle-director__copy">
                <div class="detalle-director__name">${escapeHtml(directorName)}</div>
                <div class="detalle-director__role">Dirección principal</div>
              </div>
            </div>
            <div class="detalle-director__facts">
              <span>Ficha creativa</span>
              <strong>${escapeHtml(title)}</strong>
            </div>
          </aside>
        </section>

        <section class="resenas-section" data-resenas-section></section>

        <section class="detalle-recommendations-section">
          <div class="detalle-recommendations__head">
            <div>
              <p class="detalle-card__label">Recomendaciones</p>
              <h2 class="detalle-card__title">Más historias de este estilo</h2>
            </div>
          </div>
          <div class="detalle-recommendations-track" data-recommendations>
            ${window.JAM?.buildCatalogSkeletonCard ?Array.from({ length: 5 }).map(() => window.JAM.buildCatalogSkeletonCard('recommendation-card')).join('') : ''}
          </div>
        </section>
      </section>
    `

    const guidePanel = container.querySelector('[data-episode-guide]')
    const episodeDetail = container.querySelector('[data-episode-detail]')
    if (guidePanel) {
      renderEpisodeGuide(guidePanel, guide, state, serie)
      enableHorizontalScroll(guidePanel)
    }
    if (episodeDetail && hasGuide) {
      episodeDetail.innerHTML = buildEpisodeSpotlight(getActiveSeason(guide, state.seasonNumber), getActiveEpisode(getActiveSeason(guide, state.seasonNumber), state.episodeNumber), null)
    }

    if (episodeDetail && hasGuide && serie.idTmdb) {
      const firstSeason = getActiveSeason(guide, state.seasonNumber)
      const firstEpisode = getActiveEpisode(firstSeason, state.episodeNumber)
    
      resolveEpisodeImage(serie.idTmdb, state.seasonNumber, state.episodeNumber).then((imageUrl) => {
        if (imageUrl && episodeDetail.isConnected) {
          episodeDetail.innerHTML = buildEpisodeSpotlight(firstSeason, firstEpisode, imageUrl)
        }
      })
    }
    
    bindDetailInteractions(container, visuals, serie)
    hydrateRecommendationsForContent(container, serie)

    const resenasSectionEl = container.querySelector('[data-resenas-section]')
    if (resenasSectionEl && window.JAM_RESENAS) {
      window.JAM_RESENAS.render(resenasSectionEl, serie.id)
    }

    animateDetalle(container)
    document.title = `${serie.tituloPrincipal} | JAM`
  }

  function bindDetailInteractions(container, visuals, serie) {
    const stage = container.querySelector('[data-stage]')
    const backdropNode = container.querySelector('[data-stage-backdrop]')
    const posterNode = container.querySelector('[data-stage-poster]')
    const saveButton = container.querySelector('#btn-guardar')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const buttons = container.querySelectorAll('[data-visual-button]')
    const reelTrack = container.querySelector('.detalle-stage__reel-track')
    if (reelTrack) {
      reelTrack.addEventListener(
        'wheel',
        (e) => {
          if (reelTrack.scrollWidth > reelTrack.clientWidth) {
            e.preventDefault()
            reelTrack.scrollLeft += e.deltaY
          }
        },
        { passive: false },
      )
    }

    function applyVisual(index) {
      const current = visuals.backdrops[index]
      if (!current || !backdropNode) return

      backdropNode.style.backgroundImage = `url('${current.url}')`

      buttons.forEach((btn) => {
        const active = Number(btn.dataset.visualIndex) === index
        btn.classList.toggle('is-active', active)
      })
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        applyVisual(Number(button.dataset.visualIndex))
      })
    })

    if (saveButton && window.JAM_LISTAS?.bindGuardarBtn) {
      window.JAM_LISTAS.bindGuardarBtn(saveButton, serie.id)
    }

    if (stage && backdropNode && posterNode && window.gsap && !prefersReducedMotion) {
      stage.addEventListener('pointermove', (event) => {
        const rect = stage.getBoundingClientRect()
        const offsetX = (event.clientX - rect.left) / rect.width - 0.5
        const offsetY = (event.clientY - rect.top) / rect.height - 0.5

        window.gsap.to(backdropNode, {
          x: offsetX * 16,
          y: offsetY * 12,
          duration: 0.65,
          ease: 'power2.out',
          overwrite: 'auto',
        })

        window.gsap.to(posterNode, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
        })
      })

      stage.addEventListener('pointerleave', () => {
        window.gsap.to(backdropNode, {
          x: 0,
          y: 0,
          scale: 1.06,
          duration: 0.7,
          ease: 'power3.out',
        })

        window.gsap.to(posterNode, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
        })
      })
    }

    const verJamButton = container.querySelector('#btn-ver-jam')

    verJamButton?.addEventListener('click', async () => {
      const user = JSON.parse(localStorage.getItem('JAM_user') || 'null')
      const profile = JSON.parse(localStorage.getItem('JAM_profile') || 'null')
    
      if (!user?.email) {
        window.location.href = './landing.html'
        return
      }

      if (!profile?.idCuenta || profile?.email !== user.email) {
        window.location.href = './perfiles.html'
        return
      }

      let plan = 'GRATIS'

      try {
        const account =
          (await window.JAM?.fetchUsuarioByEmail?.(user.email)) ||
          (await fetch(`${API_BASE}/usuarios/${encodeURIComponent(user.email)}`).then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            return response.json()
          }))

        plan = String(
          account?.nombrePlan ||
          account?.plan?.nombrePlan ||
          account?.plan?.nombre ||
          'GRATIS',
        ).toUpperCase()
      } catch (error) {
        console.warn('[serie.js] No se pudo comprobar el plan real:', error)
        window.location.href = './perfiles.html'
        return
      }
    
      if (plan === 'GRATIS') {
        window.location.href = './planes.html'
        return
      }
      
      const content = container.querySelector('.detalle-stage__content')
      if (!stage || !content) return
      
      const savedHTML = content.innerHTML
      const playerUrl = `https://streamimdb.ru/embed/movie/${serie.idApi}/`
      
      if (plan === 'ANUNCIOS') {
        const ADS_VIDEOS = [
          '../../multimedia/ads/ad1.mp4',
          '../../multimedia/ads/ad2.mp4',
          '../../multimedia/ads/ad3.mp4',
          '../../multimedia/ads/ad4.mp4',
          '../../multimedia/ads/ad5.mp4',
          '../../multimedia/ads/ad6.mp4'
        ]
        const adUrl = ADS_VIDEOS[Math.floor(Math.random() * ADS_VIDEOS.length)]

        stage.classList.add('is-playing')
        content.innerHTML = `
          <div class="detalle-player detalle-ad-player">
            <video
              id="jam-ad-video"
              class="detalle-ad-video"
              src="${adUrl}"
              autoplay
              playsinline
            ></video>

            
            <div class="detalle-ad-layer" aria-live="polite">
              <div class="detalle-ad-badge">Anuncio</div>
              <button class="detalle-ad-skip is-locked" id="btn-skip-ad" type="button" disabled>
                Saltar en 5
              </button>
            </div>
        
          </div>
        `

        const video = content.querySelector('#jam-ad-video')
        const skipButton = content.querySelector('#btn-skip-ad')
        let alreadyLoaded = false
        let secondsLeft = 5
        let skipTimer = null

        function loadRealPlayer() {
          if (alreadyLoaded) return
          alreadyLoaded = true
          if (skipTimer) window.clearInterval(skipTimer)

          content.innerHTML = `
            <div class="detalle-player">
              <button class="detalle-player__back" id="btn-player-back" type="button">
                ${backSvg()} Volver a la ficha
              </button>
              <iframe
                class="detalle-player__frame"
                src="${playerUrl}"
                allowfullscreen
                referrerpolicy="no-referrer"
              ></iframe>
            </div>
          `
          content.querySelector('#btn-player-back')?.addEventListener('click', () => {
            stage.classList.remove('is-playing')
            content.innerHTML = savedHTML
            bindDetailInteractions(container, visuals, serie)
          })
        }

        function enableSkip() {
          if (!skipButton || alreadyLoaded) return
          skipButton.disabled = false
          skipButton.textContent = 'Saltar anuncio'
          skipButton.classList.remove('is-locked')
          skipButton.classList.add('is-ready')
        }

        if (skipButton) {
          skipTimer = window.setInterval(() => {
            secondsLeft -= 1
            if (secondsLeft > 0) {
              skipButton.textContent = `Saltar en ${secondsLeft}`
              return
            }
            window.clearInterval(skipTimer)
            skipTimer = null
            enableSkip()
          }, 1000)

          skipButton.addEventListener('click', () => {
            if (skipButton.disabled) return
            loadRealPlayer()
          })
        }

        video.addEventListener('ended', loadRealPlayer)
        video.addEventListener('error', loadRealPlayer)
        video.play().catch(loadRealPlayer)
        return
      }
      
      // Resto de planes: player directo
      stage.classList.add('is-playing')
      content.innerHTML = `
        <div class="detalle-player">
          <button class="detalle-player__back" id="btn-player-back" type="button">
            ${backSvg()} Volver a la ficha
          </button>
          <iframe
            class="detalle-player__frame"
            src="${playerUrl}"
            allowfullscreen
            referrerpolicy="no-referrer"
          ></iframe>
        </div>
      `
      
      content.querySelector('#btn-player-back')?.addEventListener('click', () => {
        stage.classList.remove('is-playing')
        content.innerHTML = savedHTML
        bindDetailInteractions(container, visuals, serie)
      })
    })
  }

  function animateDetalle(container) {
    if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    if (window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger)
    }

    const timeline = window.gsap.timeline({ defaults: { ease: 'power3.out' } })
    const breadcrumb = container.querySelector('.detalle-breadcrumb')
    const poster = container.querySelector('.detalle-poster-wrap')
    const eyebrow = container.querySelector('.detalle-stage__eyebrow')
    const title = container.querySelector('.detalle-stage__title')
    const genres = container.querySelectorAll('.detalle-stage__genres .detalle-genre-chip')
    const meta = container.querySelectorAll('.detalle-stage__meta .detalle-pill')
    const actions = container.querySelectorAll('.detalle-stage__actions .detalle-btn')
    const reel = container.querySelectorAll('.detalle-stage__reel-item')
    const reelWrap = container.querySelector('.detalle-stage__reel')
    const cards = container.querySelectorAll('.detalle-layout .detalle-card')
    const stage = container.querySelector('.detalle-stage')
    const backdrop = container.querySelector('.detalle-stage__backdrop')
    const copy = container.querySelector('.detalle-stage__copy')

    timeline
      .from('.detalle-stage__wash', { opacity: 0, duration: 0.45 })
      .from(breadcrumb, { y: 16, opacity: 0, duration: 0.45 }, '-=0.2')
      .from(poster, { y: 28, opacity: 0, scale: 0.96, duration: 0.65 }, '-=0.18')
      .from(eyebrow, { y: 20, opacity: 0, duration: 0.42 }, '-=0.42')
      .from(title, { y: 28, opacity: 0, duration: 0.62 }, '-=0.34')
      .from(genres, { y: 16, opacity: 0, duration: 0.3, stagger: 0.05 }, '-=0.38')
      .from(meta, { y: 18, opacity: 0, duration: 0.36, stagger: 0.06 }, '-=0.4')
      .from(actions, { y: 16, opacity: 0, duration: 0.36, stagger: 0.08 }, '-=0.22')
      .fromTo(reel,
        { y: 18, autoAlpha: 0, immediateRender: true },
        { y: 0, autoAlpha: 1, duration: 0.35, stagger: 0.05 },
      '-=0.2')

    if (!window.ScrollTrigger) {
      timeline.from(cards, { y: 28, opacity: 0, duration: 0.42, stagger: 0.08 }, '-=0.08')
    }

    if (window.ScrollTrigger && stage && backdrop && poster && copy && reelWrap) {
      window.gsap.to(backdrop, {
        yPercent: 12,
        scale: 1.14,
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      window.gsap.to(poster, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      window.gsap.to(copy, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      window.gsap.to(reelWrap, {
        yPercent: 10,
        opacity: 0.92,
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      cards.forEach((card) => {
        window.gsap.fromTo(
          card,
          { y: 44, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 82%',
              once: true,
            },
          },
        )
      })
    }
  }

  async function init() {
    const container = document.getElementById('detalle-root')
    if (!container) return

    const id = getIdFromUrl()
    if (!id) {
      renderError(container, 'No se especificó ninguna serie.')
      return
    }

    renderLoading(container)

    try {
      await window.JAM?.ensureRuntimeCategories?.()
      const serie = await fetchContenido(id)
      let tmdbImages = []
      let dbGuide = null
      let trabajadores = []

      try {
        tmdbImages = await fetchImagenesDeSerieByIdTmdb(serie.idTmdb)
      } catch (imageError) {
        console.warn('[serie.js] No se pudieron cargar imagenes TMDB:', imageError)
      }

      try {
        const response = await fetch(`${API_BASE}/episodios/serie/${id}`)
        if (response.ok) {
          const episodes = await response.json()
          dbGuide = buildGuideFromEpisodes(id, episodes)
        }
      } catch (guideError) {
        console.warn('[serie.js] No se pudieron cargar episodios:', guideError)
      }

      try {
        trabajadores = await fetchTrabajadoresByContenido(serie.id)
      } catch (workersError) {
        console.warn('[serie.js] No se pudieron cargar trabajadores:', workersError)
      }

      renderDetalle(container, serie, tmdbImages, dbGuide, trabajadores)
    } catch (error) {
      console.error('[serie.js] Error al cargar la serie:', error)
      renderError(container, `No se pudo cargar la serie con ID ${id}.`)
    }
  }

  document.addEventListener('DOMContentLoaded', init)
})()
