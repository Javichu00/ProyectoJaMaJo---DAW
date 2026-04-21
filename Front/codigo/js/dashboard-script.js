;(function () {
    // ============================================================
    // DATOS MOCK
    // ============================================================
  
    const mockData = {
      users: [
        { id: 1, name: 'Maria Gonzalez', email: 'maria.g@email.com', status: 'active',  registered: '2026-01-15', purchases: 12 },
        { id: 2, name: 'Juan Perez',     email: 'juan.p@email.com',  status: 'active',  registered: '2026-02-20', purchases: 8  },
        { id: 3, name: 'Ana Martinez',   email: 'ana.m@email.com',   status: 'blocked', registered: '2025-11-10', purchases: 3  },
        { id: 4, name: 'Carlos Lopez',   email: 'carlos.l@email.com',status: 'active',  registered: '2026-03-05', purchases: 15 },
        { id: 5, name: 'Laura Sanchez',  email: 'laura.s@email.com', status: 'active',  registered: '2026-01-28', purchases: 6  },
      ],
  
      content: [
        { id: 1, title: 'Stranger Things S5', genre: 'Ciencia Ficcion', price: '9.99',  status: 'active' },
        { id: 2, title: 'The Last of Us',     genre: 'Drama / Accion',  price: '12.99', status: 'active' },
        { id: 3, title: 'Breaking Bad',       genre: 'Drama / Crimen',  price: '8.99',  status: 'active' },
        { id: 4, title: 'The Crown',          genre: 'Drama / Historia',price: '10.99', status: 'active' },
        { id: 5, title: 'Succession',         genre: 'Drama',           price: '11.99', status: 'active' },
        { id: 6, title: 'The Witcher S4',     genre: 'Fantasia',        price: '9.99',  status: 'draft'  },
      ],
  
      carts: [
        {
          id: 1,
          userName: 'Maria Gonzalez', userEmail: 'maria.g@email.com',
          items: [
            { id: 1, title: 'Stranger Things S5', price: 9.99,  addedAt: '2026-04-20 14:30' },
            { id: 2, title: 'The Crown',          price: 10.99, addedAt: '2026-04-20 14:35' },
          ],
          total: 20.98, lastUpdate: '2026-04-20 14:35',
        },
        {
          id: 2,
          userName: 'Juan Perez', userEmail: 'juan.p@email.com',
          items: [
            { id: 3, title: 'The Last of Us', price: 12.99, addedAt: '2026-04-19 10:15' },
          ],
          total: 12.99, lastUpdate: '2026-04-19 10:15',
        },
        {
          id: 3,
          userName: 'Carlos Lopez', userEmail: 'carlos.l@email.com',
          items: [
            { id: 4, title: 'Breaking Bad',   price: 8.99,  addedAt: '2026-04-21 09:20' },
            { id: 5, title: 'Succession',     price: 11.99, addedAt: '2026-04-21 09:25' },
            { id: 6, title: 'The Witcher S4', price: 9.99,  addedAt: '2026-04-21 09:30' },
          ],
          total: 30.97, lastUpdate: '2026-04-21 09:30',
        },
      ],
  
      transactions: [
        { id: 'TX-12456', user: 'Maria Gonzalez', product: 'Stranger Things S5', date: '2026-04-20', amount: '9.99',  status: 'completed' },
        { id: 'TX-12457', user: 'Juan Perez',     product: 'The Last of Us',     date: '2026-04-20', amount: '12.99', status: 'completed' },
        { id: 'TX-12458', user: 'Ana Martinez',   product: 'Breaking Bad',       date: '2026-04-19', amount: '8.99',  status: 'failed'    },
        { id: 'TX-12459', user: 'Carlos Lopez',   product: 'The Crown',          date: '2026-04-19', amount: '10.99', status: 'completed' },
        { id: 'TX-12460', user: 'Laura Sanchez',  product: 'Succession',         date: '2026-04-18', amount: '11.99', status: 'pending'   },
      ],
    }
  
    // ============================================================
    // HELPERS
    // ============================================================
  
    const esc = (window.JAM && window.JAM.escapeHtml) || ((v) => String(v)
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;').replaceAll("'", '&#39;'))
  
    function badge(status) {
      const map = {
        active:    ['dash-badge--ok',   '✓ Activo'],
        blocked:   ['dash-badge--err',  '✗ Bloqueado'],
        completed: ['dash-badge--ok',   '✓ Completado'],
        failed:    ['dash-badge--err',  '✗ Fallido'],
        pending:   ['dash-badge--warn', '⏱ Pendiente'],
        draft:     ['dash-badge--warn', 'Borrador'],
        active_content: ['dash-badge--ok', 'Activo'],
      }
      const [mod, label] = map[status] ?? ['dash-badge--info', status]
      return `<span class="dash-badge ${mod}">${esc(label)}</span>`
    }
  
    function avatar(name, size) {
      const sz = size || '32px'
      return `<div class="dash-avatar" style="width:${sz};height:${sz}">${esc(name.charAt(0))}</div>`
    }
  
    function statCard(label, value, trend, badgeText, iconSvg) {
      return `
        <div class="dash-stat">
          <div class="dash-stat-head">
            <div class="dash-stat-icon">${iconSvg}</div>
            <span class="dash-badge dash-badge--${trend}">${esc(badgeText)}</span>
          </div>
          <div class="dash-stat-label eyebrow">${esc(label)}</div>
          <div class="dash-stat-value">${esc(value)}</div>
        </div>
      `
    }
  
    // ============================================================
    // NAVEGACION
    // ============================================================
  
    function bindNav() {
      const navItems = document.querySelectorAll('.dash-nav-item')
  
      navItems.forEach((item) => {
        item.addEventListener('click', () => {
          navItems.forEach((n) => n.classList.remove('active'))
          item.classList.add('active')
          loadSection(item.dataset.section)
        })
      })
    }
  
    function loadSection(section) {
      const content = document.getElementById('dash-content')
      if (!content) return
      content.innerHTML = ''
  
      const map = {
        overview:     sectionOverview,
        users:        sectionUsers,
        content:      sectionContent,
        transactions: sectionTransactions,
        analytics:    sectionAnalytics,
        carts:        sectionCarts,
        settings:     sectionSettings,
        security:     sectionSecurity,
      }
  
      const fn = map[section]
      if (fn) content.innerHTML = fn()
  
      // Pasar items del dashboard al buscador del menu
      if (window.JAM) {
        window.JAM.setSearchIndex(buildDashSearchIndex())
      }
    }
  
    // ============================================================
    // INDICE DE BUSQUEDA DEL MENU
    // ============================================================
  
    function buildDashSearchIndex() {
      const items = []
  
      mockData.users.forEach((u) => {
        items.push({
          title: u.name,
          category: 'Usuario',
          note: u.email,
          href: '#',
        })
      })
  
      mockData.content.forEach((c) => {
        items.push({
          title: c.title,
          category: c.genre,
          note: `$${c.price}`,
          href: '#',
        })
      })
  
      return items
    }
  
    // ============================================================
    // SECCIONES
    // ============================================================
  
    function sectionOverview() {
      const popular = [
        { title: 'Stranger Things S5', views: 124500, revenue: '$12.450' },
        { title: 'The Last of Us',     views: 98200,  revenue: '$9.820'  },
        { title: 'Breaking Bad',       views: 87300,  revenue: '$8.730'  },
        { title: 'The Crown',          views: 76100,  revenue: '$7.610'  },
      ]
  
      const rankHtml = popular.map((item, i) => `
        <div class="dash-rank-item">
          <div class="dash-flex dash-items-c dash-gap-2">
            <div class="dash-rank-num">${i + 1}</div>
            <div>
              <div class="dash-rank-title">${esc(item.title)}</div>
              <div class="dash-rank-views">${item.views.toLocaleString('es-ES')} visualizaciones</div>
            </div>
          </div>
          <div class="dash-rank-revenue">${esc(item.revenue)}</div>
        </div>
      `).join('')
  
      return `
        <div class="dash-section">
          <div class="dash-section-head">
            <div class="eyebrow">Dashboard</div>
            <h2>Panel General</h2>
            <p>Resumen de metricas clave de la plataforma</p>
          </div>
  
          <div class="dash-grid dash-grid-4 dash-mb-4">
            ${statCard('Usuarios Activos',    '24.563', 'up',   '↑ 12.5%', iconUsers())}
            ${statCard('Ingresos del Mes',    '$124.560','up',  '↑ 8.2%',  iconMoney())}
            ${statCard('Ventas Totales',      '8.945',  'up',   '↑ 5.4%',  iconBag())}
            ${statCard('Tasa de Conversion',  '3.24%',  'down', '↓ 0.8%',  iconConv())}
          </div>
  
          <div class="dash-card">
            <div class="eyebrow dash-mb-2">Ranking</div>
            <h3 style="font-size:1.1rem;font-weight:700;letter-spacing:-0.02em;margin-bottom:1.1rem;">
              Contenido mas popular
            </h3>
            ${rankHtml}
          </div>
        </div>
      `
    }
  
    function sectionUsers() {
      const rows = mockData.users.map((u) => `
        <tr>
          <td>
            <div class="dash-flex dash-items-c dash-gap-2">
              ${avatar(u.name, '32px')}
              <span style="font-weight:500">${esc(u.name)}</span>
            </div>
          </td>
          <td style="color:var(--slate)">${esc(u.email)}</td>
          <td>${badge(u.status)}</td>
          <td style="color:var(--slate)">${esc(u.registered)}</td>
          <td style="font-weight:600">${u.purchases}</td>
          <td>
            <div class="dash-flex dash-gap-1">
              <button class="dash-btn dash-btn--ghost dash-btn--sm">Editar</button>
              <button class="dash-btn dash-btn--danger dash-btn--sm">Eliminar</button>
            </div>
          </td>
        </tr>
      `).join('')
  
      return `
        <div class="dash-section">
          <div class="dash-section-actions">
            <div class="dash-section-head">
              <div class="eyebrow">Gestion</div>
              <h2>Usuarios</h2>
              <p>Administra y monitorea usuarios de la plataforma</p>
            </div>
            <button class="dash-btn dash-btn--primary">
              ${iconPlus()} Anadir Usuario
            </button>
          </div>
  
          <div class="dash-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th><th>Email</th><th>Estado</th>
                  <th>Registro</th><th>Compras</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      `
    }
  
    function sectionContent() {
      const cards = mockData.content.map((item) => `
        <div class="dash-poster-card">
          <div class="dash-poster-thumb">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/>
            </svg>
          </div>
          <div class="dash-poster-info">
            <div class="dash-poster-title">${esc(item.title)}</div>
            <div class="dash-poster-genre">${esc(item.genre)}</div>
            <div class="dash-poster-foot">
              <span class="dash-poster-price">$${esc(item.price)}</span>
              ${badge(item.status === 'active' ? 'active' : 'draft')}
            </div>
          </div>
        </div>
      `).join('')
  
      return `
        <div class="dash-section">
          <div class="dash-section-actions">
            <div class="dash-section-head">
              <div class="eyebrow">Catalogo</div>
              <h2>Contenido</h2>
              <p>Administra peliculas y series de la plataforma</p>
            </div>
            <button class="dash-btn dash-btn--primary">${iconPlus()} Anadir Contenido</button>
          </div>
          <div class="dash-poster-grid">${cards}</div>
        </div>
      `
    }
  
    function sectionTransactions() {
      const rows = mockData.transactions.map((tx) => `
        <tr>
          <td><span class="dash-mono">${esc(tx.id)}</span></td>
          <td style="font-weight:500">${esc(tx.user)}</td>
          <td style="color:var(--slate)">${esc(tx.product)}</td>
          <td style="color:var(--slate)">${esc(tx.date)}</td>
          <td style="font-weight:700">$${esc(tx.amount)}</td>
          <td>${badge(tx.status)}</td>
          <td>
            ${tx.status === 'completed'
              ? `<button class="dash-btn dash-btn--danger dash-btn--sm">Reembolsar</button>`
              : ''}
          </td>
        </tr>
      `).join('')
  
      return `
        <div class="dash-section">
          <div class="dash-section-actions">
            <div class="dash-section-head">
              <div class="eyebrow">Historial</div>
              <h2>Compras y Transacciones</h2>
              <p>Historial y estado de pagos</p>
            </div>
            <button class="dash-btn dash-btn--secondary">${iconDownload()} Exportar</button>
          </div>
  
          <div class="dash-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Usuario</th><th>Producto</th>
                  <th>Fecha</th><th>Monto</th><th>Estado</th><th></th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      `
    }
  
    function sectionAnalytics() {
      return `
        <div class="dash-section">
          <div class="dash-section-head">
            <div class="eyebrow">Metricas</div>
            <h2>Analitica Avanzada</h2>
            <p>Metricas detalladas y tendencias de consumo</p>
          </div>
  
          <div class="dash-grid dash-grid-2">
            <div class="dash-card">
              <div class="eyebrow dash-mb-2">Distribucion</div>
              <h3 style="font-size:1rem;font-weight:700;margin-bottom:1rem;">Ventas por Genero</h3>
              <div class="dash-chart-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                  <rect x="2" y="3" width="4" height="18" rx="1"/><rect x="9" y="8" width="4" height="13" rx="1"/><rect x="16" y="5" width="4" height="16" rx="1"/>
                </svg>
                <span>Grafica de barras — requiere libreria de charts</span>
              </div>
            </div>
  
            <div class="dash-card">
              <div class="eyebrow dash-mb-2">Evolucion</div>
              <h3 style="font-size:1rem;font-weight:700;margin-bottom:1rem;">Tendencias de Consumo</h3>
              <div class="dash-chart-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                  <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
                </svg>
                <span>Grafica de lineas — requiere libreria de charts</span>
              </div>
            </div>
          </div>
        </div>
      `
    }
  
    function sectionCarts() {
      const cards = mockData.carts.map((cart) => {
        const itemsHtml = cart.items.map((item) => `
          <div class="dash-cart-item">
            <div class="dash-cart-item-head">
              <span class="dash-cart-item-title">${esc(item.title)}</span>
              <span class="dash-cart-item-price">$${item.price.toFixed(2)}</span>
            </div>
            <div class="dash-cart-item-meta">Anadido: ${esc(item.addedAt)}</div>
          </div>
        `).join('')
  
        return `
          <div class="dash-card">
            <div class="dash-flex dash-items-c dash-gap-2 dash-mb-3">
              ${avatar(cart.userName, '36px')}
              <div>
                <div style="font-size:.875rem;font-weight:600">${esc(cart.userName)}</div>
                <div style="font-size:.72rem;color:var(--slate)">${esc(cart.userEmail)}</div>
              </div>
            </div>
  
            <div style="font-size:.7rem;color:var(--slate);margin-bottom:.65rem;text-transform:uppercase;letter-spacing:.12em">
              ${cart.items.length} ${cart.items.length === 1 ? 'producto' : 'productos'}
              &nbsp;·&nbsp; actualizado ${esc(cart.lastUpdate)}
            </div>
  
            ${itemsHtml}
  
            <div class="dash-cart-total">
              <span class="dash-cart-total-label">Total</span>
              <span class="dash-cart-total-value">$${cart.total.toFixed(2)}</span>
            </div>
  
            <div class="dash-flex dash-gap-2 dash-mt-3">
              <button class="dash-btn dash-btn--secondary" style="flex:1" onclick="dashEditCart(${cart.id})">
                ${iconEdit()} Editar
              </button>
              <button class="dash-btn dash-btn--danger" onclick="dashDeleteCart(${cart.id})">
                ${iconTrash()}
              </button>
            </div>
          </div>
        `
      }).join('')
  
      return `
        <div class="dash-section">
          <div class="dash-section-head">
            <div class="eyebrow">Usuarios</div>
            <h2>Gestion de Carritos</h2>
            <p>Visualiza, modifica y elimina carritos de usuarios</p>
          </div>
          <div class="dash-grid dash-grid-3">${cards}</div>
        </div>
      `
    }
  
    function sectionSettings() {
      return `
        <div class="dash-section">
          <div class="dash-section-head">
            <div class="eyebrow">Sistema</div>
            <h2>Configuracion</h2>
            <p>Ajustes generales de la plataforma</p>
          </div>
  
          <div class="dash-grid dash-grid-2">
            <div class="dash-card">
              <div class="eyebrow dash-mb-2">Permisos</div>
              <h3 style="font-size:1rem;font-weight:700;margin-bottom:1rem;">Gestion de Roles</h3>
              <div class="dash-input-group">
                <label>Administrador — 3 usuarios</label>
                <div style="padding:.7rem 1rem;background:rgba(2,51,52,.04);border-radius:var(--radius-md);font-size:.82rem;color:var(--slate)">
                  Acceso completo al sistema
                </div>
              </div>
              <div class="dash-input-group">
                <label>Soporte — 8 usuarios</label>
                <div style="padding:.7rem 1rem;background:rgba(2,51,52,.04);border-radius:var(--radius-md);font-size:.82rem;color:var(--slate)">
                  Solo lectura + gestion de usuarios
                </div>
              </div>
            </div>
  
            <div class="dash-card">
              <div class="eyebrow dash-mb-2">Precios</div>
              <h3 style="font-size:1rem;font-weight:700;margin-bottom:1rem;">Configuracion de Precios</h3>
              <div class="dash-input-group">
                <label>Precio base peliculas</label>
                <input type="text" class="dash-input" value="$8.99" />
              </div>
              <div class="dash-input-group">
                <label>Precio base series</label>
                <input type="text" class="dash-input" value="$9.99" />
              </div>
              <button class="dash-btn dash-btn--primary dash-mt-2">Guardar Cambios</button>
            </div>
          </div>
        </div>
      `
    }
  
    function sectionSecurity() {
      return `
        <div class="dash-section">
          <div class="dash-section-head">
            <div class="eyebrow">Monitoreo</div>
            <h2>Seguridad</h2>
            <p>Logs y alertas de actividad del sistema</p>
          </div>
  
          <div class="dash-grid dash-grid-3 dash-mb-4">
            ${statCard('Eventos (24h)',     '12', 'up',   '↑ 3', iconShield())}
            ${statCard('Intentos Fallidos', '8',  'down', '↓ 2', iconLock())}
            ${statCard('IPs Bloqueadas',    '3',  'up',   '↑ 1', iconWarn())}
          </div>
  
          <div class="dash-card">
            <div class="eyebrow dash-mb-2">Registro</div>
            <h3 style="font-size:1rem;font-weight:700;margin-bottom:1rem;">Actividad Reciente</h3>
            <div class="dash-table-wrap">
              <table>
                <thead>
                  <tr><th>Usuario</th><th>Accion</th><th>IP</th><th>Hora</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="font-weight:500;font-size:.82rem">admin@jamajo.com</td>
                    <td style="color:var(--slate)">Inicio de sesion</td>
                    <td><span class="dash-mono">192.168.1.1</span></td>
                    <td style="color:var(--slate);font-size:.8rem">2026-04-21 14:32</td>
                    <td>${badge('completed')}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:500;font-size:.82rem">editor@jamajo.com</td>
                    <td style="color:var(--slate)">Actualizacion de contenido</td>
                    <td><span class="dash-mono">192.168.1.45</span></td>
                    <td style="color:var(--slate);font-size:.8rem">2026-04-21 14:15</td>
                    <td>${badge('completed')}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:500;font-size:.82rem">unknown@example.com</td>
                    <td style="color:var(--slate)">Intento de acceso fallido</td>
                    <td><span class="dash-mono">203.45.67.89</span></td>
                    <td style="color:var(--slate);font-size:.8rem">2026-04-21 13:58</td>
                    <td>${badge('failed')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `
    }
  
    // ============================================================
    // CARRITO — MODAL
    // ============================================================
  
    // Expuestas globalmente para los onclick inline
    window.dashEditCart = function (cartId) {
      const cart = mockData.carts.find((c) => c.id === cartId)
      if (!cart) return
  
      const itemsHtml = cart.items.map((item, index) => `
        <div class="dash-cart-item dash-flex dash-items-c dash-justify-btw">
          <div>
            <div class="dash-cart-item-title">${esc(item.title)}</div>
            <div class="dash-cart-item-meta">$${item.price.toFixed(2)}</div>
          </div>
          <button class="dash-btn dash-btn--danger dash-btn--sm"
            onclick="dashRemoveCartItem(${cartId}, ${index})">
            Eliminar
          </button>
        </div>
      `).join('')
  
      document.getElementById('cartModalBody').innerHTML = `
        <div class="dash-mb-3">
          <div class="eyebrow" style="margin-bottom:.25rem">Carrito de</div>
          <div style="font-size:1rem;font-weight:700">${esc(cart.userName)}</div>
          <div style="font-size:.78rem;color:var(--slate)">${esc(cart.userEmail)}</div>
        </div>
  
        ${itemsHtml}
  
        <div class="dash-cart-total dash-mb-3">
          <span class="dash-cart-total-label">Total</span>
          <span class="dash-cart-total-value">$${cart.total.toFixed(2)}</span>
        </div>
  
        <div class="dash-flex dash-gap-2">
          <button class="dash-btn dash-btn--secondary" style="flex:1" onclick="closeCartModal()">Cerrar</button>
          <button class="dash-btn dash-btn--primary"   style="flex:1" onclick="dashSaveCart(${cartId})">Guardar</button>
        </div>
      `
  
      document.getElementById('cartModal').classList.add('active')
    }
  
    window.dashRemoveCartItem = function (cartId, index) {
      const cart = mockData.carts.find((c) => c.id === cartId)
      if (!cart) return
      cart.items.splice(index, 1)
      cart.total = cart.items.reduce((s, i) => s + i.price, 0)
      window.dashEditCart(cartId)
    }
  
    window.dashSaveCart = function (cartId) {
      alert('Cambios guardados correctamente')
      closeCartModal()
      loadSection('carts')
    }
  
    window.dashDeleteCart = function (cartId) {
      if (!confirm('Eliminar este carrito? Esta accion no se puede deshacer.')) return
      const idx = mockData.carts.findIndex((c) => c.id === cartId)
      if (idx !== -1) {
        mockData.carts.splice(idx, 1)
        loadSection('carts')
      }
    }
  
    window.closeCartModal = function () {
      document.getElementById('cartModal').classList.remove('active')
    }
  
    // Cerrar modal al clicar backdrop
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('cartModal')
      if (modal && e.target === modal) window.closeCartModal()
    })
  
    // ============================================================
    // MINI SVG ICONS
    // ============================================================
  
    function iconUsers()    { return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>` }
    function iconMoney()    { return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` }
    function iconBag()      { return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>` }
    function iconConv()     { return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m22 12-4-4-4 4"/><path d="M18 8v8"/><path d="m2 12 4 4 4-4"/><path d="M6 16V8"/></svg>` }
    function iconShield()   { return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>` }
    function iconLock()     { return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>` }
    function iconWarn()     { return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>` }
    function iconPlus()     { return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14"/><path d="M12 5v14"/></svg>` }
    function iconDownload() { return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>` }
    function iconEdit()     { return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>` }
    function iconTrash()    { return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>` }
  
    // ============================================================
    // INIT — mismo patron que index.js: espera DOMContentLoaded
    // ============================================================
  
    document.addEventListener('DOMContentLoaded', () => {
      // script.js ya ha renderizado header y footer para este momento
      bindNav()
      loadSection('overview')
    })
  })()