
;(function () {

    function bindWorkerLinks(root) {
      // ── Actores (.detalle-worker con data-id) ─────────────
      root.querySelectorAll('.detalle-worker[data-id]').forEach(card => {
        const id = card.dataset.id
        if (!id) return
        card.style.cursor = 'pointer'
        card.setAttribute('tabindex', '0')
        card.setAttribute('role', 'button')
        card.setAttribute('aria-label', card.querySelector('.detalle-worker__name')?.textContent?.trim() || 'Ver perfil')
        card.title = 'Ver perfil'
  
        card.addEventListener('click', () => {
          window.location.href = `./trabajador.html?id=${id}`
        })
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click() }
        })

        card.style.transition = 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease'
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-4px)'
          card.style.boxShadow = '0 16px 32px rgba(0,0,0,0.4)'
          card.style.borderColor = 'rgba(204,211,217,0.28)'
        })
        card.addEventListener('mouseleave', () => {
          card.style.transform = ''
          card.style.boxShadow = ''
          card.style.borderColor = ''
        })
      })

      const dirCard = root.querySelector('.detalle-card--director[data-director-id]')
      if (dirCard) {
        const id = dirCard.dataset.directorId
        dirCard.style.cursor = 'pointer'
        const dirBlock = dirCard.querySelector('.detalle-director')
        if (dirBlock) {
          dirBlock.style.transition = 'opacity 0.2s'
          dirCard.addEventListener('mouseenter', () => { dirBlock.style.opacity = '0.85' })
          dirCard.addEventListener('mouseleave', () => { dirBlock.style.opacity = '1' })
        }
        dirCard.addEventListener('click', e => {

          if (e.target.closest('button, a')) return
          window.location.href = `./trabajador.html?id=${id}`
        })
      }
    }
  
    function waitForRoot() {
      const root = document.getElementById('detalle-root')
      if (!root) return
  

      if (root.children.length > 0) {
        bindWorkerLinks(root)
      }

      const observer = new MutationObserver(() => {
        if (root.querySelector('.detalle-worker, .detalle-card--director')) {
          bindWorkerLinks(root)
          observer.disconnect()
        }
      })
  
      observer.observe(root, { childList: true, subtree: true })
    }
  
    document.addEventListener('DOMContentLoaded', waitForRoot)
  })()
  ;(function () {
    function patchJAM() {
      if (!window.JAM) return
  
      const original = window.JAM.buildTrabajadoresSection
      if (!original) return
  
      window.JAM.buildTrabajadoresSection = function (trabajadores, opts) {
        const html = original.call(this, trabajadores, opts)
        if (!trabajadores?.length) return html

        const tmp = document.createElement('div')
        tmp.innerHTML = html
  
        tmp.querySelectorAll('.detalle-worker').forEach((card, i) => {
          const worker = trabajadores[i]
          if (worker?.id != null) {
            card.setAttribute('data-id', String(worker.id))
          }
        })
  
        return tmp.innerHTML
      }
    }
  
    document.addEventListener('DOMContentLoaded', () => {

      setTimeout(patchJAM, 0)
    })
  })()