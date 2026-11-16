(function () {
  const sortLabels = {
    popular: 'Más populares',
    rating: 'Mejor valoradas',
    newest: 'Más recientes',
    oldest: 'Más antiguas',
    az: 'A-Z',
  }

  const sortCopy = {
    popular: 'Empieza por las películas con más tracción real dentro del catálogo.',
    rating: 'Aquí tienes las mejor valoradas para entrar con menos ruido y más criterio.',
    newest: 'Una selección más actual para descubrir cine reciente dentro de JAM.',
    oldest: 'Películas de otras etapas para navegar el catálogo con más memoria y perspectiva.',
    az: 'Una lectura limpia del catálogo para encontrar títulos por nombre sin depender de rankings.',
  }

  window.JAM.mountCatalogDiscovery({
    pageId: 'page-peliculas',
    rootKey: 'movies',
    kind: 'PELICULA',
    typeLabel: 'Película',
    sectionLabel: 'Cine',
    featureLabel: 'Película destacada',
    openVerb: 'Ver detalle de',
    pageSize: 24,
    defaultSort: 'popular',
    ids: {
      stageBackdrop: 'peliculas-stage-backdrop',
      stageKicker: 'peliculas-stage-kicker',
      stageBrand: 'peliculas-stage-brand',
      stageTitle: 'peliculas-stage-title',
      stageText: 'peliculas-stage-text',
      stageMeta: 'peliculas-stage-meta',
      stageOpen: 'peliculas-stage-open',
      stageSelector: 'peliculas-stage-selector',
      search: 'peliculas-search',
      sort: 'peliculas-sort',
      reset: 'peliculas-reset',
      summary: 'peliculas-summary',
      metrics: 'peliculas-metrics',
      shelves: 'peliculas-shelves',
      grid: 'peliculas-grid',
      resultsMeta: 'peliculas-results-meta',
      loadMoreWrap: 'peliculas-loadmore',
      loadMoreBtn: 'btn-loadmore',
    },
    sortRequests: {
      popular: { orden: 'votos', dir: 'desc' },
      rating: { orden: 'puntos', dir: 'desc' },
      newest: { orden: 'fecha', dir: 'desc' },
      oldest: { orden: 'fecha', dir: 'asc' },
      az: { orden: 'alfabetico', dir: 'asc' },
    },
    heroPresets: [
      {
        title: 'Blade Runner 2049',
        matchTitle: 'Blade Runner 2049',
        kicker: 'Películas destacadas',
        image: '../../multimedia/hero/hero-blade-runner-2049.jpg',
        logo: '../../multimedia/hero/title-blade-runner-2049.png',
        summary: 'Ciencia ficción de autor para abrir películas con atmósfera, escala y una entrada más cinematográfica.',
      },
      {
        title: 'Interstellar',
        matchTitle: 'Interstellar',
        kicker: 'Películas destacadas',
        image: '../../multimedia/hero/hero-interstellar.jpg',
        logo: '../../multimedia/hero/title-interstellar.png',
        summary: 'Una opción grande para entrar por ciencia ficción emocional, viajes imposibles y una imagen hero más potente.',
      },
    ],
    getHref(item) {
      return `./pelicula.html?id=${item.id}`
    },
    buildHeroText({ state, totalCatalog }) {
      if (state.query) {
        return {
          title: `Resultados para "${state.query}"`,
          text: `${state.totalResults} películas encajan ahora mismo. Sigue bajando o abre una de las fichas para entrar directo al detalle.`,
        }
      }

      const sortLabel = sortLabels[state.sort] || sortLabels.popular

      return {
        title: 'Qué película te apetece hoy?',
        text: `${sortCopy[state.sort] || sortCopy.popular} Orden actual: ${sortLabel.toLowerCase()}. ${totalCatalog.toLocaleString('es-ES')} títulos en catálogo.`,
      }
    },
    buildSummary({ state, totalCatalog, totalVisible }) {
      if (state.query) {
        return `${totalVisible} resultados para "${state.query}".`
      }

      const sortLabel = sortLabels[state.sort] || sortLabels.popular
      return `${totalCatalog.toLocaleString('es-ES')} películas disponibles. Orden actual: ${sortLabel.toLowerCase()}.`
    },
    buildMetrics({ totalCatalog, totalVisible, currentSet, average, formatCompact }) {
      return [
        {
          label: 'Catálogo',
          value: totalCatalog.toLocaleString('es-ES'),
          note: 'Películas listas para descubrir.',
        },
        {
          label: 'Resultados',
          value: totalVisible.toLocaleString('es-ES'),
          note: 'Según tu búsqueda y el orden activo.',
        },
        {
          label: 'Nota media',
          value: average(currentSet, 'nota').toFixed(1),
          note: 'Media del bloque que tienes en pantalla.',
        },
        {
          label: 'Pulso',
          value: formatCompact(currentSet.reduce((sum, item) => sum + Number(item.nVotos || 0), 0)),
          note: 'Volumen acumulado de votos del conjunto visible.',
        },
      ]
    },
    shelves: [
      {
        id: 'popular',
        eyebrow: 'Lo más visto',
        title: 'Empieza por donde más gente entra',
        description: 'Títulos con más tracción para una navegación rápida y segura.',
        request: { kind: 'search', tipo: 'PELICULA', orden: 'votos', dir: 'desc' },
        limit: 18,
      },
      {
        id: 'rating',
        eyebrow: 'Valoradas',
        title: 'Películas con mejor recepción',
        description: 'Cuando quieres reducir ruido y entrar por cine fuerte.',
        request: { kind: 'search', tipo: 'PELICULA', orden: 'puntos', dir: 'desc' },
        limit: 18,
      },
      {
        id: 'recent',
        eyebrow: 'Actuales',
        title: 'Recientes que merecen hueco ya',
        description: 'Cine moderno para una portada con presente.',
        request: { kind: 'search', tipo: 'PELICULA', orden: 'fecha', dir: 'desc' },
        limit: 18,
      },
      {
        id: 'classics',
        eyebrow: 'Clásicos',
        title: 'Películas para volver una y otra vez',
        description: 'Rewatch, prestigio y memoria dentro del catálogo.',
        request: { kind: 'search', tipo: 'PELICULA', orden: 'fecha', dir: 'asc' },
        limit: 18,
      },
      {
        id: 'epic',
        eyebrow: 'Noche larga',
        title: 'Películas grandes para meterte de lleno',
        description: 'Duración alta, más escala y más tiempo dentro de la historia.',
        request: { kind: 'top', endpoint: '/contenidos/top/largas' },
        limit: 18,
      },
    ],
    empty: {
      title: 'No encontramos películas con esta combinación.',
      text: 'Prueba otra búsqueda o limpia el buscador para volver a abrir el catálogo.',
    },
  })
})()
