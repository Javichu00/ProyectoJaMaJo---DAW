(function () {
  function buildSearchIndexFromPage() {
    return [...document.querySelectorAll('[data-search-item]')].map((item) => ({
      title: item.dataset.searchTitle || item.textContent.trim(),
      category: item.dataset.searchCategory || 'Contenido',
      note: item.dataset.searchNote || '',
      href: item.getAttribute('href') || '#inicio',
    }))
  }

  function bindRails() {
    document.querySelectorAll('[data-rail-prev]').forEach((button) => {
      button.addEventListener('click', () => {
        const railId = button.getAttribute('data-rail-prev')
        const rail = document.querySelector(`[data-rail="${railId}"]`)
        if (!rail) {
          return
        }
        rail.scrollBy({ left: rail.clientWidth * -0.84, behavior: 'smooth' })
      })
    })

    document.querySelectorAll('[data-rail-next]').forEach((button) => {
      button.addEventListener('click', () => {
        const railId = button.getAttribute('data-rail-next')
        const rail = document.querySelector(`[data-rail="${railId}"]`)
        if (!rail) {
          return
        }
        rail.scrollBy({ left: rail.clientWidth * 0.84, behavior: 'smooth' })
      })
    })
  }

  function initIndexAnimations() {
    if (!window.gsap) {
      return
    }

    gsap.fromTo(
      '[data-reveal]',
      { y: 40, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.85, ease: 'power3.out', stagger: 0.12 },
    )

    gsap.to('.hero-poster:nth-child(1)', {
      y: '-=8',
      rotation: -11,
      repeat: -1,
      yoyo: true,
      duration: 3.8,
      ease: 'sine.inOut',
    })

    gsap.to('.hero-poster:nth-child(2)', {
      y: '+=10',
      repeat: -1,
      yoyo: true,
      duration: 4.2,
      ease: 'sine.inOut',
    })

    gsap.to('.hero-poster:nth-child(3)', {
      y: '-=6',
      rotation: 9,
      repeat: -1,
      yoyo: true,
      duration: 3.5,
      ease: 'sine.inOut',
    })
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.JAM) {
      return
    }

    window.JAM.setSearchIndex(buildSearchIndexFromPage())
    bindRails()
    initIndexAnimations()
  })
})()
