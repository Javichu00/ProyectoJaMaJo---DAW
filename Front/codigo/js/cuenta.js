(function () {
  const PLAN_LIMITS = {
    GRATIS: 1,
    ANUNCIOS: 2,
    ESTANDAR: 4,
    PRO: 6,
  }

  const TEMP_PROFILE_PREFIX = '__jam_profile__'
  const AVATAR_OPTIONS = [1, 2, 3, 4, 5, 6]

  let user = null
  let cuentas = []
  let pagos = []
  let activeProfile = null
  let editingCuentaId = null
  let deletingCuentaId = null
  let selectedAvatar = 1

  function getStoredUser() {
    try {
      return JSON.parse(localStorage.getItem('JAM_user') || 'null')
    } catch {
      return null
    }
  }

  function getStoredProfile() {
    try {
      return JSON.parse(localStorage.getItem('JAM_profile') || 'null')
    } catch {
      return null
    }
  }

  function saveActiveProfile(cuenta) {
    if (!cuenta || !user?.email) return
    localStorage.setItem(
      'JAM_profile',
      JSON.stringify({
        idCuenta: cuenta.idCuenta,
        username: cuenta.username,
        idFoto: cuenta.idFoto || 1,
        email: user.email,
      }),
    )
    activeProfile = getStoredProfile()
  }

  function clearSession() {
    localStorage.removeItem('JAM_user')
    localStorage.removeItem('JAM_token')
    localStorage.removeItem('JAM_profile')
    localStorage.removeItem('JAM_plan')
    sessionStorage.removeItem('JAM_profile_onboarding')
    sessionStorage.removeItem('planSeleccionado')
  }

  function formatFecha(value) {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  function getPlanLimit(planName) {
    return PLAN_LIMITS[planName] || 1
  }

  function isTemporaryProfileName(value) {
    return String(value || '').startsWith(TEMP_PROFILE_PREFIX)
  }

  function getVisibleProfileName(cuenta) {
    const raw = String(cuenta?.username || '').trim()
    if (!raw) return 'Perfil'
    return isTemporaryProfileName(raw) ? 'Perfil pendiente' : raw
  }

  function getInitials(value) {
    const clean = String(value || '').trim()
    if (!clean) return 'JA'
    const parts = clean.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return clean.slice(0, 2).toUpperCase()
  }

  function getActiveCuenta() {
    return cuentas.find((cuenta) => Number(cuenta.idCuenta) === Number(activeProfile?.idCuenta)) || null
  }

  function getAccountDisplayName() {
    const activeCuenta = getActiveCuenta()
    if (activeCuenta) return getVisibleProfileName(activeCuenta)
    return getVisibleProfileName(cuentas[0]) || user?.email || 'Cuenta JAM'
  }

  function setMessage(id, message, isError = false) {
    const el = document.getElementById(id)
    if (!el) return

    if (!message) {
      el.hidden = true
      el.textContent = ''
      el.classList.remove('perfil-inline-note--success')
      el.classList.remove('perfil-inline-note--error')
      return
    }

    el.hidden = false
    el.textContent = message
    el.classList.toggle('perfil-inline-note--error', isError)
    el.classList.toggle('perfil-inline-note--success', !isError)
  }

  async function fetchUser(email) {
    const response = await fetch(`${API_BASE}/usuarios/${email}`)
    if (!response.ok) throw new Error('No se pudo cargar la cuenta.')
    return response.json()
  }

  async function fetchPagos(email) {
    const response = await fetch(`${API_BASE}/pagos/${email}`)
    if (!response.ok) return []
    return response.json()
  }

  async function fetchCuentas(email) {
    const response = await fetch(`${API_BASE}/cuentas/${email}`)
    if (!response.ok) throw new Error('No se pudieron cargar los perfiles.')
    return response.json()
  }

  async function createCuenta(email, body) {
    const response = await fetch(`${API_BASE}/cuentas/${email}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || 'No se pudo crear el perfil.')
    }

    return response.json()
  }

  async function updateCuenta(idCuenta, body) {
    const response = await fetch(`${API_BASE}/cuentas/${idCuenta}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || 'No se pudo actualizar el perfil.')
    }

    return response.json()
  }

  async function deleteCuenta(idCuenta, password) {
    const response = await fetch(
      `${API_BASE}/cuentas/${idCuenta}?password=${encodeURIComponent(password)}`,
      { method: 'DELETE' },
    )

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || 'No se pudo eliminar el perfil.')
    }
  }

  async function disableUsuario(email) {
    const response = await fetch(`${API_BASE}/usuarios/${email}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('No se pudo desactivar la cuenta.')
  }

  function syncStoredProfile() {
    const stored = getStoredProfile()
    if (!stored?.idCuenta || stored?.email !== user?.email) {
      localStorage.removeItem('JAM_profile')
      activeProfile = null
      return
    }

    const fresh = cuentas.find((cuenta) => Number(cuenta.idCuenta) === Number(stored.idCuenta))
    if (!fresh) {
      localStorage.removeItem('JAM_profile')
      activeProfile = null
      return
    }

    saveActiveProfile(fresh)
  }

  function renderHero() {
    const planName = user?.nombrePlan || 'GRATIS'
    const limit = getPlanLimit(planName)
    const title = getAccountDisplayName()
    const activeCuenta = getActiveCuenta()

    const avatar = document.getElementById('perfil-avatar')
    const idFoto = activeCuenta?.idFoto || 1
    avatar.innerHTML = `<img src="../../multimedia/AvataresCuentas/Perfil${idFoto}.png" alt="Avatar ${idFoto}" />`
    avatar.dataset.avatar = String(idFoto)
    document.getElementById('perfil-username').textContent = title
    document.getElementById('perfil-account-email').textContent = user.email

    const status = document.getElementById('perfil-pill-status')
    status.textContent = user.enabled ? 'Activa' : 'Inactiva'
    status.classList.toggle('perfil-hero__pill--active', !!user.enabled)

    document.getElementById('perfil-pill-plan').textContent = planName
    document.getElementById('perfil-pill-profiles').textContent = `${cuentas.length} / ${limit} perfiles`
  }

  function renderInfoCuenta() {
    const planName = user?.nombrePlan || 'GRATIS'
    const limit = getPlanLimit(planName)

    document.getElementById('info-plan').textContent = planName
    document.getElementById('info-email').textContent = user.email
    document.getElementById('info-fecha').textContent = formatFecha(user.fechaRegistro || user.fecha_registro)
    document.getElementById('info-perfiles').textContent = `${cuentas.length} / ${limit}`
    document.getElementById('info-fecha-fin').textContent = formatFecha(user.fechaFin || user.fecha_fin)

    const status = document.getElementById('info-status')
    status.textContent = user.enabled ? 'Activa' : 'Inactiva'
    status.style.color = user.enabled ? 'rgba(120,220,150,0.9)' : 'rgba(220,110,110,0.82)'
  }

  function renderHistorial() {
    const container = document.getElementById('historial-body')
    if (!container) return

    if (!pagos.length) {
      container.innerHTML = `
        <div class="perfil-empty">
          <p class="perfil-empty__text">Aun no has realizado ninguna compra.</p>
        </div>
      `
      return
    }

    container.innerHTML = pagos
      .map((pago) => {
        const fecha = formatFecha(pago.fecha || pago.fechaPago || pago.fecha_pago)
        const plan = pago.nombrePlan || pago.plan || '-'
        const importe = pago.importe != null ? `${Number(pago.importe).toFixed(2)} EUR` : '-'
        return `
          <div class="perfil-info-row">
            <span class="perfil-info-row__key">${fecha}</span>
            <span class="perfil-info-row__val">${plan} · ${importe}</span>
          </div>
        `
      })
      .join('')
  }

  function renderAvatarPicker() {
    const picker = document.getElementById('modal-profile-avatars')
    if (!picker) return

    picker.innerHTML = AVATAR_OPTIONS.map((idFoto) => {
      const selectedClass = idFoto === selectedAvatar ? ' is-selected' : ''
      return `
        <button class="perfil-avatar-chip${selectedClass}" type="button" data-avatar-option="${idFoto}">
          <img class="perfil-avatar-chip__preview" src="../../multimedia/AvataresCuentas/Perfil${idFoto}.png" alt="Avatar ${idFoto}" />
          <span class="perfil-avatar-chip__label">Avatar ${idFoto}</span>
        </button>
      `
    }).join('')
  }

  function renderProfiles() {
    const planName = user?.nombrePlan || 'GRATIS'
    const limit = getPlanLimit(planName)
    const list = document.getElementById('profiles-list')
    const button = document.getElementById('btn-open-create-profile')
    const summary = document.getElementById('profiles-summary')

    if (summary) {
      summary.textContent = `${cuentas.length} de ${limit} perfiles en uso · plan ${planName}`
    }

    if (!list) return

    if (!cuentas.length) {
      list.innerHTML = `
        <div class="perfil-empty perfil-empty--card">
          <div class="perfil-empty__icon">👤</div>
          <p class="perfil-empty__text">Todavia no hay perfiles creados en esta cuenta.</p>
        </div>
      `
    } else {
      list.innerHTML = cuentas
        .map((cuenta, index) => {
          const isActive = Number(activeProfile?.idCuenta) === Number(cuenta.idCuenta)
          const canDelete = cuentas.length > 1
          return `
            <article class="perfil-profile-card${isActive ? ' is-active' : ''}" data-profile-id="${cuenta.idCuenta}">
              <div class="perfil-profile-avatar" data-avatar="${cuenta.idFoto || 1}">
            <img src="../../multimedia/AvataresCuentas/Perfil${cuenta.idFoto || 1}.png" alt="Avatar ${cuenta.idFoto || 1}" />
          </div>
              <div class="perfil-profile-info">
                <h3 class="perfil-profile-name">${getVisibleProfileName(cuenta)}</h3>
                <p class="perfil-profile-meta">${isActive ? 'Perfil activo' : index === 0 ? 'Perfil inicial' : 'Perfil adicional'}</p>
              </div>
              <div class="perfil-profile-actions">
                <button class="perfil-btn-ghost" type="button" data-profile-select="${cuenta.idCuenta}">
                  ${isActive ? 'En uso' : 'Usar perfil'}
                </button>
                <button class="perfil-btn-ghost" type="button" data-profile-edit="${cuenta.idCuenta}">Editar</button>
                <button
                  class="perfil-btn-ghost ${canDelete ? 'perfil-btn-ghost--danger' : ''}"
                  type="button"
                  data-profile-delete="${cuenta.idCuenta}"
                  ${canDelete ? '' : 'disabled'}
                >
                  Eliminar
                </button>
              </div>
            </article>
          `
        })
        .join('')
    }

    if (button) {
      button.disabled = cuentas.length >= limit
      button.textContent = cuentas.length >= limit ? `Limite ${planName} alcanzado` : 'Crear perfil'
    }
  }

  function rerender() {
    renderHero()
    renderInfoCuenta()
    renderHistorial()
    renderProfiles()
  }

  function openModal(id) {
    document.getElementById(id)?.classList.add('is-open')
    document.body.classList.add('is-locked')
  }

  function closeModal(id) {
    document.getElementById(id)?.classList.remove('is-open')
    if (!document.querySelector('.perfil-modal.is-open')) {
      document.body.classList.remove('is-locked')
    }
  }

  function resetProfileModal() {
    editingCuentaId = null
    selectedAvatar = 1
    document.getElementById('modal-profile-name').value = ''
    document.getElementById('modal-profile-title').textContent = 'Crear perfil'
    document.getElementById('modal-profile-desc').textContent =
      'Elige el nombre visible y el avatar con el que se mostrara este perfil.'
    renderAvatarPicker()
    setMessage('modal-profile-error', '')
  }

  function openCreateProfileModal() {
    resetProfileModal()
    openModal('modal-profile')
    document.getElementById('modal-profile-name')?.focus()
  }

  function openEditProfileModal(idCuenta) {
    const cuenta = cuentas.find((item) => item.idCuenta === Number(idCuenta))
    if (!cuenta) return

    editingCuentaId = cuenta.idCuenta
    selectedAvatar = cuenta.idFoto || 1
    document.getElementById('modal-profile-name').value = isTemporaryProfileName(cuenta.username) ? '' : cuenta.username || ''
    document.getElementById('modal-profile-title').textContent = 'Editar perfil'
    document.getElementById('modal-profile-desc').textContent =
      'Actualiza el nombre visible y el avatar de este perfil.'
    renderAvatarPicker()
    setMessage('modal-profile-error', '')
    openModal('modal-profile')
    document.getElementById('modal-profile-name')?.focus()
  }

  function openDeleteProfileModal(idCuenta) {
    deletingCuentaId = Number(idCuenta)
    document.getElementById('modal-profile-password').value = ''
    setMessage('modal-profile-delete-error', '')
    openModal('modal-profile-delete')
    document.getElementById('modal-profile-password')?.focus()
  }

  async function reloadProfiles() {
    cuentas = await fetchCuentas(user.email)
    syncStoredProfile()
    rerender()
  }

  async function handleSaveProfile() {
    const input = document.getElementById('modal-profile-name')
    const name = input?.value.trim() || ''

    if (!name) {
      setMessage('modal-profile-error', 'Introduce un nombre para el perfil.', true)
      return
    }

    try {
      if (editingCuentaId) {
        await updateCuenta(editingCuentaId, { username: name, idFoto: selectedAvatar })
        setMessage('profiles-feedback', 'Perfil actualizado correctamente.')
      } else {
        await createCuenta(user.email, { username: name, idFoto: selectedAvatar })
        setMessage('profiles-feedback', 'Perfil creado correctamente.')
      }

      closeModal('modal-profile')
      await reloadProfiles()

      if (editingCuentaId && Number(activeProfile?.idCuenta) === Number(editingCuentaId)) {
        const updated = cuentas.find((item) => Number(item.idCuenta) === Number(editingCuentaId))
        if (updated) saveActiveProfile(updated)
      }

      resetProfileModal()
    } catch (err) {
      setMessage('modal-profile-error', err.message || 'No se pudo guardar el perfil.', true)
    }
  }

  async function handleDeleteProfile() {
    const password = document.getElementById('modal-profile-password')?.value || ''
    if (!password) {
      setMessage('modal-profile-delete-error', 'Introduce la contrasena de la cuenta.', true)
      return
    }

    if (cuentas.length <= 1) {
      setMessage('modal-profile-delete-error', 'La cuenta necesita al menos un perfil.', true)
      return
    }

    try {
      const deletingWasActive = Number(activeProfile?.idCuenta) === Number(deletingCuentaId)
      await deleteCuenta(deletingCuentaId, password)
      closeModal('modal-profile-delete')
      setMessage('profiles-feedback', 'Perfil eliminado correctamente.')
      await reloadProfiles()

      if (deletingWasActive) {
        if (cuentas[0]) {
          saveActiveProfile(cuentas[0])
        } else {
          localStorage.removeItem('JAM_profile')
          activeProfile = null
        }
      }
    } catch (err) {
      setMessage('modal-profile-delete-error', err.message || 'No se pudo eliminar el perfil.', true)
    }
  }

  function bindProfileActions() {
    document.getElementById('btn-open-create-profile')?.addEventListener('click', openCreateProfileModal)
    document.getElementById('modal-profile-cancel')?.addEventListener('click', () => closeModal('modal-profile'))
    document.getElementById('modal-profile-confirm')?.addEventListener('click', handleSaveProfile)
    document.getElementById('modal-profile-delete-cancel')?.addEventListener('click', () => closeModal('modal-profile-delete'))
    document.getElementById('modal-profile-delete-confirm')?.addEventListener('click', handleDeleteProfile)

    document.getElementById('modal-profile-avatars')?.addEventListener('click', (event) => {
      const option = event.target.closest('[data-avatar-option]')?.dataset.avatarOption
      if (!option) return
      selectedAvatar = Number(option)
      renderAvatarPicker()
    })

    document.getElementById('profiles-list')?.addEventListener('click', (event) => {
      const selectId = event.target.closest('[data-profile-select]')?.dataset.profileSelect
      if (selectId) {
        const cuenta = cuentas.find((item) => Number(item.idCuenta) === Number(selectId))
        if (cuenta) {
          saveActiveProfile(cuenta)
          window.location.href = './index.html'
        }
        return
      }

      const editId = event.target.closest('[data-profile-edit]')?.dataset.profileEdit
      if (editId) {
        openEditProfileModal(editId)
        return
      }

      const deleteId = event.target.closest('[data-profile-delete]')?.dataset.profileDelete
      if (deleteId) {
        openDeleteProfileModal(deleteId)
      }
    })
  }

  function bindPasswordChange() {
    let verifiedToken = null
  
    function openCp() {
      verifiedToken = null
      // Reset todos los pasos
      document.getElementById('cp-step-1').hidden = false
      document.getElementById('cp-step-2').hidden = true
      document.getElementById('cp-step-3').hidden = true
      document.getElementById('cp-code-input').value = ''
      document.getElementById('cp-new-password').value = ''
      document.getElementById('cp-confirm-password').value = ''
      setMessage('cp-error-1', '')
      setMessage('cp-error-2', '')
      setMessage('cp-error-3', '')
      openModal('modal-change-password')
    }
  
    function closeCp() {
      closeModal('modal-change-password')
    }
  
    document.getElementById('btn-change-password')?.addEventListener('click', openCp)
    document.getElementById('cp-cancel-1')?.addEventListener('click', closeCp)
    document.getElementById('cp-cancel-2')?.addEventListener('click', closeCp)
    document.getElementById('cp-cancel-3')?.addEventListener('click', closeCp)
  
    // Paso 1 → enviar código
    document.getElementById('cp-send-code')?.addEventListener('click', async () => {
      const btn = document.getElementById('cp-send-code')
      btn.disabled = true
      btn.textContent = 'Enviando…'
      setMessage('cp-error-1', '')
  
      try {
        const res = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(user.email)}/solicitar-recuperacion`, {
          method: 'POST',
        })
        if (!res.ok) throw new Error('No se pudo enviar el código.')
  
        document.getElementById('cp-step-1').hidden = true
        document.getElementById('cp-step-2').hidden = false
        document.getElementById('cp-code-input')?.focus()
      } catch (err) {
        setMessage('cp-error-1', err.message || 'Error al enviar el código.', true)
      } finally {
        btn.disabled = false
        btn.textContent = 'Enviar código'
      }
    })
  
    // Paso 2 → verificar código
    document.getElementById('cp-verify-code')?.addEventListener('click', async () => {
      const code = document.getElementById('cp-code-input')?.value.trim()
      if (!code || code.length !== 6) {
        setMessage('cp-error-2', 'Introduce el código de 6 dígitos.', true)
        return
      }
  
      const btn = document.getElementById('cp-verify-code')
      btn.disabled = true
      btn.textContent = 'Verificando…'
      setMessage('cp-error-2', '')
  
      try {
        const res = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(user.email)}/validar-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: Number(code) }),
        })
        if (!res.ok) throw new Error('Código inválido o expirado.')
  
        verifiedToken = code
        document.getElementById('cp-step-2').hidden = true
        document.getElementById('cp-step-3').hidden = false
        document.getElementById('cp-new-password')?.focus()
      } catch (err) {
        setMessage('cp-error-2', err.message || 'Código incorrecto.', true)
      } finally {
        btn.disabled = false
        btn.textContent = 'Verificar'
      }
    })
  
    // Paso 3 → guardar nueva contraseña
    document.getElementById('cp-save-password')?.addEventListener('click', async () => {
      const newPass = document.getElementById('cp-new-password')?.value || ''
      const confirmPass = document.getElementById('cp-confirm-password')?.value || ''
  
      if (newPass.length < 6) {
        setMessage('cp-error-3', 'La contraseña debe tener al menos 6 caracteres.', true)
        return
      }
      if (newPass !== confirmPass) {
        setMessage('cp-error-3', 'Las contraseñas no coinciden.', true)
        return
      }
  
      const btn = document.getElementById('cp-save-password')
      btn.disabled = true
      btn.textContent = 'Guardando…'
      setMessage('cp-error-3', '')
  
      try {
        const res = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(user.email)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPass }),
        })
        if (!res.ok) throw new Error('No se pudo actualizar la contraseña.')
  
        closeCp()
        setMessage('profiles-feedback', 'Contraseña actualizada correctamente.')
      } catch (err) {
        setMessage('cp-error-3', err.message || 'Error al guardar la contraseña.', true)
      } finally {
        btn.disabled = false
        btn.textContent = 'Guardar'
      }
    })
  
    // Enter en el input del código
    document.getElementById('cp-code-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('cp-verify-code')?.click()
    })
  } 

  function bindAccountActions() {
    const logout = () => openModal('modal-logout')
    document.getElementById('btn-logout')?.addEventListener('click', logout)
    document.getElementById('btn-logout-2')?.addEventListener('click', logout)

    document.getElementById('modal-logout-cancel')?.addEventListener('click', () => closeModal('modal-logout'))
    document.getElementById('modal-logout-confirm')?.addEventListener('click', () => {
      clearSession()
      window.location.href = './landing.html'
    })

    document.getElementById('btn-delete-account')?.addEventListener('click', () => openModal('modal-delete'))
    document.getElementById('modal-delete-cancel')?.addEventListener('click', () => closeModal('modal-delete'))
    document.getElementById('modal-delete-confirm')?.addEventListener('click', async () => {
      try {
        await disableUsuario(user.email)
        clearSession()
        window.location.href = './landing.html'
      } catch (err) {
        setMessage('profiles-feedback', err.message || 'No se pudo desactivar la cuenta.', true)
      }
    })

    document.querySelectorAll('.perfil-modal__backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', () => {
        const modal = backdrop.closest('.perfil-modal')
        if (modal) closeModal(modal.id)
      })
    })

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return
      document.querySelectorAll('.perfil-modal.is-open').forEach((modal) => closeModal(modal.id))
    })

    bindPasswordChange()
  }

  async function init() {
    const stored = getStoredUser()
    if (!stored?.email) {
      window.location.href = './landing.html'
      return
    }

    try {
      const [userData, pagosData, cuentasData] = await Promise.all([
        fetchUser(stored.email),
        fetchPagos(stored.email),
        fetchCuentas(stored.email),
      ])

      user = userData
      pagos = Array.isArray(pagosData) ? pagosData : []
      cuentas = Array.isArray(cuentasData) ? cuentasData : []
    } catch {
      clearSession()
      window.location.href = './landing.html'
      return
    }

    activeProfile = getStoredProfile()
    syncStoredProfile()

    rerender()
    renderAvatarPicker()
    bindProfileActions()
    bindAccountActions()
  }

  document.addEventListener('DOMContentLoaded', init)
})()