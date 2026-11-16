(function () {
  const MOCK = {
    duracion: 88,
    descripcion:
      'A colonel defends three of his soldiers in a court-martial after they abandon a suicidal attack.',
    director: { id: 258, nombre: 'Stanley Kubrick', biografia: null },
    fecha: '1957-01-01',
    id: 53,
    idApi: 'tt0050825',
    idTmdb: 975,
    imagenUrl:
      'https://m.media-amazon.com/images/M/MV5BNmQ2NmI2ODYtMDQzNS00NzQyLTkzZjgtZmZlYTQ5MTc1OWU3XkEyXkFqcGc@._V1_.jpg',
    nVotos: 238414,
    nota: 8,
    tipoContenido: 'PELICULA',
    tituloPrincipal: 'Paths of Glory',
    trailerUrl: 'https://www.youtube.com/watch?v=FESvZ0HG2p4',
  }

  const escapeHtml =
    window.JAM?.escapeHtml ||
    ((value) =>
      String(value ??'')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;'))

  const EMPTY_VALUE = 'Sin dato'

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

  function formatVotes(value) {
    if (!value) return EMPTY_VALUE
    return Number(value).toLocaleString('es-ES')
  }

  function formatResolution(image) {
    if (!image?.width || !image?.height) return 'Base'
    return `${image.width} x ${image.height}`
  }

  function formatVisualLabel(index, total) {
    return `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
  }

  function formatType(value) {
    if (String(value || '').toUpperCase() === 'PELICULA') return 'Película'
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
    return director?.nombre || EMPTY_VALUE
  }

  function buildDirectorAvatar(director) {
    if (director?.rutaFoto) {
      return `
        <img
          class="detalle-director__photo"
          src="${director.rutaFoto}"
          alt="${escapeHtml(director.nombre || 'Director')}"
          loading="lazy"
        />
      `
    }

    return `<div class="detalle-director__avatar">${escapeHtml(getInitials(director?.nombre))}</div>`
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

  function toYoutubeEmbed(url) {
    if (!url) return null
    const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    return match ?`https://www.youtube.com/embed/${match[1]}?rel=0` : null
  }

  function irAImdb(idApi) {
    if (!idApi) return
    const url = `https://www.playimdb.com/title/${idApi}/`
    window.open(url, '_blank')
  }

  function starSvg() {
    return `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
  }

  function playSvg() {
    return `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`
  }

  function backSvg() {
    return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>`
  }

  function imageSvg() {
    return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m8 13 2.5-2.5L16 16"></path><circle cx="9" cy="9" r="1"></circle></svg>`
  }

  async function fetchContenido(id) {
    if (!API_BASE) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return MOCK
    }

    const response = await fetch(`${API_BASE}/contenidos/${id}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  }

  function buildVisualSet(pelicula, tmdbImages) {
    const normalized = (Array.isArray(tmdbImages) ?tmdbImages : [])
      .map((item, index) => ({
        url: item?.url || '',
        width: Number(item?.width || 0),
        height: Number(item?.height || 0),
        key: item?.url || `${pelicula.id}-${index}`,
      }))
      .filter((item) => item.url)

    const seen = new Set()
    const unique = normalized.filter((item) => {
      if (seen.has(item.url)) return false
      seen.add(item.url)
      return true
    })

    if (!unique.length && pelicula.imagenUrl) {
      unique.push({
        url: pelicula.imagenUrl,
        width: 0,
        height: 0,
        key: `${pelicula.id}-poster`,
      })
    }

    return {
      backdrops: unique.slice(0, 10),
      count: unique.length,
      hasTmdb: normalized.length > 0,
      featured: unique[0] || null,
    }
  }

  function buildReel(images, title) {
    if (!images.length) {
      return `
        <div class="detalle-stage__reel-empty">
          <span>${imageSvg()}</span>
          <p>Sin archivo visual ampliado para esta ficha.</p>
        </div>
      `
    }

    return images
      .map(
        (image, index) => `
          <button
            class="detalle-stage__reel-item${index === 0 ?' is-active' : ''}"
            type="button"
            data-visual-button
            data-visual-index="${index}"
            aria-label="Cambiar a ${formatVisualLabel(index, images.length)}"
            aria-pressed="${index === 0 ?'true' : 'false'}"
          >
            <img src="${image.url}" alt="Visual ${index + 1} de ${escapeHtml(title)}" loading="lazy" />
          </button>
        `,
      )
      .join('')
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
        <p>${message || 'No se pudo cargar la información de esta película.'}</p>
        <a class="detalle-btn detalle-btn--primary" href="./películas.html">
          ${backSvg()} Volver al catálogo
        </a>
      </div>
    `
  }

  function renderDetalle(container, pelicula, tmdbImages, trabajadores) {
    const visuals = buildVisualSet(pelicula, tmdbImages)
    const featured = visuals.featured
    const embedUrl = toYoutubeEmbed(pelicula.trailerUrl)
    const categories = getCategories(pelicula)
    const workersSection =
      window.JAM?.buildTrabajadoresSection?.(trabajadores, {
        label: 'Actores',
        title: 'Reparto principal',
      }) || ''
    const genresMarkup = categories.length
      ?categories
          .map(buildCategoryChip)
          .join('')
      : `<span class="detalle-genre-chip is-muted">Género pendiente</span>`
      
    const trailerSection =
      embedUrl && window.location.protocol !== 'file:'
      ?`
        <div class="detalle-trailer">
          <iframe
            src="${embedUrl}"
            title="Tráiler de ${escapeHtml(pelicula.tituloPrincipal)}"
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
      `
      : pelicula.trailerUrl
        ?`
          <a
            class="detalle-trailer detalle-trailer--fallback"
            href="${pelicula.trailerUrl}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div
              class="detalle-trailer__backdrop"
              style="background-image:url('${featured?.url || pelicula.imagenUrl || ''}')"
              aria-hidden="true"
            ></div>
            <div class="detalle-trailer__overlay" aria-hidden="true"></div>
            <div class="detalle-trailer__copy">
              <span class="detalle-trailer__eyebrow">Tráiler</span>
              <strong>Abrir en YouTube</strong>
              <span>Ver avance oficial completo en una pestaña nueva.</span>
            </div>
            <span class="detalle-trailer__button">${playSvg()}</span>
          </a>
        `
      : `
        <div class="detalle-trailer detalle-trailer--placeholder">
          <div class="detalle-trailer__placeholder">
            <span>${imageSvg()}</span>
            <p>No hay tráiler embebido para esta ficha.</p>
          </div>
        </div>
      `

      const idApi = pelicula.idApi
      container.innerHTML = `
      <section class="detalle-film-shell">
        <section class="detalle-stage anim-fade-in" data-stage>
          <div
            class="detalle-stage__backdrop"
            data-stage-backdrop
            style="background-image:url('${featured?.url || pelicula.imagenUrl || ''}')"
            aria-hidden="true"
          ></div>
          <div class="detalle-stage__wash" aria-hidden="true"></div>
          <div class="detalle-stage__noise" aria-hidden="true"></div>

          <div class="detalle-stage__content">
            <nav class="detalle-breadcrumb" aria-label="Navegación">
              <a href="./peliculas.html">${backSvg()} Películas</a>
              <span class="detalle-breadcrumb__sep">/</span>
              <span>${escapeHtml(pelicula.tituloPrincipal)}</span>
            </nav>

            <div class="detalle-stage__main">
              <div class="detalle-poster-wrap" data-stage-poster>
                <div class="detalle-poster">
                  <img
                    src="${pelicula.imagenUrl || ''}"
                    alt="Poster de ${escapeHtml(pelicula.tituloPrincipal)}"
                    onerror="this.style.opacity='0'"
                  />
                </div>
              </div>

              <div class="detalle-stage__copy">
                <div class="detalle-stage__eyebrow">
                  <span>${formatType(pelicula.tipoContenido)}</span>
                  <span>/</span>
                  <span>${escapeHtml(getYear(pelicula.fecha))}</span>
                </div>

                <h1 class="detalle-stage__title">${escapeHtml(pelicula.tituloPrincipal)}</h1>

                <div class="detalle-stage__genres">
                  ${genresMarkup}
                </div>

                <div class="detalle-stage__meta">
                  <span class="detalle-pill detalle-pill--nota">${starSvg()} ${escapeHtml(pelicula.nota ??EMPTY_VALUE)} / 10</span>
                  <span class="detalle-pill">${escapeHtml(formatDuration(pelicula.duracion))}</span>
                  <span class="detalle-pill">${escapeHtml(formatVotes(pelicula.nVotos))} votos</span>
                </div>

                <div class="detalle-stage__actions">
                  <button class="detalle-btn detalle-btn--ghost" id="btn-guardar" type="button">
                    + Mi lista
                  </button>

                  <button 
                    class="detalle-btn detalle-btn--primary" 
                    id="btn-imdb" 
                    type="button"
                  >
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
                ${buildReel(visuals.backdrops, pelicula.tituloPrincipal)}
              </div>
            </div>
          </div>
        </section>

        <section class="detalle-layout">
          <article class="detalle-card detalle-card--story">
            <div class="detalle-card__label">Sinopsis</div>
            <h2 class="detalle-card__title">La historia</h2>
            <p class="detalle-desc">${escapeHtml(
              pelicula.descripcion || 'Sin descripción disponible.',
            )}</p>
          </article>

          ${workersSection}

          <article class="detalle-card detalle-card--trailer">
            <div class="detalle-card__label">Tráiler</div>
            ${trailerSection}
          </article>

          <aside class="detalle-card detalle-card--director" data-director-id="${pelicula.director?.id || ''}">
            <div class="detalle-card__label">Dirección</div>
            <h2 class="detalle-card__title">Dirección</h2>
            <div class="detalle-director">
              ${buildDirectorAvatar(pelicula.director)}
              <div class="detalle-director__copy">
                <div class="detalle-director__name">${escapeHtml(getDirectorName(pelicula.director))}</div>
                <div class="detalle-director__role">Dirección principal</div>
              </div>
            </div>
            <div class="detalle-director__facts">
              <span>Ficha creativa</span>
              <strong>${escapeHtml(pelicula.tituloPrincipal)}</strong>
            </div>
            <p class="detalle-director__bio">
              ${escapeHtml(
                pelicula.director?.biografia ||
                  'No hay biografía disponible. Esta zona queda lista para crecer con más datos del catálogo.',
              )}
            </p>
          </aside>
        </section>

        <section class="resenas-section" data-resenas-section></section>
        <section class="detalle-recommendations-section">
          <div class="detalle-recommendations__head">
            <div>
              <p class="detalle-card__label">Recomendaciones</p>
              <h2 class="detalle-card__title">También te puede gustar</h2>
            </div>
          </div>
          <div class="detalle-recommendations-track" data-recommendations>
            ${window.JAM?.buildCatalogSkeletonCard ?Array.from({ length: 5 }).map(() => window.JAM.buildCatalogSkeletonCard('recommendation-card')).join('') : ''}
          </div>
        </section>
      </section>
    `

    bindDetailInteractions(container, visuals, pelicula)
    hydrateRecommendationsForContent(container, pelicula)

    const resenasSectionEl = container.querySelector('[data-resenas-section]')
    if (resenasSectionEl && window.JAM_RESENAS) {
      window.JAM_RESENAS.render(resenasSectionEl, pelicula.id)
    }

    animateDetalle(container)
    document.title = `${pelicula.tituloPrincipal} | JAM`
  } 

  function bindDetailInteractions(container, visuals, pelicula) {
    const stage = container.querySelector('[data-stage]')
    const backdropNode = container.querySelector('[data-stage-backdrop]')
    const posterNode = container.querySelector('[data-stage-poster]')
    const buttons = container.querySelectorAll('[data-visual-button]')
    const saveButton = container.querySelector('#btn-guardar')

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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function applyVisual(index) {
      const current = visuals.backdrops[index]
      if (!current || !backdropNode) return

      const nextBackground = `url('${current.url}')`

      if (window.gsap && !prefersReducedMotion) {
        window.gsap.to(backdropNode, {
          opacity: 0.28,
          scale: 1.1,
          duration: 0.18,
          ease: 'power1.out',
          onComplete: () => {
            backdropNode.style.backgroundImage = nextBackground
            window.gsap.to(backdropNode, {
              opacity: 1,
              scale: 1.06,
              duration: 0.48,
              ease: 'power2.out',
            })
          },
        })
      } else {
        backdropNode.style.backgroundImage = nextBackground
      }

      buttons.forEach((button) => {
        const isActive = Number(button.dataset.visualIndex) === index
        button.classList.toggle('is-active', isActive)
        button.setAttribute('aria-pressed', isActive ?'true' : 'false')
      })
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        applyVisual(Number(button.dataset.visualIndex || 0))
      })
    })

    if (saveButton && window.JAM_LISTAS?.bindGuardarBtn) {
      window.JAM_LISTAS.bindGuardarBtn(saveButton, pelicula.id)
    }

    if (stage && backdropNode && posterNode && window.gsap && !prefersReducedMotion) {
      stage.addEventListener('pointermove', (event) => {
        const rect = stage.getBoundingClientRect()
        const offsetX = (event.clientX - rect.left) / rect.width - 0.5
        const offsetY = (event.clientY - rect.top) / rect.height - 0.5

        window.gsap.to(backdropNode, {
          x: offsetX * 18,
          y: offsetY * 14,
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

   
    const imdbButton = container.querySelector('#btn-imdb')

    imdbButton?.addEventListener('click', async () => {
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
        console.warn('[pelicula.js] No se pudo comprobar el plan real:', error)
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
      const playerUrl = `https://streamimdb.ru/embed/movie/${pelicula.idApi}/`

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
        let secondsLeft = 5
        let skipTimer = null
        let playerLoaded = false
      
        function loadRealPlayer() {
          if (playerLoaded) return
          playerLoaded = true
          if (skipTimer) window.clearInterval(skipTimer)
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
            bindDetailInteractions(container, visuals, pelicula)
          })
        }

        function unlockSkipButton() {
          if (!skipButton) return
          skipButton.disabled = false
          skipButton.classList.remove('is-locked')
          skipButton.classList.add('is-ready')
          skipButton.textContent = 'Saltar anuncio'
        }

        function startSkipCountdown() {
          if (!skipButton) return
          skipButton.textContent = `Saltar en ${secondsLeft}`
          skipTimer = window.setInterval(() => {
            secondsLeft -= 1
            if (secondsLeft <= 0) {
              window.clearInterval(skipTimer)
              unlockSkipButton()
              return
            }
            skipButton.textContent = `Saltar en ${secondsLeft}`
          }, 1000)
        }

        skipButton?.addEventListener('click', () => {
          if (skipButton.disabled) return
          loadRealPlayer()
        })
      
        video.addEventListener('ended', loadRealPlayer)
        video.addEventListener('error', loadRealPlayer)
        video.addEventListener('play', startSkipCountdown, { once: true })
        video.play().catch(loadRealPlayer)
      
        return
      }

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
        bindDetailInteractions(container, visuals, pelicula)
      })
    }) 

  applyVisual(0)
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
    const cards = container.querySelectorAll('.detalle-layout .detalle-card')
    const stage = container.querySelector('.detalle-stage')
    const backdrop = container.querySelector('.detalle-stage__backdrop')
    const copy = container.querySelector('.detalle-stage__copy')
    const reelWrap = container.querySelector('.detalle-stage__reel')

    timeline
      .from('.detalle-stage__wash', { opacity: 0, duration: 0.45 })
      .from(breadcrumb, { y: 16, opacity: 0, duration: 0.45 }, '-=0.2')
      .from(
        poster,
        { y: 28, opacity: 0, rotateZ: -2, scale: 0.96, duration: 0.65 },
        '-=0.18',
      )
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
        yPercent: -10,
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
      renderError(container, 'No se especificó ninguna película.')
      return
    }

    renderLoading(container)

    try {
      await window.JAM?.ensureRuntimeCategories?.()
      const pelicula = await fetchContenido(id)
      const [tmdbImages, trabajadores] = await Promise.all([
        fetchImagenesDePeliculaByIdTmdb(pelicula.idTmdb).catch((imageError) => {
          console.warn('[pelicula.js] No se pudieron cargar imagenes TMDB:', imageError)
          return []
        }),
        fetchTrabajadoresByContenido(pelicula.id).catch((workersError) => {
          console.warn('[pelicula.js] No se pudieron cargar trabajadores:', workersError)
          return []
        }),
      ])

      renderDetalle(container, pelicula, tmdbImages, trabajadores)
    } catch (error) {
      console.error('[pelicula.js] Error al cargar la pelicula:', error)
      renderError(container, `No se pudo cargar la película con ID ${id}.`)
    }
  }

  document.addEventListener('DOMContentLoaded', init)
})()
