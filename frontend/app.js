// RebelsRev Network - Revolutionary Affiliate Management System
class RebelsRevState {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.apiUrl = 'https://tu-backend.vercel.app/api'; // CAMBIAR POR TU URL DE BACKEND
        this.data = this.initializeRebelData();
    }

    initializeRebelData() {
        return {
            users: [
                { id: 1, username: "admin", email: "admin@rebelsrev.com", role: "admin", created_at: "2024-01-15" },
                { id: 2, username: "rebel_carlos", email: "carlos@email.com", role: "affiliate", created_at: "2024-02-20" },
                { id: 3, username: "storm_maria", email: "maria@email.com", role: "affiliate", created_at: "2024-03-10" }
            ],
            affiliates: [
                {
                    id: 1, user_id: 2, name: "Carlos Rebel", email: "carlos@email.com", status: "active",
                    commission_rate: 0.5, total_clicks: 15420, total_conversions: 892, total_revenue: 17840,
                    displayed_revenue: 8920, pending_payment: 8920, join_date: "2024-02-20",
                    last_activity: "2024-12-15", sub_id: "REV001"
                },
                {
                    id: 2, user_id: 3, name: "María Storm", email: "maria@email.com", status: "active",
                    commission_rate: 0.5, total_clicks: 8950, total_conversions: 445, total_revenue: 8900,
                    displayed_revenue: 4450, pending_payment: 4450, join_date: "2024-03-10",
                    last_activity: "2024-12-14", sub_id: "REV002"
                },
                {
                    id: 3, user_id: 4, name: "Alex Thunder", email: "alex@email.com", status: "active",
                    commission_rate: 0.5, total_clicks: 23100, total_conversions: 1340, total_revenue: 26800,
                    displayed_revenue: 13400, pending_payment: 13400, join_date: "2024-01-30",
                    last_activity: "2024-12-15", sub_id: "REV003"
                }
            ],
            campaigns: [
                {
                    id: 1, name: "iPhone 15 Revolution", type: "sweeps", payout: 2.5, status: "active",
                    geo: "US,CA,UK", description: "Revolutionary iPhone giveaway", created_at: "2024-11-01",
                    total_revenue: 15600, network_share: 7800, affiliate_share: 7800
                },
                {
                    id: 2, name: "Mobile Rebellion - Premium Apps", type: "mobile_content", payout: 1.8, status: "active",
                    geo: "US,AU,DE", description: "Premium app revolution", created_at: "2024-10-15",
                    total_revenue: 12400, network_share: 6200, affiliate_share: 6200
                },
                {
                    id: 3, name: "Credit Storm - PIN Submit", type: "pin_submit", payout: 3.2, status: "active",
                    geo: "US,CA", description: "Credit revolution with PIN verification", created_at: "2024-11-20",
                    total_revenue: 9800, network_share: 4900, affiliate_share: 4900
                }
            ],
            stats: {
                today: { total_clicks: 1250, total_conversions: 78, total_revenue: 156.0, network_revenue: 78.0, affiliate_revenue: 78.0 },
                week: { total_clicks: 8740, total_conversions: 542, total_revenue: 1084.0, network_revenue: 542.0, affiliate_revenue: 542.0 },
                month: { total_clicks: 47560, total_conversions: 2677, total_revenue: 53540.0, network_revenue: 26770.0, affiliate_revenue: 26770.0 }
            }
        };
    }

    // API calls
    async apiCall(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (this.currentUser && this.currentUser.token) {
                options.headers['Authorization'] = `Bearer ${this.currentUser.token}`;
            }

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.apiUrl}${endpoint}`, options);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { error: 'Network error' };
        }
    }
}

// Global state
const appState = new RebelsRevState();

// Authentication
async function login(username, password) {
    try {
        const response = await appState.apiCall('/auth/login', 'POST', { username, password });
        
        if (response.token) {
            appState.currentUser = response;
            localStorage.setItem('rebelsrev_user', JSON.stringify(response));
            showApp();
            return true;
        } else {
            // Fallback to demo data
            const user = appState.data.users.find(u => u.username === username);
            if (user) {
                appState.currentUser = { ...user, token: 'demo-token' };
                localStorage.setItem('rebelsrev_user', JSON.stringify(appState.currentUser));
                showApp();
                return true;
            }
        }
    } catch (error) {
        console.error('Login error:', error);
    }
    return false;
}

function loginAs(username) {
    const passwords = { admin: 'admin123', rebel_carlos: 'password123' };
    document.getElementById('login-username').value = username;
    document.getElementById('login-password').value = passwords[username] || 'password123';
}

function logout() {
    appState.currentUser = null;
    localStorage.removeItem('rebelsrev_user');
    showLogin();
}

function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
}

function showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    setupNavigation();
    updateUserInfo();
    navigateTo('dashboard');
}

// Navigation
function setupNavigation() {
    const nav = document.getElementById('sidebar-nav');
    const isAdmin = appState.currentUser.role === 'admin';
    
    const menuItems = isAdmin ? [
        { key: 'dashboard', label: '📊 Dashboard', icon: '📊' },
        { key: 'affiliates', label: '👥 Afiliados', icon: '👥' },
        { key: 'campaigns', label: '🎯 Campañas', icon: '🎯' },
        { key: 'stats', label: '📈 Estadísticas', icon: '📈' },
        { key: 'payouts', label: '💰 Pagos', icon: '💰' }
    ] : [
        { key: 'dashboard', label: '📊 Dashboard', icon: '📊' },
        { key: 'links', label: '🔗 Mis Links', icon: '🔗' },
        { key: 'stats', label: '📈 Estadísticas', icon: '📈' },
        { key: 'earnings', label: '💰 Ganancias', icon: '💰' }
    ];

    nav.innerHTML = menuItems.map(item => `
        <li>
            <a href="#" onclick="navigateTo('${item.key}')" data-page="${item.key}">
                <span>${item.icon}</span>
                ${item.label}
            </a>
        </li>
    `).join('');
}

function navigateTo(page) {
    appState.currentPage = page;
    
    // Update active nav item
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
    
    // Update page title
    const titles = {
        dashboard: '🔥 Dashboard Rebelde',
        affiliates: '👥 Gestión de Afiliados',
        campaigns: '🎯 Campañas Revolucionarias',
        stats: '📈 Estadísticas de Guerra',
        payouts: '💰 Control de Pagos',
        links: '🔗 Generador de Links',
        earnings: '💰 Mis Ganancias'
    };
    
    document.getElementById('page-title').textContent = titles[page] || 'RebelsRev';
    
    // Render page content
    renderPage(page);
}

function renderPage(page) {
    const content = document.getElementById('page-content');
    
    switch (page) {
        case 'dashboard':
            content.innerHTML = renderDashboard();
            break;
        case 'affiliates':
            content.innerHTML = renderAffiliates();
            break;
        case 'campaigns':
            content.innerHTML = renderCampaigns();
            break;
        case 'stats':
            content.innerHTML = renderStats();
            break;
        case 'payouts':
            content.innerHTML = renderPayouts();
            break;
        case 'links':
            content.innerHTML = renderLinks();
            break;
        case 'earnings':
            content.innerHTML = renderEarnings();
            break;
        default:
            content.innerHTML = '<h2>Página no encontrada</h2>';
    }
    
    // Initialize charts if needed
    if (page === 'dashboard' || page === 'stats') {
        setTimeout(initializeCharts, 100);
    }
}

// Page renderers
function renderDashboard() {
    const isAdmin = appState.currentUser.role === 'admin';
    const stats = appState.data.stats.month;
    
    return `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-value">${stats.total_clicks.toLocaleString()}</span>
                <span class="stat-label">Clicks Totales</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${stats.total_conversions.toLocaleString()}</span>
                <span class="stat-label">Conversiones</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">$${(stats.total_revenue / 1000).toFixed(1)}K</span>
                <span class="stat-label">${isAdmin ? 'Revenue Total' : 'Mis Ganancias'}</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${((stats.total_conversions / stats.total_clicks) * 100).toFixed(2)}%</span>
                <span class="stat-label">Conversión</span>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">📈 Performance de los Últimos 30 Días</h3>
            </div>
            <div class="chart-container">
                <canvas id="performance-chart"></canvas>
            </div>
        </div>
        
        ${isAdmin ? renderTopAffiliates() : renderRecentActivity()}
    `;
}

function renderTopAffiliates() {
    const topAffiliates = appState.data.affiliates
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 5);
    
    return `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">🏆 Top Afiliados Rebeldes</h3>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Rebelde</th>
                            <th>Sub ID</th>
                            <th>Clicks</th>
                            <th>Conversiones</th>
                            <th>Revenue Total</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topAffiliates.map(aff => `
                            <tr>
                                <td><strong>${aff.name}</strong></td>
                                <td><span class="status-badge status-badge--active">${aff.sub_id}</span></td>
                                <td>${aff.total_clicks.toLocaleString()}</td>
                                <td>${aff.total_conversions.toLocaleString()}</td>
                                <td><strong>$${aff.total_revenue.toLocaleString()}</strong></td>
                                <td><span class="status-badge status-badge--${aff.status}">${aff.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderRecentActivity() {
    return `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">⚡ Actividad Reciente</h3>
            </div>
            <div class="activity-list">
                <div class="activity-item">
                    <div class="activity-icon">🔥</div>
                    <div class="activity-content">
                        <p><strong>Nueva conversión</strong> en iPhone 15 Revolution</p>
                        <small>Hace 2 horas - $2.50</small>
                    </div>
                </div>
                <div class="activity-item">
                    <div class="activity-icon">📱</div>
                    <div class="activity-content">
                        <p><strong>Link generado</strong> para Mobile Rebellion</p>
                        <small>Hace 4 horas</small>
                    </div>
                </div>
                <div class="activity-item">
                    <div class="activity-icon">💰</div>
                    <div class="activity-content">
                        <p><strong>Pago procesado</strong> por $156.78</p>
                        <small>Ayer</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// More render functions...
function renderAffiliates() {
    return `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">👥 Rebeldes Activos</h3>
                <button class="btn btn--primary" onclick="showAddAffiliateModal()">
                    ➕ Agregar Rebelde
                </button>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Rebelde</th>
                            <th>Email</th>
                            <th>Sub ID</th>
                            <th>Clicks</th>
                            <th>Conversiones</th>
                            <th>Revenue Real</th>
                            <th>Revenue Mostrado</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${appState.data.affiliates.map(aff => `
                            <tr>
                                <td><strong>${aff.name}</strong></td>
                                <td>${aff.email}</td>
                                <td><span class="status-badge status-badge--active">${aff.sub_id}</span></td>
                                <td>${aff.total_clicks.toLocaleString()}</td>
                                <td>${aff.total_conversions.toLocaleString()}</td>
                                <td><strong>$${aff.total_revenue.toLocaleString()}</strong></td>
                                <td><span style="color: var(--color-primary)">$${aff.displayed_revenue.toLocaleString()}</span></td>
                                <td><span class="status-badge status-badge--${aff.status}">${aff.status}</span></td>
                                <td>
                                    <button class="btn btn--sm btn--secondary" onclick="editAffiliate(${aff.id})">✏️</button>
                                    <button class="btn btn--sm btn--secondary" onclick="viewAffiliateStats(${aff.id})">📊</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved user
    const savedUser = localStorage.getItem('rebelsrev_user');
    if (savedUser) {
        appState.currentUser = JSON.parse(savedUser);
        showApp();
    } else {
        showLogin();
    }
    
    // Login form
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const success = await login(username, password);
        if (!success) {
            alert('❌ Credenciales incorrectas. Intenta con las cuentas demo.');
        }
    });
});

