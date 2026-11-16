(function () {
  const PAGE_SIZE = 5

  const escapeHtml =
    window.JAM?.escapeHtml ||
    ((value) =>
      String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;'))

  function getInitials(nombre) {
    if (!nombre) return '?'
    return nombre.split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase()
  }

  function getResenaId(resena) {
    return resena?.idResena ?? resena?.id ?? resena?.id_resena ?? null
  }

  function sameId(a, b) {
    return String(a ?? '') === String(b ?? '')
  }

  function formatDate(isoString) {
    if (!isoString) return ''
    try {
      return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(isoString))
    } catch {
      return ''
    }
  }

  function starSvg() {
    return `<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
  }

  async function readError(response) {
    const text = await response.text().catch(() => '')
    if (!text) return `HTTP ${response.status}`
    try {
      const data = JSON.parse(text)
      return data.message || data.error || text
    } catch {
      return text
    }
  }

  async function fetchResenas(idContenido) {
    const response = await fetch(`${API_BASE}/resenas/contenido/${idContenido}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    return Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []
  }

  async function fetchMedia(idContenido) {
    const response = await fetch(`${API_BASE}/resenas/contenido/${idContenido}/media`)
    if (!response.ok) return null
    const data = await response.json()
    return typeof data === 'number' ? data : data?.media ?? data?.puntuacionMedia ?? null
  }

  async function fetchNombreCuenta(idCuenta) {
    const response = await fetch(`${API_BASE}/cuentas/id/${idCuenta}`)
    if (!response.ok) return null
    const data = await response.json()
    return data?.nombre || data?.username || data?.email || null
  }

  async function createResena(idCuenta, idContenido, texto, puntuacion) {
    const response = await fetch(`${API_BASE}/resenas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idCuenta, idContenido, texto, puntuacion }),
    })
    if (!response.ok) throw new Error(await readError(response))
    return response.json()
  }

  async function updateResena(idResena, idCuenta, texto, puntuacion) {
    const response = await fetch(`${API_BASE}/resenas/${idResena}?idCuenta=${encodeURIComponent(idCuenta)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto, puntuacion }),
    })
    if (!response.ok) throw new Error(await readError(response))
    return response.json()
  }

  async function deleteResena(idResena, idCuenta) {
    const response = await fetch(`${API_BASE}/resenas/${idResena}?idCuenta=${encodeURIComponent(idCuenta)}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error(await readError(response))
  }

  function buildRatingSelector(selected) {
    return Array.from({ length: 5 }, (_, index) => {
      const value = index + 1
      return `<button class="resenas-rating-selector__btn${value === Number(selected) ? ' is-selected' : ''}" type="button" data-rating-btn="${value}" aria-label="${value} sobre 5">${value}</button>`
    }).join('')
  }

  function buildFormWrap({ texto = '', puntuacion = 0, mode = 'create' } = {}) {
    const isEdit = mode === 'edit'
    return `
      <div class="resenas-form-wrap${isEdit ? ' resenas-form-wrap--edit' : ''}" data-resena-form="${mode}">
        <div class="resenas-form-wrap__head">
          <span class="resenas-form-wrap__title">${isEdit ? 'Editar reseña' : 'Escribe una reseña'}</span>
        </div>
        <div class="resenas-form__rating-label">Puntuación</div>
        <div class="resenas-rating-selector" data-rating-selector>
          ${buildRatingSelector(Number(puntuacion) || 0)}
        </div>
        <textarea class="resenas-form__textarea" data-resena-textarea placeholder="Cuenta qué te ha parecido este contenido..." maxlength="1200">${escapeHtml(texto)}</textarea>
        <div class="resenas-form__footer">
          <span class="resenas-form__error" data-resena-error></span>
          <div class="resenas-form__actions">
            ${isEdit ? '<button class="resenas-btn resenas-btn--ghost" type="button" data-edit-cancel>Cancelar</button>' : ''}
            <button class="resenas-btn resenas-btn--primary" type="button" data-resena-submit>${isEdit ? 'Guardar cambios' : 'Publicar reseña'}</button>
          </div>
        </div>
      </div>`
  }

  function buildResenaCard(resena, idCuentaActual) {
    const idResena = getResenaId(resena)
    const isOwn = sameId(resena.idCuenta, idCuentaActual)
    const nombre = resena.nombreCuenta || resena.cuenta?.nombre || `Usuario ${resena.idCuenta}`
    const ownActions = isOwn
      ? `
        <div class="resena-card__actions">
          <button class="resenas-btn resenas-btn--ghost" type="button" data-edit-resena="${idResena}">Editar</button>
          <button class="resenas-btn resenas-btn--danger" type="button" data-delete-resena="${idResena}">Eliminar</button>
        </div>`
      : ''

    return `
      <article class="resena-card${isOwn ? ' is-own' : ''}" data-resena-card="${idResena}">
        <div class="resena-card__header">
          <div class="resena-card__avatar">${escapeHtml(getInitials(nombre))}</div>
          <div class="resena-card__meta">
            <div class="resena-card__name">${escapeHtml(nombre)}${isOwn ? ' <span class="resena-card__own-badge">Tú</span>' : ''}</div>
            <div class="resena-card__sub">
              <span class="resena-card__score">${starSvg()} ${resena.puntuacion ?? '-'}/5</span>
              <span class="resena-card__date">${formatDate(resena.fechaCreacion || resena.fecha)}</span>
            </div>
          </div>
          ${ownActions}
        </div>
        <p class="resena-card__body">${escapeHtml(resena.texto || '')}</p>
      </article>`
  }

  function buildLoginPrompt() {
    return `
      <div class="resenas-login-prompt">
        <p>Inicia sesión y selecciona un perfil para dejar una reseña.</p>
        <a class="resenas-btn resenas-btn--primary" href="./landing.html">Iniciar sesión</a>
      </div>`
  }

  async function enrichResenas(resenas) {
    const idsSinNombre = [
      ...new Set(
        resenas
          .filter((resena) => !resena.nombreCuenta && !resena.cuenta?.nombre)
          .map((resena) => resena.idCuenta)
          .filter(Boolean),
      ),
    ]

    if (!idsSinNombre.length) return resenas

    const nombres = await Promise.all(idsSinNombre.map((id) => fetchNombreCuenta(id).catch(() => null)))
    const nombrePorId = Object.fromEntries(idsSinNombre.map((id, index) => [String(id), nombres[index]]))

    return resenas.map((resena) => ({
      ...resena,
      nombreCuenta: resena.nombreCuenta || resena.cuenta?.nombre || nombrePorId[String(resena.idCuenta)] || `Usuario ${resena.idCuenta}`,
    }))
  }

  async function renderResenas(sectionEl, idContenido) {
    const user = JSON.parse(localStorage.getItem('JAM_user') || 'null')
    const profile = JSON.parse(localStorage.getItem('JAM_profile') || 'null')
    const idCuenta = profile?.email === user?.email ? profile?.idCuenta ?? null : null

    let resenas = []
    let media = null

    try {
      ;[resenas, media] = await Promise.all([
        fetchResenas(idContenido),
        fetchMedia(idContenido).catch(() => null),
      ])
      resenas = await enrichResenas(resenas)
    } catch (error) {
      console.warn('[resenas.js] Error al cargar reseñas:', error)
    }

    const propiaResena = resenas.find((resena) => sameId(resena.idCuenta, idCuenta)) || null
    const otrasResenas = resenas.filter((resena) => !sameId(resena.idCuenta, idCuenta))
    const mediaText =
      media != null
        ? `<span class="resenas-stats__score">${starSvg()} ${Number(media).toFixed(1)}<small>/5.0</small></span>`
        : ''

    sectionEl.innerHTML = `
      <div class="resenas-header">
        <div class="resenas-header__copy">
          <p class="detalle-card__label">Reseñas</p>
          <h2 class="detalle-card__title">Qué opina la comunidad</h2>
        </div>
        <div class="resenas-stats">
          ${mediaText}
          <span class="resenas-stats__count">${resenas.length} ${resenas.length === 1 ? 'reseña' : 'reseñas'}</span>
        </div>
      </div>

      <div data-resenas-form-area>
        ${
          !user?.email
            ? buildLoginPrompt()
            : !idCuenta
              ? '<div class="resenas-login-prompt"><p>Selecciona un perfil para escribir una reseña.</p><a class="resenas-btn resenas-btn--primary" href="./perfiles.html">Elegir perfil</a></div>'
              : propiaResena
                ? ''
                : buildFormWrap()
        }
      </div>

      <div class="resenas-list" data-resenas-list>
        ${propiaResena ? buildResenaCard(propiaResena, idCuenta) : ''}
        ${
          otrasResenas.length
            ? otrasResenas.slice(0, PAGE_SIZE).map((resena) => buildResenaCard(resena, idCuenta)).join('')
            : !propiaResena
              ? '<div class="resenas-empty">Todavía no hay reseñas. Sé el primero en opinar.</div>'
              : ''
        }
      </div>

      ${
        otrasResenas.length > PAGE_SIZE
          ? `
            <div class="resenas-ver-mas" data-ver-mas-wrap>
              <button class="resenas-btn resenas-btn--ghost" type="button" data-ver-mas>
                Ver más reseñas <span data-ver-mas-count>(${otrasResenas.length - PAGE_SIZE} más)</span>
              </button>
            </div>`
          : ''
      }`

    bindResenas(sectionEl, idContenido, idCuenta, resenas, otrasResenas)
  }

  function bindResenas(sectionEl, idContenido, idCuenta, resenas, otrasResenas) {
    function bindRatingSelector(scope, initialRating = 0) {
      let localRating = Number(initialRating) || 0

      scope.querySelectorAll('[data-rating-btn]').forEach((button) => {
        button.addEventListener('click', () => {
          localRating = Number(button.dataset.ratingBtn)
          scope.querySelectorAll('[data-rating-btn]').forEach((item) => {
            item.classList.toggle('is-selected', Number(item.dataset.ratingBtn) === localRating)
          })
        })
      })

      return () => localRating
    }

    function showError(scope, message) {
      const element = scope.querySelector('[data-resena-error]')
      if (!element) return
      element.textContent = message
      element.classList.add('is-visible')
    }

    function hideError(scope) {
      const element = scope.querySelector('[data-resena-error]')
      element?.classList.remove('is-visible')
    }

    function setSubmitLoading(scope, loading, label) {
      const button = scope.querySelector('[data-resena-submit]')
      if (!button) return
      button.disabled = loading
      button.textContent = loading ? 'Enviando...' : label
    }

    function readForm(scope) {
      return {
        texto: scope.querySelector('[data-resena-textarea]')?.value.trim() || '',
        puntuacion: bindRatingSelector(scope, Number(scope.querySelector('.is-selected')?.dataset.ratingBtn) || 0)(),
      }
    }

    function validateForm(scope, data) {
      if (!data.puntuacion) {
        showError(scope, 'Elige una puntuación del 1 al 5.')
        return false
      }
      if (!data.texto) {
        showError(scope, 'Escribe algo antes de guardar.')
        return false
      }
      return true
    }

    function bindCreateForm() {
      const formArea = sectionEl.querySelector('[data-resenas-form-area]')
      if (!formArea) return

      const getRating = bindRatingSelector(formArea, 0)
      const submitButton = formArea.querySelector('[data-resena-submit]')
      if (!submitButton) return

      submitButton.addEventListener('click', async () => {
        hideError(formArea)
        const data = {
          texto: formArea.querySelector('[data-resena-textarea]')?.value.trim() || '',
          puntuacion: getRating(),
        }
        if (!validateForm(formArea, data)) return

        setSubmitLoading(formArea, true, 'Publicar reseña')
        try {
          await createResena(idCuenta, idContenido, data.texto, data.puntuacion)
          await renderResenas(sectionEl, idContenido)
        } catch (error) {
          setSubmitLoading(formArea, false, 'Publicar reseña')
          showError(formArea, error.message || 'No se pudo publicar la reseña.')
        }
      })
    }

    function bindEditCard(cardEl, resenaId) {
      const editButton = cardEl.querySelector(`[data-edit-resena="${resenaId}"]`)
      editButton?.addEventListener('click', () => {
        const resena = resenas.find((item) => sameId(getResenaId(item), resenaId))
        if (!resena || cardEl.querySelector('[data-resena-form="edit"]')) return

        const body = cardEl.querySelector('.resena-card__body')
        const originalBody = body?.outerHTML || ''
        body?.insertAdjacentHTML('afterend', buildFormWrap({ texto: resena.texto || '', puntuacion: resena.puntuacion || 0, mode: 'edit' }))
        body?.remove()

        const form = cardEl.querySelector('[data-resena-form="edit"]')
        const getRating = bindRatingSelector(form, resena.puntuacion || 0)

        form.querySelector('[data-edit-cancel]')?.addEventListener('click', () => {
          form.insertAdjacentHTML('beforebegin', originalBody)
          form.remove()
        })

        form.querySelector('[data-resena-submit]')?.addEventListener('click', async () => {
          hideError(form)
          const data = {
            texto: form.querySelector('[data-resena-textarea]')?.value.trim() || '',
            puntuacion: getRating(),
          }
          if (!validateForm(form, data)) return

          setSubmitLoading(form, true, 'Guardar cambios')
          try {
            await updateResena(resenaId, idCuenta, data.texto, data.puntuacion)
            await renderResenas(sectionEl, idContenido)
          } catch (error) {
            setSubmitLoading(form, false, 'Guardar cambios')
            showError(form, error.message || 'No se pudo editar la reseña.')
          }
        })
      })
    }

    function bindDeleteCard(cardEl, resenaId) {
      const deleteButton = cardEl.querySelector(`[data-delete-resena="${resenaId}"]`)
      deleteButton?.addEventListener('click', async () => {
        if (!confirm('¿Eliminar tu reseña? Esta acción no se puede deshacer.')) return
        try {
          await deleteResena(resenaId, idCuenta)
          await renderResenas(sectionEl, idContenido)
        } catch (error) {
          alert(error.message || 'No se pudo eliminar la reseña.')
        }
      })
    }

    let paginaActual = 1
    const verMasButton = sectionEl.querySelector('[data-ver-mas]')
    const verMasCount = sectionEl.querySelector('[data-ver-mas-count]')
    const listEl = sectionEl.querySelector('[data-resenas-list]')

    verMasButton?.addEventListener('click', () => {
      paginaActual++
      const from = (paginaActual - 1) * PAGE_SIZE
      const to = paginaActual * PAGE_SIZE
      const nuevas = otrasResenas.slice(from, to)

      nuevas.forEach((resena) => {
        const tmp = document.createElement('div')
        tmp.innerHTML = buildResenaCard(resena, idCuenta)
        const cardEl = tmp.firstElementChild
        listEl.appendChild(cardEl)
        const resenaId = getResenaId(resena)
        if (resenaId) {
          bindEditCard(cardEl, resenaId)
          bindDeleteCard(cardEl, resenaId)
        }
      })

      const restantes = otrasResenas.length - paginaActual * PAGE_SIZE
      if (restantes <= 0) {
        verMasButton.closest('[data-ver-mas-wrap]')?.remove()
      } else {
        verMasCount.textContent = `(${restantes} más)`
      }
    })

    bindCreateForm()

    sectionEl.querySelectorAll('[data-resena-card]').forEach((cardEl) => {
      const resenaId = cardEl.dataset.resenaCard
      if (!resenaId) return
      bindEditCard(cardEl, resenaId)
      bindDeleteCard(cardEl, resenaId)
    })
  }

  window.JAM_RESENAS = {
    render: renderResenas,
  }
})()
