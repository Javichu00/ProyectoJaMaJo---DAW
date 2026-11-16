(function () {
  const sortLabels = {
    popular: 'Más populares',
    rating: 'Mejor valoradas',
    newest: 'Más recientes',
    oldest: 'Más antiguas',
    az: 'A-Z',
  }

  const sortCopy = {
    popular: 'Empieza por las series que más tiran ahora mismo del catálogo.',
    rating: 'Aquí tienes las mejor valoradas para entrar con más confianza.',
    newest: 'Una lectura más actual para engancharte a series recientes.',
    oldest: 'Series de otras etapas para recorrer la biblioteca con más memoria y contexto.',
    az: 'Una navegación limpia por nombre para encontrar rápido lo que buscas.',
  }

  window.JAM.mountCatalogDiscovery({
    pageId: 'page-series',
    rootKey: 'series',
    kind: 'SERIE',
    typeLabel: 'Serie',
    sectionLabel: 'Series',
    featureLabel: 'Serie destacada',
    openVerb: 'Ver detalle de',
    pageSize: 24,
    defaultSort: 'popular',
    ids: {
      stageBackdrop: 'series-stage-backdrop',
      stageKicker: 'series-stage-kicker',
      stageBrand: 'series-stage-brand',
      stageTitle: 'series-stage-title',
      stageText: 'series-stage-text',
      stageMeta: 'series-stage-meta',
      stageOpen: 'series-stage-open',
      stageSelector: 'series-stage-selector',
      search: 'series-search',
      sort: 'series-sort',
      reset: 'series-reset',
      summary: 'series-summary',
      metrics: 'series-metrics',
      shelves: 'series-shelves',
      grid: 'series-grid',
      resultsMeta: 'series-results-meta',
      loadMoreWrap: 'series-loadmore',
      loadMoreBtn: 'btn-loadmore-series',
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
        title: 'Breaking Bad',
        matchTitle: 'Breaking Bad',
        kicker: 'Series destacadas',
        image: '../../multimedia/hero/hero-breaking-bad.jpg',
        logo: '../../multimedia/hero/title-breaking-bad.png',
        summary: 'Una serie clave para entrar en JAM por la vía más intensa: personajes memorables, tensión y rewatch asegurado.',
      },
      {
        title: 'Attack on Titan',
        matchTitle: 'Attack on Titan',
        kicker: 'Series destacadas',
        image: '../../multimedia/hero/hero-attack-on-titan.jpg',
        logo: '../../multimedia/hero/title-attack-on-titan.png',
        summary: 'Una opción más oscura y épica para que series se sienta grande, dramática y protagonista desde el primer bloque.',
      },
      {
        title: 'Naruto Shippuden',
        matchTitle: 'Naruto Shippuden',
        kicker: 'Series destacadas',
        image: '../../multimedia/hero/hero-naruto-shippuden.jpg',
        logo: '../../multimedia/hero/title-naruto-shippuden.png',
        summary: 'Anime de largo recorrido para que el hero también pueda entrar por aventura, energía y maratón.',
      },
    ],
    getHref(item) {
      return `./serie.html?id=${item.id}`
    },
    buildHeroText({ state, totalCatalog }) {
      if (state.query) {
        return {
          title: `Resultados para "${state.query}"`,
          text: `${state.totalResults} series encajan ahora mismo. Usa la lista para abrir nuevas rutas de descubrimiento sin perder contexto.`,
        }
      }

      const sortLabel = sortLabels[state.sort] || sortLabels.popular

      return {
        title: 'Qué serie quieres empezar o retomar?',
        text: `${sortCopy[state.sort] || sortCopy.popular} Orden actual: ${sortLabel.toLowerCase()}. ${totalCatalog.toLocaleString('es-ES')} títulos en catálogo.`,
      }
    },
    buildSummary({ state, totalCatalog, totalVisible }) {
      if (state.query) {
        return `${totalVisible} resultados para "${state.query}".`
      }

      const sortLabel = sortLabels[state.sort] || sortLabels.popular
      return `${totalCatalog.toLocaleString('es-ES')} series disponibles. Orden actual: ${sortLabel.toLowerCase()}.`
    },
    buildMetrics({ totalCatalog, totalVisible, currentSet, average, formatCompact }) {
      return [
        {
          label: 'Catálogo',
          value: totalCatalog.toLocaleString('es-ES'),
          note: 'Series listas para descubrir.',
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
        eyebrow: 'Tendencia',
        title: 'Las series con más tracción ahora',
        description: 'Empieza por donde más gente está entrando y comentando.',
        request: { kind: 'search', tipo: 'SERIE', orden: 'votos', dir: 'desc' },
        limit: 18,
      },
      {
        id: 'rating',
        eyebrow: 'Prestigio',
        title: 'Series con mejor recepción',
        description: 'Top para cuando quieres entrar por calidad y permanencia.',
        request: { kind: 'search', tipo: 'SERIE', orden: 'puntos', dir: 'desc' },
        limit: 18,
      },
      {
        id: 'recent',
        eyebrow: 'Actuales',
        title: 'Recientes para engancharte ya',
        description: 'Series nuevas o más cercanas para una portada con presente.',
        request: { kind: 'search', tipo: 'SERIE', orden: 'fecha', dir: 'desc' },
        limit: 18,
      },
      {
        id: 'classics',
        eyebrow: 'Veteranas',
        title: 'Series que siguen tirando del catálogo',
        description: 'Títulos asentados para ir sobre seguro y reengancharse.',
        request: { kind: 'search', tipo: 'SERIE', orden: 'fecha', dir: 'asc' },
        limit: 18,
      },
    ],
    empty: {
      title: 'No encontramos series con esta combinación.',
      text: 'Cambia la búsqueda o limpia el buscador para abrir otra línea de descubrimiento.',
    },
  })
})()
