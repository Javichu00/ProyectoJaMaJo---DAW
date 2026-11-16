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
  let activeProfile = null
  let modalMode = 'create'
  let editingCuentaId = null
  let selectedAvatar = 1
  let forceOnboarding = false

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
    if (!cuenta) return
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
    localStorage.removeItem('JAM_token')
    localStorage.removeItem('JAM_user')
    localStorage.removeItem('JAM_profile')
    localStorage.removeItem('JAM_plan')
    sessionStorage.removeItem('JAM_profile_onboarding')
    sessionStorage.removeItem('planSeleccionado')
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
    if (!clean) return 'J'
    const parts = clean.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return clean.slice(0, 2).toUpperCase()
  }

  function getPlanLimit(planName) {
    return PLAN_LIMITS[planName] || 1
  }

  function setError(id, message) {
    const node = document.getElementById(id)
    if (!node) return
    if (!message) {
      node.hidden = true
      node.textContent = ''
      return
    }
    node.hidden = false
    node.textContent = message
  }

  async function fetchUser(email) {
    const response = await fetch(`${API_BASE}/usuarios/${email}`)
    if (!response.ok) throw new Error('No se pudo cargar la cuenta.')
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
      throw new Error(err.message || 'No se pudo guardar el perfil.')
    }

    return response.json()
  }

  function syncStoredProfile() {
    const stored = getStoredProfile()

    if (!stored?.idCuenta || stored?.email !== user.email) {
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

  function renderAvatarPicker() {
    const picker = document.getElementById('profiles-avatar-picker')
    if (!picker) return

    picker.innerHTML = AVATAR_OPTIONS.map((idFoto) => {
      const selectedClass = idFoto === selectedAvatar ? ' is-selected' : ''
      return `
        <button class="profiles-avatar-chip${selectedClass}" type="button" data-avatar-option="${idFoto}">
          <img class="profiles-avatar-chip__preview" src="../../multimedia/AvataresCuentas/Perfil${idFoto}.png" alt="Avatar ${idFoto}" />
          <span class="profiles-avatar-chip__label">Avatar ${idFoto}</span>
        </button>
      `
    }).join('')
  }

  function renderProfiles() {
    const grid = document.getElementById('profiles-grid')
    const title = document.getElementById('profiles-title')
    const subtitle = document.getElementById('profiles-subtitle')
    const status = document.getElementById('profiles-status')
    const email = document.getElementById('profiles-account-email')

    if (!grid || !title || !subtitle || !status || !email) return

    const planName = user?.nombrePlan || 'GRATIS'
    const limit = getPlanLimit(planName)

    email.textContent = user?.email || 'Cuenta principal'
    title.textContent = forceOnboarding ? 'Crea tu primer perfil' : 'Quien esta viendo JAM?'
    subtitle.textContent = forceOnboarding
      ? 'Elige nombre y avatar para completar la cuenta antes de entrar.'
      : 'Selecciona un perfil para entrar en JAM o crea uno nuevo si tu plan lo permite.'
    status.textContent = `${cuentas.length} de ${limit} perfiles disponibles con el plan ${planName}.`

    const cards = cuentas.map((cuenta) => {
      const visibleName = getVisibleProfileName(cuenta)
      const isActive = Number(activeProfile?.idCuenta) === Number(cuenta.idCuenta)
      const isPending = isTemporaryProfileName(cuenta.username)
      const action = isPending ? 'setup' : 'select'
      const meta = isPending ? 'Completa este perfil' : isActive ? 'Perfil en uso' : 'Entrar con este perfil'

      return `
        <button
          class="profiles-card${isActive ? ' is-active' : ''}${isPending ? ' is-locked' : ''}"
          type="button"
          data-profile-action="${action}"
          data-profile-id="${cuenta.idCuenta}"
        >
          <img class="profiles-avatar" src="../../multimedia/AvataresCuentas/Perfil${cuenta.idFoto || 1}.png" alt="Avatar ${cuenta.idFoto || 1}" />
          <h2 class="profiles-card__name">${visibleName}</h2>
          <p class="profiles-card__meta">${meta}</p>
          ${isActive ? '<span class="profiles-card__pill">Activo</span>' : ''}
        </button>
      `
    })

    const canCreate = cuentas.length < limit && !forceOnboarding
    const addCard = canCreate
      ? `
        <button class="profiles-add-card" type="button" data-profile-action="create">
          <span class="profiles-add-card__icon">+</span>
          <h2 class="profiles-add-card__title">Nuevo perfil</h2>
          <p class="profiles-add-card__meta">Disponible en este plan</p>
        </button>
      `
      : ''

    grid.innerHTML = cards.join('') + addCard
  }

  function openModal(options = {}) {
    const modal = document.getElementById('profiles-modal')
    const title = document.getElementById('profiles-modal-title')
    const desc = document.getElementById('profiles-modal-desc')
    const eyebrow = document.getElementById('profiles-modal-eyebrow')
    const input = document.getElementById('profiles-modal-name')
    const cancel = document.getElementById('profiles-modal-cancel')
    const confirm = document.getElementById('profiles-modal-confirm')

    if (!modal || !title || !desc || !eyebrow || !input || !cancel || !confirm) return

    modalMode = options.mode || 'create'
    editingCuentaId = options.cuenta?.idCuenta ?? null
    selectedAvatar = options.cuenta?.idFoto || 1

    if (modalMode === 'setup') {
      eyebrow.textContent = 'Primer perfil'
      title.textContent = 'Termina tu perfil'
      desc.textContent = 'Antes de entrar, elige el nombre visible y el avatar del perfil.'
      confirm.textContent = 'Entrar'
      cancel.hidden = true
    } else if (modalMode === 'edit') {
      eyebrow.textContent = 'Editar perfil'
      title.textContent = 'Actualiza este perfil'
      desc.textContent = 'Cambia el nombre visible o el avatar del perfil.'
      confirm.textContent = 'Guardar'
      cancel.hidden = false
    } else {
      eyebrow.textContent = 'Nuevo perfil'
      title.textContent = 'Crea un perfil nuevo'
      desc.textContent = 'Anade otro perfil a esta cuenta dentro del limite de tu plan.'
      confirm.textContent = 'Crear perfil'
      cancel.hidden = false
    }

    const currentName = options.cuenta?.username || ''
    input.value = isTemporaryProfileName(currentName) ? '' : currentName
    renderAvatarPicker()
    setError('profiles-modal-error', '')

    modal.classList.add('is-open')
    document.body.classList.add('is-locked')
    input.focus()
  }

  function closeModal() {
    const modal = document.getElementById('profiles-modal')
    if (!modal) return
    modal.classList.remove('is-open')
    document.body.classList.remove('is-locked')
  }

  async function reloadProfiles() {
    cuentas = await fetchCuentas(user.email)
    syncStoredProfile()
    renderProfiles()
  }

  async function handleSaveProfile() {
    const input = document.getElementById('profiles-modal-name')
    const name = input?.value.trim() || ''

    if (!name) {
      setError('profiles-modal-error', 'Introduce el nombre del perfil.')
      return
    }

    try {
      if (modalMode === 'setup' || modalMode === 'edit') {
        await updateCuenta(editingCuentaId, { username: name, idFoto: selectedAvatar })
      } else {
        await createCuenta(user.email, { username: name, idFoto: selectedAvatar })
      }

      await reloadProfiles()

      const target =
        modalMode === 'create'
          ? cuentas.find((cuenta) => cuenta.username === name && Number(cuenta.idFoto || 1) === Number(selectedAvatar))
          : cuentas.find((cuenta) => Number(cuenta.idCuenta) === Number(editingCuentaId))

      if (modalMode === 'setup') {
        if (target) saveActiveProfile(target)
        sessionStorage.removeItem('JAM_profile_onboarding')
        window.location.href = './index.html'
        return
      }

      if (target && Number(activeProfile?.idCuenta) === Number(target.idCuenta)) {
        saveActiveProfile(target)
      }

      closeModal()
      renderProfiles()
      setError('profiles-error', '')
    } catch (error) {
      setError('profiles-modal-error', error.message || 'No se pudo guardar el perfil.')
    }
  }

  function selectProfile(idCuenta) {
    const cuenta = cuentas.find((item) => Number(item.idCuenta) === Number(idCuenta))
    if (!cuenta) return

    if (isTemporaryProfileName(cuenta.username)) {
      openModal({ mode: 'setup', cuenta })
      return
    }

    saveActiveProfile(cuenta)
    sessionStorage.removeItem('JAM_profile_onboarding')
    window.location.href = './index.html'
  }

  function bindEvents() {
    document.getElementById('profiles-grid')?.addEventListener('click', (event) => {
      const action = event.target.closest('[data-profile-action]')?.dataset.profileAction
      const profileId = event.target.closest('[data-profile-id]')?.dataset.profileId

      if (action === 'create') {
        openModal({ mode: 'create' })
        return
      }

      if (action === 'setup' && profileId) {
        const cuenta = cuentas.find((item) => Number(item.idCuenta) === Number(profileId))
        if (cuenta) openModal({ mode: 'setup', cuenta })
        return
      }

      if (action === 'select' && profileId) {
        selectProfile(profileId)
      }
    })

    document.getElementById('profiles-avatar-picker')?.addEventListener('click', (event) => {
      const option = event.target.closest('[data-avatar-option]')?.dataset.avatarOption
      if (!option) return
      selectedAvatar = Number(option)
      renderAvatarPicker()
    })

    document.getElementById('profiles-modal-cancel')?.addEventListener('click', closeModal)
    document.getElementById('profiles-modal-confirm')?.addEventListener('click', handleSaveProfile)
    document.querySelector('.profiles-modal__backdrop')?.addEventListener('click', () => {
      if (!forceOnboarding) closeModal()
    })
    document.getElementById('profiles-logout')?.addEventListener('click', () => {
      clearSession()
      window.location.href = './landing.html'
    })
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !forceOnboarding) {
        closeModal()
      }
    })
  }

  async function init() {
    const storedUser = getStoredUser()
    if (!storedUser?.email) {
      window.location.href = './landing.html'
      return
    }

    try {
      const [userData, cuentasData] = await Promise.all([
        fetchUser(storedUser.email),
        fetchCuentas(storedUser.email),
      ])

      user = userData
      cuentas = Array.isArray(cuentasData) ? cuentasData : []
    } catch {
      clearSession()
      window.location.href = './landing.html'
      return
    }

    activeProfile = getStoredProfile()
    syncStoredProfile()

    const query = new URLSearchParams(window.location.search)
    const hasPendingProfile = cuentas.some((cuenta) => isTemporaryProfileName(cuenta.username))
    forceOnboarding =
      query.get('setup') === '1' ||
      sessionStorage.getItem('JAM_profile_onboarding') === '1' ||
      hasPendingProfile

    renderProfiles()
    bindEvents()

    if (forceOnboarding) {
      const pending = cuentas.find((cuenta) => isTemporaryProfileName(cuenta.username)) || cuentas[0]
      if (pending) openModal({ mode: 'setup', cuenta: pending })
    }
  }

  document.addEventListener('DOMContentLoaded', init)
})()