function updateUserInfo() {
    const userInfo = document.getElementById('user-info');
    const roleBadge = document.getElementById('user-role-badge');
    
    if (appState.currentUser) {
        userInfo.textContent = appState.currentUser.username;
        roleBadge.textContent = appState.currentUser.role === 'admin' ? 'ADMIN REBEL' : 'REBEL';
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function initializeCharts() {
    const ctx = document.getElementById('performance-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            datasets: [{
                label: 'Revenue ($)',
                data: [12000, 15000, 18000, 22000],
                borderColor: '#DC2626',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#F9FAFB' }
                }
            },
            scales: {
                x: { ticks: { color: '#9CA3AF' } },
                y: { ticks: { color: '#9CA3AF' } }
            }
        }
    });
}

// Utility functions
function showAddAffiliateModal() {
    alert('🔥 Funcionalidad próximamente - Modal para agregar nuevos rebeldes');
}

function editAffiliate(id) {
    alert(`✏️ Editar afiliado ${id} - Funcionalidad próximamente`);
}

function viewAffiliateStats(id) {
    alert(`📊 Ver estadísticas del afiliado ${id} - Funcionalidad próximamente`);
}

// Additional render functions
function renderCampaigns() {
    return `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">🎯 Campañas Revolucionarias</h3>
                <button class="btn btn--primary">➕ Nueva Campaña</button>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Campaña</th>
                            <th>Tipo</th>
                            <th>Payout</th>
                            <th>Geo</th>
                            <th>Revenue Total</th>
                            <th>Network Share</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${appState.data.campaigns.map(camp => `
                            <tr>
                                <td><strong>${camp.name}</strong></td>
                                <td><span class="status-badge status-badge--active">${camp.type}</span></td>
                                <td><strong>$${camp.payout}</strong></td>
                                <td>${camp.geo}</td>
                                <td>$${camp.total_revenue.toLocaleString()}</td>
                                <td><span style="color: var(--color-primary)">$${camp.network_share.toLocaleString()}</span></td>
                                <td><span class="status-badge status-badge--${camp.status}">${camp.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderStats() {
    return renderDashboard(); // Reuse dashboard for now
}

function renderPayouts() {
    return `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">💰 Control de Pagos</h3>
            </div>
            <p>📊 Sistema de pagos próximamente...</p>
        </div>
    `;
}

function renderLinks() {
    return `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">🔗 Generador de Links Rebeldes</h3>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Campaña</label>
                    <select class="form-control">
                        ${appState.data.campaigns.map(camp => `
                            <option value="${camp.id}">${camp.name} - $${camp.payout}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Sub ID (Opcional)</label>
                    <input type="text" class="form-control" placeholder="ej: traffic_source_1">
                </div>
                <div class="form-group">
                    <button class="btn btn--primary">🔥 Generar Link Rebelde</button>
                </div>
            </div>
            <div class="generated-link" style="margin-top: 2rem; padding: 1rem; background: rgba(220, 38, 38, 0.1); border-radius: 8px;">
                <p><strong>Tu Link Rebelde:</strong></p>
                <code style="color: var(--color-primary);">https://track.rebelsrev.com/t/abc123?aff=REV001&camp=1</code>
                <button class="btn btn--sm btn--secondary" style="margin-left: 1rem;">📋 Copiar</button>
            </div>
        </div>
    `;
}

function renderEarnings() {
    const userAffiliate = appState.data.affiliates.find(a => a.user_id === appState.currentUser.id) || appState.data.affiliates[0];
    
    return `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-value">$${userAffiliate.displayed_revenue.toLocaleString()}</span>
                <span class="stat-label">Ganancias Totales</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">$${userAffiliate.pending_payment.toLocaleString()}</span>
                <span class="stat-label">Pendiente de Pago</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${userAffiliate.total_conversions}</span>
                <span class="stat-label">Conversiones</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${((userAffiliate.total_conversions / userAffiliate.total_clicks) * 100).toFixed(2)}%</span>
                <span class="stat-label">Tasa Conversión</span>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">💰 Solicitar Pago</h3>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Método de Pago</label>
                    <select class="form-control">
                        <option>PayPal</option>
                        <option>Transferencia Bancaria</option>
                        <option>Crypto (USDT)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Cantidad</label>
                    <input type="number" class="form-control" value="${userAffiliate.pending_payment}" max="${userAffiliate.pending_payment}">
                </div>
                <div class="form-group">
                    <button class="btn btn--primary">🔥 Solicitar Pago Rebelde</button>
                </div>
            </div>
        </div>
    `;
}