

    const PLANES = [
      {
        id: 'ANUNCIOS',
        nombre: 'Anuncios',
        precio: 6.99,
        destacado: false,
        tagline: 'Ideal para empezar a explorar el catálogo.',
        features: [
          { texto: '2 perfiles incluidos',               activo: true  },
          { texto: 'Explorar, comentar y hacer listas',  activo: true  },
          { texto: 'Películas con anuncios',              activo: true  },
          { texto: 'Listas limitadas',                    activo: false },
          { texto: 'Sin películas sin anuncios',           activo: false },
        ],
      },
      {
        id: 'ESTANDAR',
        nombre: 'Estándar',
        precio: 12.99,
        destacado: true,
        tagline: 'La experiencia completa sin interrupciones.',
        features: [
          { texto: '4 perfiles incluidos',               activo: true  },
          { texto: 'Explorar, comentar y hacer listas',  activo: true  },
          { texto: 'Películas sin anuncios',             activo: true  },
          { texto: 'Listas limitadas',                   activo: false },
          { texto: 'Sin listas ilimitadas',               activo: false },
        ],
      },
      {
        id: 'PRO',
        nombre: 'Pro',
        precio: 19.99,
        destacado: false,
        tagline: 'Para quienes quieren todo, sin límites.',
        features: [
          { texto: '6 perfiles incluidos',               activo: true },
          { texto: 'Explorar, comentar y hacer listas',  activo: true },
          { texto: 'Películas sin anuncios',             activo: true },
          { texto: 'Listas ilimitadas',                   activo: true },
          { texto: 'Todo sin restricciones',              activo: true },
        ],
      },
    ]
    
    const SVG_CHECK = `<svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
    
    const SVG_CROSS = `<svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
    
    function renderTarjeta(plan) {
      const featuresHtml = plan.features
        .map((f) => {
          const iconClass = f.activo ? 'plan-feature-icon--check' : 'plan-feature-icon--cross'
          const svg = f.activo ? SVG_CHECK : SVG_CROSS
          const mutedClass = f.activo ? '' : ' plan-feature--muted'
          return `
            <div class="plan-feature${mutedClass}">
              <div class="plan-feature-icon ${iconClass}">${svg}</div>
              <span>${f.texto}</span>
            </div>`
        })
        .join('')
    
      const badgeHtml = plan.destacado
        ? '<span class="plan-badge">Recomendado</span>'
        : ''
    
      const btnClass = plan.destacado ? 'plan-btn plan-btn--primary' : 'plan-btn'
      const cardClass = plan.destacado ? 'plan-card plan-card--featured' : 'plan-card'
    
      return `
        <article class="${cardClass}" data-plan="${plan.id}">
          ${badgeHtml}
          <div class="plan-header">
            <p class="plan-name">${plan.nombre}</p>
            <div class="plan-price-row">
              <span class="plan-currency">€</span>
              <span class="plan-price">${plan.precio.toFixed(2)}</span>
              <span class="plan-period">/mes</span>
            </div>
            <p class="plan-tagline">${plan.tagline}</p>
          </div>
          <div class="plan-features">
            ${featuresHtml}
          </div>
          <div class="plan-footer">
            <button class="${btnClass}" data-plan-id="${plan.id}">
              Elegir ${plan.nombre}
            </button>
          </div>
        </article>`
    }
    
    function initPlanes(containerId = 'planes-root') {
      const root = document.getElementById(containerId)
      if (!root) return
    
      root.innerHTML = `
        <div class="plans-page">
          <p class="plans-eyebrow">Suscripción</p>
          <h1 class="plans-title">Elige tu plan</h1>
          <p class="plans-sub">Accede a todo el catálogo. Sin permanencia. Cancela cuando quieras.</p>
    
          <div class="plans-grid">
            ${PLANES.map(renderTarjeta).join('')}
          </div>
    
          <div class="plans-divider"></div>
    
          <div class="free-row">
            <div class="free-row__copy">
              <p class="free-row__label">Plan gratuito · predeterminado</p>
              <p class="free-row__title">Continuar con Gratis</p>
              <p class="free-row__desc">1 perfil · Explorar y comentar · Listas limitadas · Con anuncios</p>
            </div>
            <button class="free-btn" data-plan-id="GRATIS">Continuar gratis →</button>
          </div>
        </div>`
    
      root.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-plan-id]')
        if (!btn) return
        seleccionarPlan(btn.dataset.planId)
      })
    }
    
    function seleccionarPlan(planId) {
      sessionStorage.setItem('planSeleccionado', planId)

      if (planId === 'GRATIS') {
        sessionStorage.setItem('JAM_profile_onboarding', '1')
        window.location.href = './perfiles.html?setup=1'
        return
      }
    
      window.location.href = './pago.html'
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initPlanes())
    } else {
      initPlanes()
    }
