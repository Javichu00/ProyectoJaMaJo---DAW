(function () {
  const TEMP_PROFILE_PREFIX = '__jam_profile__'

  async function solicitarVerificacion(email) {
    const response = await fetch(`${API_BASE}/usuarios/solicitar-verificacion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!response.ok) throw new Error('No se pudo enviar el código de verificación.')
  }
  
  async function verificarEmail(email, token) {
    const response = await fetch(`${API_BASE}/usuarios/verificar-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token: Number(token) }),
    })
    if (response.status === 400) throw new Error('Código inválido o expirado.')
    if (!response.ok) throw new Error('Error al verificar el código.')
  }

  async function checkEmail(email) {
    const response = await fetch(`${API_BASE}/usuarios/${email}`)
    if (response.status === 404) return false
    if (!response.ok) throw new Error('Error al comprobar el correo.')
    return true
  }

  async function login(email, password) {
    const valid = await fetch(`${API_BASE}/usuarios/${email}/${password}`)
      .then(r => r.json())
    if (!valid) throw new Error('Contraseña incorrecta.')

    const user = await fetch(`${API_BASE}/usuarios/${email}`)
      .then(r => r.json())

    if (!user.enabled) throw new Error('Esta cuenta está deshabilitada.')

    return { token: null, user }
  }

  async function register(email, password) {
    const response = await fetch(`${API_BASE}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        username: `${TEMP_PROFILE_PREFIX}${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        password,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || 'No se pudo crear la cuenta.')
    }

    const user = await response.json()
    return { token: null, user: { email: user.email } }
  }

  async function solicitarRecuperacion(email) {
    const response = await fetch(`${API_BASE}/usuarios/${email}/solicitar-recuperacion`, {
      method: 'POST',
    })
    if (!response.ok) throw new Error('No se pudo enviar el correo de recuperación.')
  }

  async function validarToken(email, token) {
    const response = await fetch(`${API_BASE}/usuarios/${email}/validar-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: Number(token) }),
    })
    if (response.status === 400) throw new Error('Código inválido o expirado.')
    if (!response.ok) throw new Error('Error al validar el código.')
  }

  async function cambiarPassword(email, nuevaPassword) {
    const response = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: nuevaPassword }),
    })
    if (!response.ok) throw new Error(`No se pudo actualizar la contraseña.`)
  }


  function saveSession(data) {
    try {
      if (data.token) localStorage.setItem('JAM_token', data.token)
      if (data.user) localStorage.setItem('JAM_user', JSON.stringify(data.user))
      localStorage.removeItem('JAM_profile')
      sessionStorage.removeItem('JAM_profile_onboarding')
    } catch {}
  }


  const ROW_CONFIG = [
    { duration: 90,  reverse: false },
    { duration: 110, reverse: true  },
    { duration: 80,  reverse: false },
    { duration: 100, reverse: true  },
  ]

  const cardWidth = 180
  const ITEMS_PER_ROW = Math.ceil(window.innerWidth / cardWidth) + 3

  function buildStreamCard(item) {
    return `
      <div class="landing-card">
        <img src="${escapeHtml(item.imagenUrl || '')}" alt="" loading="lazy" />
      </div>
    `
  }

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }

  function shuffle(array) {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  function initStreams(catalog) {
    const tracks = document.querySelectorAll('[data-landing-track]')
    if (!tracks.length || !catalog.length) return

    const shuffled = shuffle(catalog).slice(0, ITEMS_PER_ROW * 4)

    tracks.forEach((track, index) => {
      if (index >= ROW_CONFIG.length) return

      const start = (index * ITEMS_PER_ROW) % shuffled.length
      let slice = shuffled.slice(start, start + ITEMS_PER_ROW)

      if (slice.length < ITEMS_PER_ROW) {
        slice = [...slice, ...shuffled.slice(0, ITEMS_PER_ROW - slice.length)]
      }

      track.innerHTML = [...slice, ...slice].map(buildStreamCard).join('')

      if (!window.gsap) return

      const config = ROW_CONFIG[index]

      requestAnimationFrame(() => {
        const distance = track.scrollWidth / 2
        gsap.set(track, { x: config.reverse ? -distance : 0 })
        gsap.to(track, {
          x: config.reverse ? 0 : -distance,
          duration: config.duration,
          ease: 'none',
          repeat: -1,
        })
      })
    })
  }


  function showError(msg) {
    const el = document.getElementById('form-error')
    if (!el) return
    el.textContent = msg
    el.classList.add('is-visible')
  }

  function hideError() {
    const el = document.getElementById('form-error')
    if (!el) return
    el.classList.remove('is-visible')
  }

  function showSuccess(msg) {
    const el = document.getElementById('form-success')
    if (!el) return
    el.textContent = msg
    el.classList.add('is-visible')
  }

  function hideSuccess() {
    const el = document.getElementById('form-success')
    if (!el) return
    el.classList.remove('is-visible')
  }

  function setLabel(text) {
    const el = document.getElementById('form-label')
    if (el) el.textContent = text
  }

  function setButtonLoading(btnId, loading) {
    const btn = document.getElementById(btnId)
    if (!btn) return
    btn.disabled = loading
    btn.classList.toggle('is-loading', loading)
  }

  function animateIn(el) {
    if (!window.gsap || !el) return
    gsap.fromTo(
      el,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
    )
  }


  function showPasswordStep(email) {
    const stepPassword = document.getElementById('step-password')
    if (!stepPassword) return

    setLabel('Introduce tu contraseña.')
    stepPassword.classList.remove('landing-form__row--hidden')
    document.getElementById('btn-comenzar')?.classList.add('landing-form__btn--hidden')
    document.getElementById('btn-registrar')?.classList.add('landing-form__btn--hidden')
    document.getElementById('btn-entrar')?.classList.remove('landing-form__btn--hidden')
    document.getElementById('btn-recuperar')?.classList.remove('landing-form__btn--hidden')
    animateIn(stepPassword)
    document.getElementById('input-password')?.focus()
  }

async function showRegisterStep(email) {
  hideError()
  setButtonLoading('btn-comenzar', true)

  try {
    await solicitarVerificacion(email)
    setLabel('Hemos enviado un código a tu correo para verificarlo.')
    document.getElementById('btn-comenzar')?.classList.add('landing-form__btn--hidden')
    const step = document.getElementById('step-verify-register')
    step?.classList.remove('landing-form__row--hidden')
    document.getElementById('btn-verificar-registro')?.classList.remove('landing-form__btn--hidden')
    animateIn(step)
    document.getElementById('input-verify-token')?.focus()
  } catch (err) {
    showError(err.message || 'No se pudo enviar el código.')
  } finally {
    setButtonLoading('btn-comenzar', false)
  }
}

function showRegisterPasswordStep() {
  document.getElementById('step-verify-register')?.classList.add('landing-form__row--hidden')
  document.getElementById('btn-verificar-registro')?.classList.add('landing-form__btn--hidden')

  setLabel('Crea tu cuenta.')
  const stepRegister = document.getElementById('step-register')
  stepRegister?.classList.remove('landing-form__row--hidden')
  document.getElementById('btn-registrar')?.classList.remove('landing-form__btn--hidden')
  animateIn(stepRegister)
  document.getElementById('input-register-password')?.focus()
}

  function showRecoveryStep() {
    hideError()
    hideSuccess()
    setLabel('Te enviaremos un código de 6 dígitos.')

    document.getElementById('step-password')?.classList.add('landing-form__row--hidden')
    document.getElementById('step-register')?.classList.add('landing-form__row--hidden')
    document.getElementById('btn-comenzar')?.classList.add('landing-form__btn--hidden')
    document.getElementById('btn-entrar')?.classList.add('landing-form__btn--hidden')
    document.getElementById('btn-registrar')?.classList.add('landing-form__btn--hidden')
    document.getElementById('btn-recuperar')?.classList.add('landing-form__btn--hidden')

    const hint = document.getElementById('recovery-email-hint')
    if (hint) hint.textContent = document.getElementById('input-email')?.value.trim() || ''

    const stepRecovery = document.getElementById('step-recovery')
    stepRecovery?.classList.remove('landing-form__row--hidden')
    document.getElementById('btn-enviar-codigo')?.classList.remove('landing-form__btn--hidden')
    document.getElementById('btn-cancelar-recuperacion')?.classList.remove('landing-form__btn--hidden')
    animateIn(stepRecovery)
  }

  function showTokenStep() {
    hideError()
    setLabel('Revisa tu correo e introduce el código.')

    document.getElementById('step-recovery')?.classList.add('landing-form__row--hidden')
    document.getElementById('btn-enviar-codigo')?.classList.add('landing-form__btn--hidden')

    const stepToken = document.getElementById('step-token')
    stepToken?.classList.remove('landing-form__row--hidden')
    document.getElementById('btn-validar-token')?.classList.remove('landing-form__btn--hidden')
    animateIn(stepToken)
    document.getElementById('input-token')?.focus()
  }

  function showNewPasswordStep() {
    hideError()
    hideSuccess()
    setLabel('Elige tu nueva contraseña.')

    document.getElementById('step-email')?.classList.add('landing-form__row--hidden')
    document.getElementById('step-token')?.classList.add('landing-form__row--hidden')
    document.getElementById('btn-validar-token')?.classList.add('landing-form__btn--hidden')
    document.getElementById('btn-cancelar-recuperacion')?.classList.add('landing-form__btn--hidden')

    const stepNewPassword = document.getElementById('step-new-password')
    stepNewPassword?.classList.remove('landing-form__row--hidden')
    document.getElementById('btn-guardar-password')?.classList.remove('landing-form__btn--hidden')
    animateIn(stepNewPassword)
    document.getElementById('input-new-password')?.focus()
  }

  function bindForm() {
    const inputEmail        = document.getElementById('input-email')
    const inputPassword     = document.getElementById('input-password')
    const inputRegPass      = document.getElementById('input-register-password')
    const inputRegPass2     = document.getElementById('input-register-password2')
    const inputToken        = document.getElementById('input-token')
    const inputNewPassword  = document.getElementById('input-new-password')
    const inputNewPassword2 = document.getElementById('input-new-password2')

    const btnComenzar             = document.getElementById('btn-comenzar')
    const btnEntrar               = document.getElementById('btn-entrar')
    const btnRegistrar            = document.getElementById('btn-registrar')
    const btnGuest                = document.getElementById('btn-guest')
    const btnRecuperar            = document.getElementById('btn-recuperar')
    const btnEnviarCodigo         = document.getElementById('btn-enviar-codigo')
    const btnValidarToken         = document.getElementById('btn-validar-token')
    const btnGuardarPassword      = document.getElementById('btn-guardar-password')
    const btnCancelarRecuperacion = document.getElementById('btn-cancelar-recuperacion')

    let confirmedEmail = ''

    function resetSteps() {
      document.getElementById('step-email')?.classList.remove('landing-form__row--hidden')
      document.getElementById('step-password')?.classList.add('landing-form__row--hidden')
      document.getElementById('step-register')?.classList.add('landing-form__row--hidden')
      document.getElementById('step-recovery')?.classList.add('landing-form__row--hidden')
      document.getElementById('step-token')?.classList.add('landing-form__row--hidden')
      document.getElementById('step-new-password')?.classList.add('landing-form__row--hidden')
      document.getElementById('btn-comenzar')?.classList.remove('landing-form__btn--hidden')
      document.getElementById('btn-entrar')?.classList.add('landing-form__btn--hidden')
      document.getElementById('btn-registrar')?.classList.add('landing-form__btn--hidden')
      document.getElementById('btn-recuperar')?.classList.add('landing-form__btn--hidden')
      document.getElementById('btn-enviar-codigo')?.classList.add('landing-form__btn--hidden')
      document.getElementById('btn-validar-token')?.classList.add('landing-form__btn--hidden')
      document.getElementById('btn-guardar-password')?.classList.add('landing-form__btn--hidden')
      document.getElementById('btn-cancelar-recuperacion')?.classList.add('landing-form__btn--hidden')
      document.getElementById('step-verify-register')?.classList.add('landing-form__row--hidden')
document.getElementById('btn-verificar-registro')?.classList.add('landing-form__btn--hidden')
      hideSuccess()
      setLabel('Introduce tu correo para continuar.')

const inputVerifyToken = document.getElementById('input-verify-token')
const btnVerificarRegistro = document.getElementById('btn-verificar-registro')

async function handleVerificarRegistro() {
  const token = inputVerifyToken?.value.trim() || ''
  if (!/^\d{6}$/.test(token)) {
    showError('El código debe ser de 6 dígitos.')
    return
  }

  hideError()
  setButtonLoading('btn-verificar-registro', true)

  try {
    await verificarEmail(confirmedEmail, token)
    showRegisterPasswordStep()
  } catch (err) {
    showError(err.message || 'Código inválido o expirado.')
  } finally {
    setButtonLoading('btn-verificar-registro', false)
  }
}

btnVerificarRegistro?.addEventListener('click', handleVerificarRegistro)
inputVerifyToken?.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleVerificarRegistro() })
inputVerifyToken?.addEventListener('input', hideError)
    }

    async function handleEmail() {
      const email = inputEmail?.value.trim() || ''
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('Introduce un email válido.')
        return
      }

      hideError()
      resetSteps()
      setButtonLoading('btn-comenzar', true)

      try {
        const exists = await checkEmail(email)
        confirmedEmail = email
        if (exists) {
          showPasswordStep(email)
        } else {
          showRegisterStep(email)
        }
      } catch {
        showError('No se pudo comprobar el correo. Inténtalo de nuevo.')
      } finally {
        setButtonLoading('btn-comenzar', false)
      }
    }

    async function handlePassword() {
      const password = inputPassword?.value || ''
      if (!password) { showError('Introduce tu contraseña.'); return }

      hideError()
      setButtonLoading('btn-entrar', true)

      try {
        const data = await login(confirmedEmail, password)
        saveSession(data)
        if (data.user?.tipoUsuario === 'ADMIN') {
          window.location.href = './dashboard.html'
        } else {
          window.location.href = './perfiles.html'
        }
      } catch (err) {
        showError(err.message || 'Contraseña incorrecta.')
      } finally {
        setButtonLoading('btn-entrar', false)
      }
    }

    async function handleRegister() {
      const password        = inputRegPass?.value || ''
      const confirmPassword = inputRegPass2?.value || ''

      if (!password) { showError('Introduce una contraseña.'); return }
      if (password.length < 6) { showError('La contraseña debe tener al menos 6 caracteres.'); return }
      if (password !== confirmPassword) { showError('Las contraseñas no coinciden.'); return }

      hideError()
      setButtonLoading('btn-registrar', true)

      try {
        const data = await register(confirmedEmail, password)
        saveSession(data)
        sessionStorage.setItem('JAM_profile_onboarding', '1')
        window.location.href = './planes.html'
      } catch (err) {
        showError(err.message || 'No se pudo crear la cuenta. Inténtalo de nuevo.')
      } finally {
        setButtonLoading('btn-registrar', false)
      }
    }

    function handleRecuperar() {
      showRecoveryStep()
    }

    async function handleEnviarCodigo() {
      hideError()
      setButtonLoading('btn-enviar-codigo', true)

      try {
        await solicitarRecuperacion(confirmedEmail)
        showTokenStep()
        showSuccess(`Código enviado a ${confirmedEmail}.`)
      } catch (err) {
        showError(err.message || 'No se pudo enviar el código. Inténtalo de nuevo.')
      } finally {
        setButtonLoading('btn-enviar-codigo', false)
      }
    }

    async function handleValidarToken() {
      const token = inputToken?.value.trim() || ''
      if (!/^\d{6}$/.test(token)) {
        showError('El código debe ser de 6 dígitos.')
        return
      }

      hideError()
      setButtonLoading('btn-validar-token', true)

      try {
        await validarToken(confirmedEmail, token)
        showNewPasswordStep()
      } catch (err) {
        showError(err.message || 'Código inválido o expirado.')
      } finally {
        setButtonLoading('btn-validar-token', false)
      }
    }

    async function handleGuardarPassword() {
      const newPassword  = inputNewPassword?.value || ''
      const newPassword2 = inputNewPassword2?.value || ''

      if (!newPassword) { showError('Introduce una contraseña.'); return }
      if (newPassword.length < 6) { showError('La contraseña debe tener al menos 6 caracteres.'); return }
      if (newPassword !== newPassword2) { showError('Las contraseñas no coinciden.'); return }

      hideError()
      setButtonLoading('btn-guardar-password', true)

      try {
        await cambiarPassword(confirmedEmail, newPassword)
        const data = await login(confirmedEmail, newPassword)
        saveSession(data)
        if (data.user?.tipoUsuario === 'ADMIN') {
          window.location.href = './dashboard.html'
        } else {
          window.location.href = './perfiles.html'
        }
      } catch (err) {
        showError(err.message || 'No se pudo cambiar la contraseña.')
      } finally {
        setButtonLoading('btn-guardar-password', false)
      }
    }

    function handleCancelarRecuperacion() {
      resetSteps()
      showPasswordStep(confirmedEmail)
    }

    function handleGuest() {
      window.location.href = './index.html'
    }

    btnComenzar?.addEventListener('click', handleEmail)
    btnEntrar?.addEventListener('click', handlePassword)
    btnRegistrar?.addEventListener('click', handleRegister)
    btnGuest?.addEventListener('click', handleGuest)
    btnRecuperar?.addEventListener('click', handleRecuperar)
    btnEnviarCodigo?.addEventListener('click', handleEnviarCodigo)
    btnValidarToken?.addEventListener('click', handleValidarToken)
    btnGuardarPassword?.addEventListener('click', handleGuardarPassword)
    btnCancelarRecuperacion?.addEventListener('click', handleCancelarRecuperacion)

    inputEmail?.addEventListener('keydown',        (e) => { if (e.key === 'Enter') handleEmail() })
    inputPassword?.addEventListener('keydown',     (e) => { if (e.key === 'Enter') handlePassword() })
    inputRegPass?.addEventListener('keydown',      (e) => { if (e.key === 'Enter') handleRegister() })
    inputRegPass2?.addEventListener('keydown',     (e) => { if (e.key === 'Enter') handleRegister() })
    inputToken?.addEventListener('keydown',        (e) => { if (e.key === 'Enter') handleValidarToken() })
    inputNewPassword?.addEventListener('keydown',  (e) => { if (e.key === 'Enter') handleGuardarPassword() })
    inputNewPassword2?.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleGuardarPassword() })

    inputEmail?.addEventListener('input', hideError)
    inputEmail?.addEventListener('input', () => {
      const nextEmail = inputEmail.value.trim()
      if (confirmedEmail && nextEmail !== confirmedEmail) {
        confirmedEmail = ''
        resetSteps()
      }
    })
    inputPassword?.addEventListener('input',     hideError)
    inputRegPass?.addEventListener('input',      hideError)
    inputRegPass2?.addEventListener('input',     hideError)
    inputToken?.addEventListener('input',        hideError)
    inputNewPassword?.addEventListener('input',  hideError)
    inputNewPassword2?.addEventListener('input', hideError)
  }

  async function init() {
    bindForm()

    try {
      const response = await fetch(`${API_BASE}/contenidos/top/votados`)
      if (!response.ok) throw new Error()
      const data = await response.json()
      const withImage = (Array.isArray(data) ? data : []).filter((item) => item.imagenUrl)
      initStreams(withImage)
    } catch {
      // Sin API: fondo vacío, la página sigue funcionando.
    }
  }

  document.addEventListener('DOMContentLoaded', init)
})()