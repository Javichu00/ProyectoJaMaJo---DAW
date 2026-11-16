(function () {


  const ANIME_TITLES = [
    'akira', 'naruto', 'attack on titan', 'bleach', 'blue lock',
    'boruto', 'chainsaw man', 'code geass', 'cowboy bebop', 'dandadan',
    'death note', 'demon slayer', 'dragon ball', 'evangelion', 'fairy tail',
    'frieren', 'fullmetal', 'gintama', 'haikyuu', 'hunter x hunter',
    'inuyasha', "jojo's bizarre", 'jojo bizarre', 'jujutsu', 'kimetsu',
    'mob psycho', 'my hero', 'one piece', 'one punch man', 'pokemon',
    'sailor moon', 'saint seiya', 'shingeki', 'spirited away', 'spy x family',
    'sword art online', 'tokyo ghoul', 'princess mononoke', 'howl',
    'vinland', 'your name',
  ]

  const PELICULAS_TITLES = [
    'the godfather', 'el padrino', 'schindler', 'the dark knight',
    'inception', 'interstellar', 'pulp fiction', 'fight club',
    'forrest gump', 'the shawshank redemption', 'goodfellas',
    'the silence of the lambs', 'se7en', 'the matrix', 'gladiator',
    'saving private ryan', 'the departed', 'no country for old men',
    'there will be blood', 'whiplash', 'birdman', 'spotlight',
    'the revenant', 'moonlight', 'la la land', 'get out',
    'parasite', '1917', 'everything everywhere', 'oppenheimer', 'dune',
    'avatar', 'mad max fury road', 'gravity', 'arrival', 'her',
    'the grand budapest hotel', 'joker', 'the irishman',
    'marriage story', 'once upon a time in hollywood',
  ]

  const SERIES_TITLES = [
    'breaking bad', 'game of thrones', 'the wire', 'the sopranos',
    'mad men', 'true detective', 'chernobyl', 'band of brothers',
    'the crown', 'succession', 'ozark', 'mindhunter', 'stranger things',
    'house of cards', 'peaky blinders', 'black mirror', 'westworld',
    'the mandalorian', 'squid game', 'la casa de papel', 'money heist',
    'fleabag', 'euphoria', 'the last of us', 'severance', 'the white lotus',
    'andor', 'yellowstone', 'shogun', 'the bear', 'house of the dragon',
    'better call saul', 'fargo', 'silicon valley', 'the boys',
    'dark', 'afterlife', 'ted lasso', 'the handmaid',
  ]

  const CLASICOS_TITLES = [
    'casablanca', 'citizen kane', 'vertigo', 'psycho', 'rear window',
    '2001 a space odyssey', '2001 odisea', 'apocalypse now',
    'blade runner', 'chinatown', 'taxi driver', 'lawrence of arabia',
    'some like it hot', 'sunset boulevard', 'north by northwest',
    'spartacus', 'ben-hur', 'dr strangelove',
    "one flew over the cuckoo's nest", 'raging bull', 'full metal jacket',
    'a clockwork orange', 'the shining', 'blue velvet', 'mulholland',
    'reservoir dogs', 'trainspotting', 'leon the professional',
    'the usual suspects', 'seven samurai', 'rashomon', 'metropolis',
    'nosferatu', 'grand illusion', 'the great dictator', 'modern times',
    '8½', 'la dolce vita', 'amarcord', 'breathless',
    'the 400 blows', 'barry lyndon', 'annie hall',
    'once upon a time in america', 'the good the bad',
    'for a few dollars', 'a fistful of dollars',
  ]

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }

  function getLinkByType(type) {
    return type === 'SERIE' ? './series.html' : './peliculas.html'
  }

  function getDetailLink(item) {
    if (!item?.id) return getLinkByType(item?.type)
    return item.type === 'SERIE'
      ? `./serie.html?id=${item.id}`
      : `./pelicula.html?id=${item.id}`
  }

  function getTypeLabel(type) {
    return type === 'SERIE' ? 'Serie' : 'Película'
  }

  function formatVotes(value) {
    return new Intl.NumberFormat('es-ES').format(Number(value || 0))
  }

  function formatCompact(value) {
    return new Intl.NumberFormat('es-ES', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(Number(value || 0))
  }

  function buildSearchIndexFromPage() {
    return [...document.querySelectorAll('[data-search-item]')].map((item) => ({
      title: item.dataset.searchTitle || item.textContent.trim(),
      category: item.dataset.searchCategory || 'Contenido',
      note: item.dataset.searchNote || '',
      href: item.getAttribute('href') || '#inicio',
    }))
  }

  function mapApiItem(item) {
    if (!item) return null
    return {
      id: item.id,
      idApi: item.idApi || '',
      title: item.tituloPrincipal,
      image: item.imagenUrl,
      rating: item.nota || 0,
      votes: item.nVotos || 0,
      year: item.fecha ? String(item.fecha).slice(0, 4) : '',
      type: item.tipoContenido,
      blurb: item.descripcion || 'Una pieza real del catálogo lista para sostener cards, raíles y selecciones más editoriales.',
    }
  }

  function extractItems(data) {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.content)) return data.content
    return []
  }

  async function apiFetch(path, options) {
    try {
      const res = await fetch(`${API_BASE}${path}`, options)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  async function apiGetItems(path) {
    const data = await apiFetch(path)
    return extractItems(data).filter(Boolean).map(mapApiItem).filter((i) => i?.image)
  }

  async function apiPostItems(path, body) {
    const data = await apiFetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return extractItems(data).filter(Boolean).map(mapApiItem).filter((i) => i?.image)
  }

  function uniqueByTitle(items) {
    const seen = new Set()
    return items.filter((item) => {
      const key = String(item?.title || '').trim().toLowerCase()
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  async function loadAllData() {
    await window.JAM?.ensureRuntimeCategories?.()

    const [
      totalsRaw,
      trendingRaw,
      peliculasRaw,
      seriesRaw,
      animeRaw,
      premiadasRaw,
      clasicosRaw,
    ] = await Promise.all([
      apiFetch('/contenidos/contar'),
      apiGetItems('/contenidos/top/votados'),
      apiPostItems('/contenidos/top/por-nombres', PELICULAS_TITLES),
      apiPostItems('/contenidos/top/por-nombres', SERIES_TITLES),
      apiPostItems('/contenidos/top/por-nombres', ANIME_TITLES),
      apiGetItems('/contenidos/top/puntos'),
      apiPostItems('/contenidos/top/por-nombres', CLASICOS_TITLES),
    ])

    const totals = totalsRaw
      ? {
          total: totalsRaw.totalContenido ?? totalsRaw.total ?? 0,
          movies: totalsRaw.totalPeliculas ?? totalsRaw.peliculas ?? totalsRaw.movies ?? 0,
          series: totalsRaw.totalSeries ?? totalsRaw.series ?? 0,
        }
      : { total: 0, movies: 0, series: 0 }

    const source = trendingRaw.length || peliculasRaw.length ? 'api' : 'offline'

    return {
      trending:  uniqueByTitle(trendingRaw),
      peliculas: uniqueByTitle(peliculasRaw),
      series:    uniqueByTitle(seriesRaw),
      anime:     uniqueByTitle(animeRaw),
      premiadas: uniqueByTitle(premiadasRaw),
      clasicos:  uniqueByTitle(clasicosRaw),
      totals,
      source,
    }
  }

  function createStreamCard(item) {
    return `
      <a class="stream-card" href="${getDetailLink(item)}" aria-label="${escapeHtml(item.title)}">
        <img src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy" />
        <span class="stream-card__title">${escapeHtml(item.title)}</span>
      </a>
    `
  }

  function createPosterCard(item) {
    return window.JAM.buildCatalogCard({
      tag: 'a',
      href: getDetailLink(item),
      id: item.id,
      title: item.title,
      image: item.image,
      rating: Number(item.rating || 0) > 0 ? `${item.rating}/10` : '',
      subtitle: getTypeLabel(item.type),
      metaStart: item.year || '-',
      metaEnd: item.votes ? `${formatCompact(item.votes)} votos` : '-',
      className: 'pelicula-card--compact',
      searchTitle: item.title,
      searchCategory: getTypeLabel(item.type),
      searchNote: item.blurb || '',
      ariaLabel: item.title,
    })
  }

  function createEmptyPosterCard() {
    return window.JAM.buildCatalogEmptyCard('pelicula-card--compact')
  }


  function renderRails(rails, source) {
    document.querySelectorAll('[data-live-rail]').forEach((rail) => {
      const key = rail.getAttribute('data-live-rail')
      const items = (rails[key] || []).slice(0, 16)
      const countNode = document.querySelector(`[data-row-count="${key}"]`)

      if (countNode) {
        countNode.textContent = items.length
          ? `${formatVotes(items.length)} títulos`
          : source === 'api' ? '0 títulos' : '--'
      }

      if (!items.length) {
        rail.innerHTML = new Array(7).fill('').map(() => createEmptyPosterCard()).join('')
        return
      }

      rail.innerHTML = items.map(createPosterCard).join('')
    })
  }

  function renderTicker(items) {
    const ticker = document.querySelector('[data-title-ticker]')
    if (!ticker) return
    const looped = [...items.slice(0, 14), ...items.slice(0, 14)]
    ticker.innerHTML = looped
      .map((item) => `<span>${escapeHtml(item.title)} · ${escapeHtml(getTypeLabel(item.type))} · ${escapeHtml(item.year)}</span>`)
      .join('')
  }

  function renderHighlights(totals, source) {
    const target = document.querySelector('[data-live-highlights]')
    if (!target) return

    const catalogText = source === 'api'
      ? 'Títulos disponibles ahora mismo para portada, rails y fichas reales.'
      : 'Sin conexión al catálogo real en este momento.'

    target.innerHTML = `
      <article class="pulse-highlight">
        <div class="pulse-highlight__label">Catálogo cargado</div>
        <div class="pulse-highlight__value">${formatVotes(totals.total)}</div>
        <div class="pulse-highlight__text">${catalogText}</div>
      </article>
      <article class="pulse-highlight">
        <div class="pulse-highlight__label">Películas</div>
        <div class="pulse-highlight__value">${formatVotes(totals.movies)}</div>
        <div class="pulse-highlight__text">Una base grande para compra individual, ranking y selección editorial.</div>
      </article>
      <article class="pulse-highlight">
        <div class="pulse-highlight__label">Series</div>
        <div class="pulse-highlight__value">${formatVotes(totals.series)}</div>
        <div class="pulse-highlight__text">Temporadas, nombres reconocibles y continuidad real para el resto de pantallas.</div>
      </article>
    `
  }

  function renderPosterStreams(items) {
    const topTrack = document.querySelector('[data-stream-track="top"]')
    const bottomTrack = document.querySelector('[data-stream-track="bottom"]')
    if (!topTrack || !bottomTrack) return

    const topItems = items.slice(0, 12)
    const bottomItems = items.slice(12, 24)

    if (!topItems.length || !bottomItems.length) {
      const fallback = items.slice(0, 12)
      topTrack.innerHTML = [...fallback, ...fallback].map(createStreamCard).join('')
      bottomTrack.innerHTML = [...fallback, ...fallback].map(createStreamCard).join('')
      return
    }

    topTrack.innerHTML = [...topItems, ...topItems].map(createStreamCard).join('')
    bottomTrack.innerHTML = [...bottomItems, ...bottomItems].map(createStreamCard).join('')
  }

  function renderHighlightsSkeleton() {
    const target = document.querySelector('[data-live-highlights]')
    if (!target || !window.JAM) return
    target.innerHTML = Array.from({ length: 3 }).map(() => window.JAM.buildHighlightSkeleton()).join('')
  }

  function renderTickerSkeleton() {
    const ticker = document.querySelector('[data-title-ticker]')
    if (!ticker || !window.JAM) return
    ticker.innerHTML = window.JAM.buildTickerSkeleton(10)
  }

  function renderPosterStreamsSkeleton() {
    const topTrack = document.querySelector('[data-stream-track="top"]')
    const bottomTrack = document.querySelector('[data-stream-track="bottom"]')
    if (!topTrack || !bottomTrack || !window.JAM) return
    const cards = Array.from({ length: 8 })
      .map(() => window.JAM.buildCatalogSkeletonCard('pelicula-card--compact'))
      .join('')
    topTrack.innerHTML = cards
    bottomTrack.innerHTML = cards
  }

  function renderRailsSkeleton() {
    if (!window.JAM) return
    document.querySelectorAll('[data-live-rail]').forEach((rail) => {
      rail.innerHTML = Array.from({ length: 7 })
        .map(() => window.JAM.buildCatalogSkeletonCard('pelicula-card--compact'))
        .join('')
    })
    document.querySelectorAll('[data-row-count]').forEach((node) => {
      node.textContent = 'Cargando'
    })
  }

  function bindRails() {
    document.querySelectorAll('[data-rail-prev]').forEach((button) => {
      button.addEventListener('click', () => {
        const rail = document.querySelector(`[data-rail="${button.getAttribute('data-rail-prev')}"]`)
        rail?.scrollBy({ left: rail.clientWidth * -0.84, behavior: 'smooth' })
      })
    })
    document.querySelectorAll('[data-rail-next]').forEach((button) => {
      button.addEventListener('click', () => {
        const rail = document.querySelector(`[data-rail="${button.getAttribute('data-rail-next')}"]`)
        rail?.scrollBy({ left: rail.clientWidth * 0.84, behavior: 'smooth' })
      })
    })
  }

  function initHeroCinema() {
    const slides = [...document.querySelectorAll('[data-hero-slide]')]
    const stageImage = document.querySelector('[data-hero-stage-image]')
    const kicker = document.querySelector('[data-hero-kicker]')
    const titleImage = document.querySelector('[data-hero-title-image]')
    const summary = document.querySelector('[data-hero-summary]')
    const heroLink = document.querySelector('[data-hero-link]')
    const openButton = document.querySelector('[data-hero-open]')

    if (!slides.length || !stageImage || !kicker || !titleImage || !summary || !heroLink || !openButton) return

    let activeSlide = slides.find((s) => s.classList.contains('is-active')) || slides[0]
    let autoRotateId = null

    function applySlide(slide, animate) {
      slides.forEach((item) => {
        const isActive = item === slide
        item.classList.toggle('is-active', isActive)
        item.setAttribute('aria-pressed', isActive ? 'true' : 'false')
      })

      const updateContent = () => {
        stageImage.src = slide.dataset.heroImage || ''
        stageImage.alt = slide.dataset.heroImageAlt || ''
        titleImage.src = slide.dataset.heroLogo || ''
        titleImage.alt = slide.dataset.heroLogoAlt || ''
        kicker.textContent = slide.dataset.heroKicker || ''
        summary.textContent = slide.dataset.heroSummary || ''
        openButton.textContent = slide.dataset.heroPrimaryLabel || 'Ver contenido'
        openButton.href = slide.dataset.heroPrimaryLink || '#inicio'
        heroLink.href = slide.dataset.heroLink || '#inicio'
        heroLink.textContent = slide.dataset.heroLinkLabel || 'Explorar'
      }

      if (animate && window.gsap) {
        const contentNodes = [kicker, titleImage, summary, openButton, heroLink]
        const tl = gsap.timeline()
        tl.to(contentNodes, { y: 18, autoAlpha: 0, duration: 0.2, stagger: 0.02, ease: 'power2.out' })
        tl.to(stageImage, { autoAlpha: 0.28, scale: 1.05, duration: 0.24, ease: 'power2.out' }, 0)
        tl.add(() => updateContent())
        tl.set(contentNodes, { y: 18 })
        tl.to(stageImage, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'power3.out' })
        tl.to(contentNodes, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.03, ease: 'power3.out' }, '<0.08')
      } else {
        updateContent()
      }

      activeSlide = slide
    }

    function moveToNextSlide() {
      const idx = slides.indexOf(activeSlide)
      applySlide(slides[idx === slides.length - 1 ? 0 : idx + 1], true)
    }

    function stopAutoRotate() {
      if (autoRotateId) { clearInterval(autoRotateId); autoRotateId = null }
    }

    function startAutoRotate() {
      stopAutoRotate()
      autoRotateId = setInterval(moveToNextSlide, 5600)
    }

    slides.forEach((slide) => {
      slide.addEventListener('click', () => {
        if (slide === activeSlide) { window.location.href = slide.dataset.heroPrimaryLink || '#inicio'; return }
        applySlide(slide, true)
        startAutoRotate()
      })
      slide.addEventListener('mouseenter', stopAutoRotate)
      slide.addEventListener('mouseleave', startAutoRotate)
    })

    applySlide(activeSlide, false)
    startAutoRotate()
  }

  function initCinematicHeroSequence() {
    const section = document.querySelector('.cinematic-sequence-hero')
    const canvas = document.getElementById('cinematic-hero-canvas')

    if (!section || !canvas) return

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger)
    }

    const context = canvas.getContext('2d', { alpha: false })
    if (!context) return

    const TOTAL_HERO_FRAMES = 91

    function getHeroFrameSrc(index) {
      return `../../multimedia/hero-sequence/ezgif-frame-${String(index).padStart(3, '0')}.png`
    }

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const images = new Array(TOTAL_HERO_FRAMES + 1)
    let currentFrame = prefersReducedMotion ? TOTAL_HERO_FRAMES : 1
    let lastDrawnFrame = 0
    let rafId = 0
    let settledCount = 0
    let hasCreatedTrigger = false

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value))
    }

    function findDrawableImage(targetFrame) {
      if (images[targetFrame]?.complete && images[targetFrame]?.naturalWidth) {
        return images[targetFrame]
      }

      for (let offset = 1; offset < TOTAL_HERO_FRAMES; offset += 1) {
        const lower = targetFrame - offset
        const upper = targetFrame + offset

        if (lower >= 1 && images[lower]?.complete && images[lower]?.naturalWidth) {
          return images[lower]
        }

        if (upper <= TOTAL_HERO_FRAMES && images[upper]?.complete && images[upper]?.naturalWidth) {
          return images[upper]
        }
      }

      return null
    }

    function drawFrame(frameIndex, force = false) {
      const drawable = findDrawableImage(frameIndex)

      if (!drawable) {
        const width = canvas.width
        const height = canvas.height
        context.fillStyle = '#000'
        context.fillRect(0, 0, width, height)
        lastDrawnFrame = 0
        return
      }

      if (!force && frameIndex === lastDrawnFrame && drawable === images[frameIndex]) {
        return
      }

      const width = canvas.width
      const height = canvas.height

      context.fillStyle = '#000'
      context.fillRect(0, 0, width, height)

      const scale = Math.max(width / drawable.naturalWidth, height / drawable.naturalHeight)
      const drawWidth = drawable.naturalWidth * scale
      const drawHeight = drawable.naturalHeight * scale
      const drawX = (width - drawWidth) / 2
      const drawY = (height - drawHeight) / 2

      context.drawImage(drawable, drawX, drawY, drawWidth, drawHeight)
      lastDrawnFrame = frameIndex
    }

    function requestDraw(force = false) {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        drawFrame(currentFrame, force)
      })
    }

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, Math.round(rect.width * dpr))
      const height = Math.max(1, Math.round(rect.height * dpr))

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      requestDraw(true)
    }

    function handleImageSettled() {
      settledCount += 1
      if (settledCount === TOTAL_HERO_FRAMES && window.ScrollTrigger) {
        ScrollTrigger.refresh()
      }
    }

    function loadFrame(index) {
      const image = new Image()
      image.decoding = 'async'
      image.loading = 'eager'
      image.src = getHeroFrameSrc(index)
      image.onload = () => {
        if (index === currentFrame || (index === 1 && !prefersReducedMotion)) {
          requestDraw(true)
        }
        handleImageSettled()
      }
      image.onerror = handleImageSettled
      images[index] = image
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    if (prefersReducedMotion) {
      return
    }

    for (let frame = 1; frame <= TOTAL_HERO_FRAMES; frame += 1) {
      loadFrame(frame)
    }

    if (window.gsap && window.ScrollTrigger) {
      hasCreatedTrigger = true
      ScrollTrigger.create({
        trigger: '.cinematic-sequence-hero',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: ({ progress }) => {
          const nextFrame = clamp(
            Math.round(progress * (TOTAL_HERO_FRAMES - 1)) + 1,
            1,
            TOTAL_HERO_FRAMES,
          )

          if (nextFrame !== currentFrame) {
            currentFrame = nextFrame
            requestDraw()
          }
        },
      })
    }

    if (hasCreatedTrigger && window.ScrollTrigger) {
      ScrollTrigger.refresh()
    }
  }

  function initTickerMotion() {
    const track = document.querySelector('[data-title-ticker]')
    if (!track || !window.gsap) return
    gsap.to(track, { x: -(track.scrollWidth / 2), duration: 30, ease: 'none', repeat: -1 })
  }

  function initPosterStreams() {
    if (!window.gsap) return
    document.querySelectorAll('[data-stream-track]').forEach((track) => {
      const direction = track.dataset.streamTrack
      const distance = track.scrollWidth / 2
      gsap.set(track, { x: direction === 'bottom' ? -distance : 0 })
      const tween = gsap.to(track, {
        x: direction === 'bottom' ? 0 : -distance,
        duration: direction === 'bottom' ? 34 : 40,
        ease: 'none',
        repeat: -1,
      })
      const row = track.closest('.poster-stream__row') || track
      row.addEventListener('mouseenter', () => tween.pause())
      row.addEventListener('mouseleave', () => tween.resume())
    })
  }

  function initSectionMotion() {
    if (!window.gsap) return
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger)

    const sections = [...document.querySelectorAll('[data-reveal]')]

    sections.forEach((section) => {
      const nested = section.querySelectorAll(
        '.poster-card, .pulse-highlight, .poster-stream__copy, .stream-card, .pelicula-card:not(.movie-scroll-cards .pelicula-card)',
      )
      gsap.set(section, { autoAlpha: 0, y: 50 })
      if (nested.length) gsap.set(nested, { autoAlpha: 0, y: 22 })

      if (window.ScrollTrigger) {
        gsap.to(section, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 76%' } })
        if (nested.length) gsap.to(nested, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: section, start: 'top 72%' } })
      } else {
        gsap.to(section, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' })
        if (nested.length) gsap.to(nested, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06, delay: 0.12 })
      }
    })

    document.querySelectorAll(
      '.poster-card, .pelicula-card:not(.movie-scroll-cards .pelicula-card)'
    ).forEach((card) => {
      card.addEventListener('mouseenter', () => gsap.to(card, { y: -6, duration: 0.28, ease: 'power2.out' }))
      card.addEventListener('mouseleave', () => gsap.to(card, { y: 0, duration: 0.28, ease: 'power2.out' }))
    })
  }


  function initHeroCta() {
    const cta = document.getElementById('cinematic-hero-cta')
    if (!cta) return
  
    cta.addEventListener('click', () => {
      const hero = document.querySelector('.cinematic-sequence-hero')
      const target = document.querySelector('.pulse-band__ticker')
      if (!hero || !target) return
  
      const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY - window.innerHeight
      const isInsideHero = window.scrollY < heroBottom
  
      if (isInsideHero) {
        window.scrollTo({ top: heroBottom, behavior: 'smooth' })
        setTimeout(() => {
          setTimeout(() => {
            const targetTop = target.getBoundingClientRect().top + window.scrollY - 148
            window.scrollTo({ top: targetTop, behavior: 'smooth' })
          }, 200)
        }, 800)
      } else {
        const targetTop = target.getBoundingClientRect().top + window.scrollY - 148
        window.scrollTo({ top: targetTop, behavior: 'smooth' })
      }
    })
  }

  async function initIndex() {
    if (!window.JAM) return

    initCinematicHeroSequence()
    initHeroCta() 

    renderTickerSkeleton()
    renderHighlightsSkeleton()
    renderPosterStreamsSkeleton()
    renderRailsSkeleton()

    const { trending, peliculas, series, anime, premiadas, clasicos, totals, source } = await loadAllData()

    renderTicker(trending.slice(0, 24))
    renderHighlights(totals, source)
    renderPosterStreams(trending.slice(0, 24))

    // Claves exactas = data-live-rail del HTML
    renderRails({ trending, peliculas, series, anime, premiadas, clasicos }, source)

    window.JAM.setSearchIndex(buildSearchIndexFromPage())

    bindRails()
    initTickerMotion()
    initPosterStreams()
    initSectionMotion()
  }

  document.addEventListener('DOMContentLoaded', initIndex)
})()
