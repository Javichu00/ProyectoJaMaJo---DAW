;(function () {

  const esc = (window.JAM && window.JAM.escapeHtml) || ((v) => String(v ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#39;'))

    function badge(type) {
      const map = {
        true:      ['ok',   'Activo'],
        false:     ['err',  'Inactivo'],
        ADMIN:     ['gold', 'Admin'],
        CLIENTE:   ['info', 'Cliente'],
        GRATIS:    ['info', 'Gratis'],
        ANUNCIOS:  ['warn', 'Anuncios'],
        ESTANDAR:  ['up',   'Estándar'],
        PRO:       ['gold', 'Pro'],
      }
      const [mod, label] = map[String(type)] ?? ['info', String(type)]
      return `<span class="dash-badge dash-badge--${mod}">${esc(label)}</span>`
    }

  function avatar(name) {
    return `<div class="dash-avatar">${esc(String(name || '?').charAt(0).toUpperCase())}</div>`
  }

  function fmt(date) {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' })
  }

  function money(amount) {
    return Number(amount || 0).toLocaleString('es-ES', { style:'currency', currency:'EUR' })
  }

  function loading() {
    return `<div style="padding:3rem;text-align:center;opacity:.4;font-size:.875rem;">Cargando…</div>`
  }

  function errorMsg(msg) {
    return `<div style="padding:2rem;text-align:center;color:#ef4444;font-size:.875rem;">${esc(msg)}</div>`
  }

  function toast(msg, type = 'ok') {
    const colors = { ok: '#4ade80', err: '#f87171', info: 'var(--mist-deep)' }
    const t = document.createElement('div')
    t.style.cssText = `
      position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;
      padding:.75rem 1.25rem;border-radius:1rem;font-size:.82rem;font-weight:600;
      background:rgba(32,33,38,.98);border:1px solid rgba(204,211,217,.16);
      color:${colors[type] || colors.info};
      box-shadow:0 12px 32px rgba(0,0,0,.5);
    `
    t.textContent = msg
    document.body.appendChild(t)
    setTimeout(() => t.remove(), 3000)
  }


  let _modalResolve = null

  function openModal(title, bodyHtml, confirmLabel = 'Confirmar', danger = false) {
    return new Promise(resolve => {
      _modalResolve = resolve
      const m = document.getElementById('dashGenericModal')
      m.querySelector('.dash-modal-head h3').textContent = title
      m.querySelector('.dash-modal-body').innerHTML = bodyHtml
      const btn = m.querySelector('.dash-modal-confirm')
      btn.textContent = confirmLabel
      btn.className = `dash-btn ${danger ? 'dash-btn--danger' : 'dash-btn--primary'} dash-modal-confirm`
      m.classList.add('active')
    })
  }

  function closeModal(val) {
    document.getElementById('dashGenericModal').classList.remove('active')
    if (_modalResolve) { _modalResolve(val); _modalResolve = null }
  }


  function bindNav() {
    document.querySelectorAll('.dash-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.dash-nav-item').forEach(n => n.classList.remove('active'))
        item.classList.add('active')
        loadSection(item.dataset.section)
      })
    })
  }

  function loadSection(section) {
    const content = document.getElementById('dash-content')
    if (!content) return
    content.innerHTML = loading()
    const map = { usuarios: sectionUsuarios, pagos: sectionPagos, planes: sectionPlanes }
    const fn = map[section]
    if (fn) fn(content)
  }

  async function sectionUsuarios(content) {
    try {
      const usuarios = await fetch(`${API_BASE}/usuarios`).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })

      usuarios.sort((a, b) => new Date(b.fechaRegistro || 0) - new Date(a.fechaRegistro || 0))

      const rows = usuarios.map(u => `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:.6rem">
              ${avatar(u.email)}
              <div style="font-size:.72rem;opacity:.7">${esc(u.email)}</div>
            </div>
          </td>
          <td>${badge(u.enabled)}</td>
          <td>${badge(u.tipoUsuario || 'CLIENTE')}</td>
          <td>${badge(u.nombrePlan || 'GRATIS')}</td>
          <td style="opacity:.6;font-size:.8rem">${fmt(u.fechaRegistro)}</td>
          <td>
            <div style="display:flex;gap:.4rem;flex-wrap:wrap">
              <button class="dash-btn dash-btn--sm dash-btn--secondary"
                onclick="dashVerUsuario('${esc(u.email)}')">
                Ver
              </button>
              <button class="dash-btn dash-btn--sm ${u.enabled ? 'dash-btn--danger' : 'dash-btn--success'}"
                onclick="dashDeleteUser('${esc(u.email)}', ${u.enabled})">
                ${u.enabled ? 'Eliminar' : 'Habilitar'}
              </button>
            </div>
          </td>
        </tr>
      `).join('')

      content.innerHTML = `
        <div class="dash-section">
          <div class="dash-section-head" style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:1rem">
            <div>
              <div class="eyebrow">Gestión</div>
              <h2>Usuarios</h2>
              <p>${usuarios.length} usuario${usuarios.length !== 1 ? 's' : ''} registrados</p>
            </div>
            <button class="dash-btn dash-btn--primary" onclick="dashCrearUsuario()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              Nuevo usuario
            </button>
          </div>
          <div class="dash-table-wrap" style="margin-top:1rem">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th><th>Estado</th><th>Rol</th><th>Plan</th><th>Registro</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      `
    } catch (err) {
      content.innerHTML = errorMsg('No se pudieron cargar los usuarios: ' + err.message)
    }
  }

  window.dashVerUsuario = async function(email) {
    openModal(`Detalle: ${email}`,
      `<div style="padding:1rem;text-align:center;opacity:.4;font-size:.82rem">Cargando…</div>`,
      'Cerrar', false).then(() => {})

    try {
      const [usuario, cuentas] = await Promise.all([
        fetch(`${API_BASE}/usuarios/${encodeURIComponent(email)}`).then(r => r.json()),
        fetch(`${API_BASE}/cuentas/${encodeURIComponent(email)}`).then(r => r.ok ? r.json() : []),
      ])

      const cuentasRows = (Array.isArray(cuentas) ? cuentas : []).map(c => `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:.65rem 0;border-bottom:1px solid rgba(204,211,217,.08)">
          <div style="display:flex;align-items:center;gap:.6rem">
            ${c.foto
              ? `<img src="${esc(c.foto)}" style="width:32px;height:32px;border-radius:50%;object-fit:cover">`
              : avatar(c.username || c.nombre)}
            <span style="font-size:.875rem;font-weight:500">${esc(c.username || c.nombre || '—')}</span>
          </div>
          <button class="dash-btn dash-btn--sm dash-btn--danger"
            onclick="dashDeleteCuenta(${c.idCuenta}, '${esc(email)}')">
            Eliminar
          </button>
        </div>
      `).join('') || '<p style="opacity:.4;font-size:.82rem;margin:0">Sin cuentas</p>'

      document.querySelector('#dashGenericModal .dash-modal-body').innerHTML = `
        <div style="display:grid;gap:1.25rem">

          <!-- Info básica -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">
            <div class="dash-stat" style="padding:.9rem">
              <div class="dash-stat-label">Email</div>
              <div style="font-size:.78rem;color:var(--mist-deep);margin-top:.2rem;word-break:break-all">${esc(usuario.email || email)}</div>
            </div>
            <div class="dash-stat" style="padding:.9rem">
              <div class="dash-stat-label">Plan actual</div>
              <div style="margin-top:.3rem">${badge(usuario.nombrePlan || 'GRATIS')}</div>
            </div>
            <div class="dash-stat" style="padding:.9rem">
              <div class="dash-stat-label">Estado</div>
              <div style="margin-top:.3rem">${badge(usuario.enabled)}</div>
            </div>
            <div class="dash-stat" style="padding:.9rem">
              <div class="dash-stat-label">Registro</div>
              <div style="font-size:.82rem;color:var(--mist-deep);margin-top:.2rem">${fmt(usuario.fechaRegistro)}</div>
            </div>
          </div>

          <!-- Cambiar contraseña -->
          <div>
            <div class="eyebrow" style="margin-bottom:.6rem">Cambiar contraseña</div>
            <div style="display:flex;gap:.5rem">
              <input class="dash-input" id="newPassInput" type="password" placeholder="Nueva contraseña" style="flex:1" />
              <button class="dash-btn dash-btn--secondary" onclick="dashCambiarPassword('${esc(email)}')">
                Guardar
              </button>
            </div>
          </div>

          <!-- Cuentas -->
          <div>
            <div class="eyebrow" style="margin-bottom:.6rem">Cuentas (${Array.isArray(cuentas) ? cuentas.length : 0})</div>
            ${cuentasRows}
          </div>

          <!-- Cambiar plan -->
          <div>
            <div class="eyebrow" style="margin-bottom:.6rem">Cambiar plan</div>
            <div style="display:flex;gap:.5rem;flex-wrap:wrap">
              ${['GRATIS','ANUNCIOS','ESTANDAR','PRO'].map(p => `
                <button class="dash-btn dash-btn--sm ${(usuario.nombrePlan||'GRATIS')===p ? 'dash-btn--primary' : 'dash-btn--secondary'}"
                  onclick="dashCambiarPlan('${esc(email)}', '${p}')">
                  ${p.charAt(0)+p.slice(1).toLowerCase()}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Cambiar rol -->
          <div>
            <div class="eyebrow" style="margin-bottom:.6rem">Rol</div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:.75rem;background:rgba(204,211,217,.04);border-radius:var(--radius-md)">
              <div>
                <div style="font-size:.875rem;font-weight:600;color:var(--mist-deep)">${esc(usuario.tipoUsuario || 'CLIENTE')}</div>
                <div style="font-size:.72rem;opacity:.5;margin-top:.2rem">${usuario.tipoUsuario === 'ADMIN' ? 'Acceso total al dashboard' : 'Acceso estándar de usuario'}</div>
              </div>
              <button class="dash-btn dash-btn--sm ${usuario.tipoUsuario === 'ADMIN' ? 'dash-btn--danger' : 'dash-btn--secondary'}"
                onclick="dashToggleRol('${esc(usuario.email || email)}', '${esc(usuario.tipoUsuario || 'CLIENTE')}')">
                ${usuario.tipoUsuario === 'ADMIN' ? 'Quitar admin' : 'Hacer admin'}
              </button>
            </div>
          </div>

        </div>
      `
    } catch(err) {
      document.querySelector('#dashGenericModal .dash-modal-body').innerHTML =
        errorMsg('Error cargando detalle: ' + err.message)
    }
  }

  window.dashCambiarPassword = async function(email) {
    const pass = document.getElementById('newPassInput')?.value?.trim()
    if (!pass) return toast('Introduce una contraseña', 'err')
    try {
      const r = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      document.getElementById('newPassInput').value = ''
      toast('Contraseña actualizada', 'ok')
    } catch (err) {
      toast('Error: ' + err.message, 'err')
    }
  }
  window.dashDeleteUser = async function(email, currentEnabled) {
    if (currentEnabled) {
      const confirmed = await openModal(
        'Deshabilitar usuario',
        `<p style="color:rgba(204,211,217,.78);line-height:1.7">
          ¿Deshabilitar a <strong style="color:var(--mist-deep)">${esc(email)}</strong>?<br>
          <span style="font-size:.8rem;opacity:.6">Sus listas y pagos se conservan.</span>
        </p>`,
        'Sí, deshabilitar', true
      )
      if (!confirmed) return
      try {
        const r = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(email)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: false })
        })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        toast('Usuario deshabilitado', 'ok')
        loadSection('usuarios')
      } catch (err) {
        toast('Error: ' + err.message, 'err')
      }
    } else {
      try {
        const r = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(email)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: true })
        })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        toast('Usuario habilitado', 'ok')
        loadSection('usuarios')
      } catch (err) {
        toast('Error: ' + err.message, 'err')
      }
    }
  }

  window.dashToggleRol = async function(email, currentRol) {
    const nuevoRol = currentRol === 'ADMIN' ? 'CLIENTE' : 'ADMIN'
    const confirmed = await openModal(
      'Cambiar rol',
      `<p style="color:rgba(204,211,217,.78);line-height:1.7">
        ¿Cambiar el rol de <strong style="color:var(--mist-deep)">${esc(email)}</strong> a <strong style="color:var(--mist-deep)">${nuevoRol}</strong>?
      </p>`,
      'Confirmar', false
    )
    if (!confirmed) return
    try {
      const r = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoUsuario: nuevoRol })
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      toast(`Rol cambiado a ${nuevoRol}`, 'ok')
      dashVerUsuario(email)
    } catch (err) {
      toast('Error: ' + err.message, 'err')
    }
  }

  window.dashCrearUsuario = async function() {
    const confirmed = await openModal(
      'Nuevo usuario',
      `<div class="dash-input-group">
        <label>Email</label>
        <input class="dash-input" id="newEmail" type="email" placeholder="usuario@ejemplo.com" />
      </div>
      <div class="dash-input-group">
        <label>Contraseña</label>
        <input class="dash-input" id="newPassword" type="password" placeholder="Contraseña" />
      </div>`,
      'Crear usuario', false
    )
    if (!confirmed) return
    const email    = document.getElementById('newEmail')?.value?.trim()
    const password = document.getElementById('newPassword')?.value?.trim()
    if (!email || !password) return toast('Email y contraseña son obligatorios', 'err')
    try {
      const r = await fetch(`${API_BASE}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      toast('Usuario creado correctamente', 'ok')
      loadSection('usuarios')
    } catch (err) {
      toast('Error al crear: ' + err.message, 'err')
    }
  }

  window.dashDeleteCuenta = async function(idCuenta, email) {
    const confirmed = await openModal(
      'Eliminar cuenta',
      `<p style="color:rgba(204,211,217,.78);line-height:1.7;margin-bottom:1rem">
        Introduce la contraseña de <strong style="color:var(--mist-deep)">${esc(email)}</strong>:
      </p>
      <div class="dash-input-group">
        <label>Contraseña</label>
        <input class="dash-input" id="deleteCuentaPass" type="password" placeholder="Contraseña del usuario" />
      </div>`,
      'Eliminar cuenta', true
    )
    if (!confirmed) return
    const password = document.getElementById('deleteCuentaPass')?.value?.trim()
    if (!password) return toast('La contraseña es obligatoria', 'err')
    try {
      const r = await fetch(`${API_BASE}/cuentas/${idCuenta}?password=${encodeURIComponent(password)}`, { method: 'DELETE' })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      toast('Cuenta eliminada', 'ok')
      dashVerUsuario(email)
    } catch (err) {
      toast('Error: ' + err.message, 'err')
    }
  }

  window.dashCambiarPlan = async function(email, plan) {
    try {
      const planData = await fetch(`${API_BASE}/planes/${plan}`).then(r => r.json())
      const r = await fetch(`${API_BASE}/pagos/${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombrePlan: plan, importe: planData.precio ?? 0 })
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      toast(`Plan cambiado a ${plan}`, 'ok')
      dashVerUsuario(email)
    } catch (err) {
      toast('Error al cambiar plan: ' + err.message, 'err')
    }
  }

  async function sectionPagos(content) {
    try {
      const usuarios = await fetch(`${API_BASE}/usuarios`).then(r => r.json())
  
      const pagosPromises = usuarios.map(u =>
        fetch(`${API_BASE}/pagos/${encodeURIComponent(u.email)}`)
          .then(r => r.ok ? r.json() : [])
          .then(pagos => (Array.isArray(pagos) ? pagos : []).map(p => ({
            ...p, emailUsuario: u.email
          })))
          .catch(() => [])
      )
  
      const allPagos = (await Promise.all(pagosPromises)).flat()
        .sort((a, b) => new Date(b.fecha || b.fechaPago || 0) - new Date(a.fecha || a.fechaPago || 0))
  
      const total = allPagos.reduce((s, p) => s + Number(p.importe || 0), 0)
  
      const porUsuario = {}
      allPagos.forEach(p => {
        if (!porUsuario[p.emailUsuario]) porUsuario[p.emailUsuario] = { count: 0, total: 0 }
        porUsuario[p.emailUsuario].count++
        porUsuario[p.emailUsuario].total += Number(p.importe || 0)
      })
      const topUsuario = Object.entries(porUsuario).sort((a,b) => b[1].total - a[1].total)[0]
  
      const rows = allPagos.length
        ? allPagos.map(p => `
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:.6rem">
                ${avatar(p.emailUsuario)}
                <div style="font-size:.72rem;opacity:.7">${esc(p.emailUsuario)}</div>
              </div>
            </td>
            <td>${badge(p.plan || p.nombrePlan || '—')}</td>
            <td style="font-weight:700;color:var(--mist-deep)">${money(p.importe)}</td>
            <td style="opacity:.6;font-size:.8rem">${fmt(p.fecha || p.fechaPago)}</td>
          </tr>
        `).join('')
        : `<tr><td colspan="4" style="text-align:center;opacity:.4;padding:2rem">Sin pagos registrados</td></tr>`
  
      content.innerHTML = `
        <div class="dash-section">
          <div class="dash-section-head">
            <div class="eyebrow">Historial</div>
            <h2>Pagos</h2>
            <p>${allPagos.length} pago${allPagos.length !== 1 ? 's' : ''} · Total: <strong style="color:var(--mist-deep)">${money(total)}</strong></p>
          </div>
  
          <div class="dash-grid dash-grid-3" style="margin-bottom:1rem">
            <div class="dash-stat">
              <div class="dash-stat-label">Total recaudado</div>
              <div class="dash-stat-value">${money(total)}</div>
            </div>
            <div class="dash-stat">
              <div class="dash-stat-label">Nº de pagos</div>
              <div class="dash-stat-value">${allPagos.length}</div>
            </div>
            <div class="dash-stat">
              <div class="dash-stat-label">Mayor cliente</div>
              <div class="dash-stat-value" style="font-size:.95rem;word-break:break-all">
                ${topUsuario ? esc(topUsuario[0]) : '—'}
              </div>
              ${topUsuario ? `<div style="font-size:.75rem;opacity:.5;margin-top:.2rem">${money(topUsuario[1].total)} · ${topUsuario[1].count} pago${topUsuario[1].count!==1?'s':''}</div>` : ''}
            </div>
          </div>
  
          <div class="dash-table-wrap">
            <table>
              <thead>
                <tr><th>Usuario</th><th>Plan</th><th>Importe</th><th>Fecha</th></tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      `
    } catch (err) {
      content.innerHTML = errorMsg('No se pudieron cargar los pagos: ' + err.message)
    }
  }


  window.dashRegistrarPago = async function(emailPrefill) {

    const planes = await fetch(`${API_BASE}/planes`).then(r => r.json()).catch(() => [])
    const opcionesPlanes = planes.map(p => `
      <option value="${esc(p.nombrePlan || p.nombre)}" data-precio="${p.precio ?? 0}">
        ${esc(p.nombrePlan || p.nombre)} — ${Number(p.precio || 0).toLocaleString('es-ES', { style:'currency', currency:'EUR' })}
      </option>
    `).join('')
  
    const confirmed = await openModal(
      'Registrar pago',
      `<div class="dash-input-group">
        <label>Email del usuario</label>
        <input class="dash-input" id="pagoEmail" type="email" value="${esc(emailPrefill)}" placeholder="usuario@ejemplo.com" />
      </div>
      <div class="dash-input-group">
        <label>Plan</label>
        <select class="dash-input" id="pagoPlan">
          ${opcionesPlanes}
        </select>
      </div>`,
      'Registrar', false
    )
    if (!confirmed) return
  
    const email = document.getElementById('pagoEmail')?.value?.trim()
    const select = document.getElementById('pagoPlan')
    const plan = select?.value
    const importe = parseFloat(select?.selectedOptions[0]?.dataset.precio || 0)
  
    if (!email) return toast('El email es obligatorio', 'err')
  
    try {
      const r = await fetch(`${API_BASE}/pagos/${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombrePlan: plan, importe })
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      toast('Pago registrado correctamente', 'ok')
      loadSection('pagos')
    } catch (err) {
      toast('Error al registrar pago: ' + err.message, 'err')
    }
  }


  async function sectionPlanes(content) {
    try {
      const [planes, usuarios] = await Promise.all([
        fetch(`${API_BASE}/planes`).then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.json()
        }),
        fetch(`${API_BASE}/usuarios`).then(r => r.ok ? r.json() : []),
      ])

      const conteo = {}
      usuarios.forEach(u => {
        const p = u.nombrePlan || 'GRATIS'
        conteo[p] = (conteo[p] || 0) + 1
      })

      const cards = planes.map(p => {
        const nombre = p.nombrePlan || p.nombre || '—'
        const count  = conteo[nombre] || 0
        return `
          <div class="dash-stat" style="border-left:3px solid var(--mist-deep)">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.75rem">
              <div>
                <div class="eyebrow" style="margin-bottom:.3rem">${esc(nombre)}</div>
                <div style="font-size:2rem;font-weight:700;letter-spacing:-0.04em;color:var(--mist-deep)">
                  ${p.precio != null ? money(p.precio) : '—'}
                  <span style="font-size:.875rem;font-weight:400;opacity:.5">/mes</span>
                </div>
              </div>
              ${badge(nombre)}
            </div>
            ${p.descripcion ? `<p style="font-size:.82rem;opacity:.6;line-height:1.6;margin-bottom:.75rem">${esc(p.descripcion)}</p>` : ''}
            <div style="font-size:.75rem;opacity:.5;border-top:1px solid rgba(204,211,217,.1);padding-top:.75rem;margin-bottom:.75rem">
              ${p.maxPerfiles != null ? `Hasta ${p.maxPerfiles} perfil${p.maxPerfiles !== 1 ? 'es' : ''}` : ''}
              ${p.conAnuncios != null ? ` · ${p.conAnuncios ? 'Con anuncios' : 'Sin anuncios'}` : ''}
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:.75rem;color:rgba(204,211,217,.5)">${count} usuario${count!==1?'s':''}</span>
              <button class="dash-btn dash-btn--sm dash-btn--secondary"
                onclick="dashEditarPlan('${esc(nombre)}', ${p.precio ?? 0})">
                Editar precio
              </button>
            </div>
          </div>
        `
      }).join('')

      const totalUsuarios = usuarios.length
      const ingresos = planes.reduce((s, p) => s + (p.precio || 0) * (conteo[p.nombrePlan || p.nombre] || 0), 0)

      content.innerHTML = `
        <div class="dash-section">
          <div class="dash-section-head">
            <div class="eyebrow">Suscripciones</div>
            <h2>Planes</h2>
            <p>${planes.length} plan${planes.length !== 1 ? 'es' : ''} disponibles</p>
          </div>

          <div class="dash-grid dash-grid-3" style="margin-bottom:1rem">
            <div class="dash-stat">
              <div class="dash-stat-label">Usuarios totales</div>
              <div class="dash-stat-value">${totalUsuarios}</div>
            </div>
            <div class="dash-stat">
              <div class="dash-stat-label">Ingresos mensuales est.</div>
              <div class="dash-stat-value">${money(ingresos)}</div>
            </div>
            <div class="dash-stat">
              <div class="dash-stat-label">Plan más popular</div>
              <div class="dash-stat-value" style="font-size:1.1rem">
                ${Object.entries(conteo).sort((a,b)=>b[1]-a[1])[0]?.[0] || '—'}
              </div>
            </div>
          </div>

          <div class="dash-grid dash-grid-4">${cards}</div>
        </div>
      `
    } catch (err) {
      content.innerHTML = errorMsg('No se pudieron cargar los planes: ' + err.message)
    }
  }

  window.dashEditarPlan = async function(nombrePlan, precioActual) {
    const confirmed = await openModal(
      `Editar precio: ${nombrePlan}`,
      `<div class="dash-input-group">
        <label>Nuevo precio mensual (€)</label>
        <input class="dash-input" id="nuevoPrecio" type="number" min="0" step="0.01" value="${precioActual}" />
      </div>`,
      'Guardar', false
    )
    if (!confirmed) return
    const precio = parseFloat(document.getElementById('nuevoPrecio')?.value)
    if (isNaN(precio) || precio < 0) return toast('Precio inválido', 'err')
    try {
      const r = await fetch(`${API_BASE}/planes/${encodeURIComponent(nombrePlan)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ precio })
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      toast(`Precio de ${nombrePlan} actualizado`, 'ok')
      loadSection('planes')
    } catch (err) {
      toast('Error al actualizar: ' + err.message, 'err')
    }
  }

  // ── INIT ─────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {

    const user = JSON.parse(localStorage.getItem('JAM_user') || 'null')
    if (!user?.email || user?.tipoUsuario !== 'ADMIN') {
      window.location.href = './landing.html'
      return
    }

    document.body.insertAdjacentHTML('beforeend', `
      <div id="dashGenericModal" class="dash-modal">
        <div class="dash-modal-inner">
          <div class="dash-modal-head">
            <h3></h3>
            <button class="dash-modal-close" onclick="closeModal(false)" aria-label="Cerrar">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="m6 6 12 12"/><path d="M18 6 6 18"/>
              </svg>
            </button>
          </div>
          <div class="dash-modal-body"></div>
          <div style="display:flex;justify-content:flex-end;gap:.5rem;padding:1rem 1.5rem;border-top:1px solid rgba(204,211,217,.1)">
            <button class="dash-btn dash-btn--ghost" onclick="closeModal(false)">Cancelar</button>
            <button class="dash-btn dash-btn--primary dash-modal-confirm" onclick="closeModal(true)">Confirmar</button>
          </div>
        </div>
      </div>
    `)

    window.closeModal = closeModal
    bindNav()
    loadSection('usuarios')
  })
})()