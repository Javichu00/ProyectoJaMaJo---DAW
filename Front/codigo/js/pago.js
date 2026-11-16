(function () {


  const PLANES = {
    ANUNCIOS: { nombre: 'Plan Anuncios', precio: 6.99  },
    ESTANDAR: { nombre: 'Plan Estándar', precio: 12.99 },
    PRO:      { nombre: 'Plan Pro',      precio: 19.99 },
  }

  function init() {
    const planId = sessionStorage.getItem('planSeleccionado')
    const plan   = PLANES[planId]

    if (!planId || !plan) {
      window.location.href = './planes.html'
      return
    }

    document.getElementById('pago-plan-nombre').textContent = plan.nombre + ' · mensual'
    document.getElementById('pago-precio').textContent      = plan.precio.toFixed(2) + ' €'
    document.getElementById('pago-btn-text').textContent    = `Pagar ${plan.precio.toFixed(2)} €`

    bindInputs()
    document.getElementById('pago-btn').addEventListener('click', () => handlePago(planId, plan))
  }

  function bindInputs() {
    const cardNum = document.getElementById('card-num')
    const cardExp = document.getElementById('card-exp')

    cardNum.addEventListener('input', () => {
      const v = cardNum.value.replace(/\D/g, '').substring(0, 16)
      cardNum.value = v.replace(/(.{4})/g, '$1 ').trim()
    })

    cardExp.addEventListener('input', () => {
      let v = cardExp.value.replace(/\D/g, '').substring(0, 4)
      if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2)
      cardExp.value = v
    })

    document.querySelectorAll('.pago-field input').forEach((input) => {
      input.addEventListener('input', hideError)
    })
  }


  function validar() {
    const num  = document.getElementById('card-num').value.replace(/\s/g, '')
    const name = document.getElementById('card-name').value.trim()
    const exp  = document.getElementById('card-exp').value
    const cvv  = document.getElementById('card-cvv').value

    if (num.length < 16)                  return 'Introduce un número de tarjeta válido.'
    if (!name)                            return 'Introduce el nombre del titular.'
    if (!/^\d{2}\/\d{2}$/.test(exp))     return 'Fecha de caducidad inválida (MM/AA).'
    if (cvv.length < 3)                   return 'CVV inválido.'
    return null
  }

  async function handlePago(planId, plan) {
    const error = validar()
    if (error) { showError(error); return }

    const user = JSON.parse(localStorage.getItem('JAM_user') || 'null')
    if (!user?.email) {
      window.location.href = './landing.html'
      return
    }

    setLoading(true)
    hideError()

    try {

      const response = await fetch(`${API_BASE}/pagos/${user.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombrePlan: planId }),
      })

      console.log('STATUS:', response.status)
      const responseText = await response.text()
      console.log('BODY:', responseText)

      if (!response.ok) {
        const err = JSON.parse(responseText || '{}')
        throw new Error(err.message || 'Error al procesar el pago.')
      }

      sessionStorage.removeItem('planSeleccionado')


      try {
        const refreshedUser = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(user.email)}`).then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.json()
        })
        localStorage.setItem('JAM_user', JSON.stringify(refreshedUser))
      } catch (refreshError) {
        console.warn('[pago.js] No se pudo refrescar la cuenta después del pago:', refreshError)
      }

      try {
        await fetch(`${API_BASE}/usuarios/${encodeURIComponent(user.email)}/confirmar-pago`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: planId }),
        })
      } catch (mailError) {
        console.warn('[pago.js] No se pudo enviar el correo de confirmación:', mailError)
      }

      showSuccess()

    } catch (err) {
      showError(err.message || 'No se pudo completar el pago. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  function setLoading(loading) {
    const btn  = document.getElementById('pago-btn')
    const text = document.getElementById('pago-btn-text')
    btn.disabled = loading
    text.textContent = loading ? 'Procesando…' : `Pagar ${document.getElementById('pago-precio').textContent}`
  }

  function showError(msg) {
    const el = document.getElementById('pago-error')
    el.textContent = msg
    el.classList.add('is-visible')
  }

  function hideError() {
    const el = document.getElementById('pago-error')
    el.classList.remove('is-visible')
  }

  function showSuccess() {
    document.getElementById('pago-success').classList.add('is-visible')

    let secs = 3
    const cd = document.getElementById('pago-countdown')
    cd.textContent = `Redirigiendo en ${secs}s…`

    const iv = setInterval(() => {
      secs--
      if (secs > 0) {
        cd.textContent = `Redirigiendo en ${secs}s…`
      } else {
        clearInterval(iv)
        window.location.href = './index.html'
      }
    }, 1000)
  }

  document.addEventListener('DOMContentLoaded', init)
})()