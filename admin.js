// ==========================================================
// KITABGHAR ADMIN PANEL LOGIC (admin.js)
// ==========================================================

// State
let adminOrders = [];
let adminBooks = [];
let currentTab = 'orders';
let activeEditBookId = null;

// Default Admin PIN in localStorage
const ADMIN_PIN_KEY = 'kitabghar_admin_pin';
const ADMIN_AUTH_SESSION = 'kitabghar_admin_session';

function getAdminPin() {
    return localStorage.getItem(ADMIN_PIN_KEY) || 'admin123';
}

function setAdminPin(pin) {
    localStorage.setItem(ADMIN_PIN_KEY, pin);
}

function isAuthenticated() {
    return sessionStorage.getItem(ADMIN_AUTH_SESSION) === 'true';
}

// DOM Elements
const authLockOverlay = document.getElementById('authLockOverlay');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminPinInput = document.getElementById('adminPinInput');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');

// Nav & Tabs
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const tabContents = document.querySelectorAll('.tab-content');
const currentTabTitle = document.getElementById('currentTabTitle');
const pendingOrdersBadge = document.getElementById('pendingOrdersBadge');
const adminDbStatus = document.getElementById('adminDbStatus');

// Stats Elements
const statRevenue = document.getElementById('statRevenue');
const statTotalOrders = document.getElementById('statTotalOrders');
const statPendingOrders = document.getElementById('statPendingOrders');
const statTotalBooks = document.getElementById('statTotalBooks');

// Orders Tab Elements
const ordersTableBody = document.getElementById('ordersTableBody');
const orderSearchInput = document.getElementById('orderSearchInput');
const orderStatusFilter = document.getElementById('orderStatusFilter');
const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
const invoiceModal = document.getElementById('invoiceModal');
const closeInvoiceBtn = document.getElementById('closeInvoiceBtn');
const invoicePrintContent = document.getElementById('invoicePrintContent');

// Books Tab Elements
const booksTableBody = document.getElementById('booksTableBody');
const bookSearchInput = document.getElementById('bookSearchInput');
const openAddBookModalBtn = document.getElementById('openAddBookModalBtn');
const bookModal = document.getElementById('bookModal');
const closeBookModalBtn = document.getElementById('closeBookModalBtn');
const bookForm = document.getElementById('bookForm');
const bookModalTitle = document.getElementById('bookModalTitle');
const bookIdInput = document.getElementById('bookIdInput');

// Database Setup Tab Elements
const testDbConnectionBtn = document.getElementById('testDbConnectionBtn');
const setupHealthResult = document.getElementById('setupHealthResult');
const copySqlBtn = document.getElementById('copySqlBtn');
const sqlDisplayBox = document.getElementById('sqlDisplayBox');

// Settings Elements
const changePinForm = document.getElementById('changePinForm');
const resetBooksBtn = document.getElementById('resetBooksBtn');

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    initEventListeners();
    loadSqlSchema();
    await checkDatabaseConnection();
    await loadDashboardData();

    // Check URL hash for direct tab switching (e.g. admin.html#setup)
    if (window.location.hash) {
        const hash = window.location.hash.replace('#', '');
        switchTab(hash);
    }
});

// Check if admin is logged in
function checkAuth() {
    if (isAuthenticated()) {
        authLockOverlay.style.display = 'none';
    } else {
        authLockOverlay.style.display = 'flex';
        adminPinInput.value = '';
        adminPinInput.focus();
    }
}

// Check database status
async function checkDatabaseConnection() {
    try {
        const health = await window.dbService.checkConnection();
        if (health.connected) {
            adminDbStatus.innerHTML = `<span class="dot green"></span> Supabase Connected`;
            setupHealthResult.innerHTML = `<span style="color:var(--success); font-weight:800;">✓ Connected to Supabase Cloud Database</span>`;
        } else {
            adminDbStatus.innerHTML = `<span class="dot amber"></span> Local Fallback Mode`;
            setupHealthResult.innerHTML = `<span style="color:var(--warning); font-weight:800;">⚠️ Tables not created in Supabase. Run SQL query below.</span>`;
        }
    } catch (err) {
        adminDbStatus.innerHTML = `<span class="dot amber"></span> Local Fallback Mode`;
        setupHealthResult.innerHTML = `<span style="color:var(--warning); font-weight:800;">⚠️ Setup Required</span>`;
    }
}

// Load SQL file into pre box
async function loadSqlSchema() {
    try {
        const res = await fetch('schema.sql');
        if (res.ok) {
            const sqlText = await res.text();
            sqlDisplayBox.textContent = sqlText;
        } else {
            loadEmbeddedSql();
        }
    } catch (e) {
        loadEmbeddedSql();
    }
}

function loadEmbeddedSql() {
    sqlDisplayBox.textContent = `-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    old_price NUMERIC(10, 2),
    rating NUMERIC(3, 1) DEFAULT 4.8,
    description TEXT,
    image_url TEXT,
    stock INTEGER DEFAULT 25,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    payment_method TEXT DEFAULT 'Cash on Delivery',
    notes TEXT,
    items JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_fee NUMERIC(10, 2) DEFAULT 0,
    discount NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read books" ON public.books FOR SELECT USING (true);
CREATE POLICY "Allow anon insert books" ON public.books FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update books" ON public.books FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete books" ON public.books FOR DELETE USING (true);
CREATE POLICY "Allow anon create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow anon update orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete orders" ON public.orders FOR DELETE USING (true);`;
}

// ================= EVENT LISTENERS =================
function initEventListeners() {
    // Admin Login Form
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = adminPinInput.value.trim();
        if (pin === getAdminPin()) {
            sessionStorage.setItem(ADMIN_AUTH_SESSION, 'true');
            authLockOverlay.style.display = 'none';
            showToast('Welcome to KitabGhar Admin Panel!', 'success');
            loadDashboardData();
        } else {
            showToast('Incorrect Admin PIN! Try admin123', 'error');
            adminPinInput.value = '';
            adminPinInput.focus();
        }
    });

    // Logout
    adminLogoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem(ADMIN_AUTH_SESSION);
        checkAuth();
        showToast('Logged out successfully', 'info');
    });

    // Sidebar Tab Switching
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetTab = link.dataset.tab;
            switchTab(targetTab);
        });
    });

    // Orders Filter & Search
    orderSearchInput.addEventListener('input', renderOrdersTable);
    orderStatusFilter.addEventListener('change', renderOrdersTable);
    refreshOrdersBtn.addEventListener('click', async () => {
        refreshOrdersBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
        await loadDashboardData();
        refreshOrdersBtn.innerHTML = `<i class="fa-solid fa-rotate"></i>`;
        showToast('Data refreshed', 'info');
    });

    // Invoice Modal
    closeInvoiceBtn.addEventListener('click', () => {
        invoiceModal.classList.remove('active');
    });

    // Books Filter
    bookSearchInput.addEventListener('input', renderBooksTable);

    // Book Modal
    openAddBookModalBtn.addEventListener('click', openAddBookModal);
    closeBookModalBtn.addEventListener('click', () => bookModal.classList.remove('active'));
    bookForm.addEventListener('submit', handleSaveBook);

    // Supabase Setup Copy Button
    copySqlBtn.addEventListener('click', () => {
        const sqlText = sqlDisplayBox.textContent;
        navigator.clipboard.writeText(sqlText).then(() => {
            showToast('SQL script copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Could not copy automatically. Please select and copy text.', 'error');
        });
    });

    // Test DB connection button
    testDbConnectionBtn.addEventListener('click', async () => {
        testDbConnectionBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Testing...`;
        await checkDatabaseConnection();
        testDbConnectionBtn.innerHTML = `<i class="fa-solid fa-plug"></i> Test Connection`;
        showToast('Database connection tested', 'info');
    });

    // Change PIN form
    changePinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentPin = document.getElementById('currentPin').value.trim();
        const newPin = document.getElementById('newPin').value.trim();

        if (currentPin !== getAdminPin()) {
            showToast('Current PIN is incorrect', 'error');
            return;
        }

        if (newPin.length < 4) {
            showToast('PIN must be at least 4 characters', 'error');
            return;
        }

        setAdminPin(newPin);
        changePinForm.reset();
        showToast('Admin PIN updated successfully!', 'success');
    });

    // Reset Starter Books
    resetBooksBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to reset default starter books?')) {
            const starter = window.DEFAULT_BOOKS || (typeof DEFAULT_BOOKS !== 'undefined' ? DEFAULT_BOOKS : []);
            localStorage.setItem('kitabghar_local_books', JSON.stringify(starter));
            await loadDashboardData();
            showToast('Catalog reset to starter books', 'success');
        }
    });
}

// Switch Tab
function switchTab(tabId) {
    if (!document.getElementById(`tab-${tabId}`)) return;

    sidebarLinks.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-link[data-tab="${tabId}"]`);
    if (activeLink) activeLink.classList.add('active');

    tabContents.forEach(tc => tc.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');

    currentTab = tabId;

    const titles = {
        orders: 'Orders Management (کسٹمر کے آرڈرز)',
        books: 'Books Inventory Management (کتابوں کا انتظام)',
        setup: 'Supabase Cloud Database Setup (ڈیٹابیس سیٹ اپ)',
        settings: 'Admin Settings & Security'
    };
    currentTabTitle.textContent = titles[tabId] || 'Admin Dashboard';
}

// ================= LOAD DASHBOARD DATA =================
async function loadDashboardData() {
    // 1. Fetch Orders
    const ordersRes = await window.dbService.getOrders();
    adminOrders = ordersRes.data || [];

    // 2. Fetch Books
    const booksRes = await window.dbService.getBooks();
    adminBooks = booksRes.data || [];

    // Update KPI Stats
    updateStats();

    // Render Tables
    renderOrdersTable();
    renderBooksTable();
}

function updateStats() {
    const totalRev = adminOrders.reduce((sum, o) => {
        // Only count non-cancelled orders for revenue
        if ((o.status || '').toLowerCase() !== 'cancelled') {
            return sum + Number(o.total_amount || 0);
        }
        return sum;
    }, 0);

    const pendingCount = adminOrders.filter(o => (o.status || 'Pending').toLowerCase() === 'pending').length;

    statRevenue.textContent = `Rs. ${totalRev.toLocaleString()}`;
    statTotalOrders.textContent = adminOrders.length;
    statPendingOrders.textContent = pendingCount;
    statTotalBooks.textContent = adminBooks.length;

    if (pendingCount > 0) {
        pendingOrdersBadge.textContent = pendingCount;
        pendingOrdersBadge.style.display = 'inline-block';
    } else {
        pendingOrdersBadge.style.display = 'none';
    }
}

// ================= ORDERS MANAGEMENT =================
function renderOrdersTable() {
    let list = [...adminOrders];
    const query = orderSearchInput.value.toLowerCase().trim();
    const statusFilter = orderStatusFilter.value;

    if (statusFilter !== 'all') {
        list = list.filter(o => (o.status || 'Pending').toLowerCase() === statusFilter.toLowerCase());
    }

    if (query) {
        list = list.filter(o => {
            const id = (o.id || '').toLowerCase();
            const name = (o.customer_name || '').toLowerCase();
            const phone = (o.customer_phone || '').toLowerCase();
            const city = (o.city || '').toLowerCase();
            return id.includes(query) || name.includes(query) || phone.includes(query) || city.includes(query);
        });
    }

    if (list.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--slate-500);">
                    <i class="fa-regular fa-folder-open" style="font-size: 2rem; margin-bottom: 8px; display:block;"></i>
                    No customer orders found matching current filter.
                </td>
            </tr>
        `;
        return;
    }

    ordersTableBody.innerHTML = list.map(order => {
        const items = Array.isArray(order.items) ? order.items : [];
        const itemsSummary = items.map(i => `${escapeHtml(i.title)} (x${i.quantity})`).join('<br>');
        const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString('en-PK', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : 'Recently';

        const statusLower = (order.status || 'pending').toLowerCase();

        return `
            <tr>
                <td>
                    <strong style="color: var(--primary); font-family: monospace; font-size: 0.95rem;">${order.id}</strong>
                </td>
                <td style="font-size: 0.82rem; color: var(--slate-500); white-space: nowrap;">
                    ${orderDate}
                </td>
                <td>
                    <strong>${escapeHtml(order.customer_name)}</strong>
                    <div style="font-size: 0.8rem; color: var(--slate-500);">
                        <i class="fa-solid fa-phone"></i> ${escapeHtml(order.customer_phone)}<br>
                        <i class="fa-solid fa-location-dot"></i> ${escapeHtml(order.city || '')}
                    </div>
                </td>
                <td style="font-size: 0.85rem; max-width: 200px;">
                    <div style="line-height: 1.4;">${itemsSummary || '1 Book'}</div>
                    <span style="font-size: 0.75rem; color: var(--slate-400);">(${items.length} unique titles)</span>
                </td>
                <td>
                    <strong style="color: var(--primary);">Rs. ${Number(order.total_amount).toLocaleString()}</strong>
                </td>
                <td>
                    <span style="font-size: 0.82rem; background: var(--slate-100); padding: 3px 8px; border-radius: var(--radius-sm);">
                        ${escapeHtml(order.payment_method || 'COD')}
                    </span>
                </td>
                <td>
                    <select class="status-dropdown ${statusLower}" onchange="changeOrderStatus('${order.id}', this.value, this)">
                        <option value="Pending" ${statusLower === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${statusLower === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Processing" ${statusLower === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${statusLower === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${statusLower === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${statusLower === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td style="text-align: right;">
                    <div class="action-btns" style="justify-content: flex-end;">
                        <button class="btn-icon" onclick="viewOrderInvoice('${order.id}')" title="View & Print Invoice">
                            <i class="fa-solid fa-receipt"></i>
                        </button>
                        <button class="btn-icon danger" onclick="deleteCustomerOrder('${order.id}')" title="Delete Order">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Live change status
window.changeOrderStatus = async function(orderId, newStatus, selectElem) {
    selectElem.className = `status-dropdown ${newStatus.toLowerCase()}`;
    const res = await window.dbService.updateOrderStatus(orderId, newStatus);
    if (res.success) {
        showToast(`Order ${orderId} updated to ${newStatus}`, 'success');
        const o = adminOrders.find(item => item.id === orderId);
        if (o) o.status = newStatus;
        updateStats();
    } else {
        showToast('Failed to update status', 'error');
    }
};

// Delete Order
window.deleteCustomerOrder = async function(orderId) {
    if (!confirm(`Are you sure you want to permanently delete Order ${orderId}?`)) return;

    const res = await window.dbService.deleteOrder(orderId);
    if (res.success) {
        adminOrders = adminOrders.filter(o => o.id !== orderId);
        renderOrdersTable();
        updateStats();
        showToast(`Order ${orderId} deleted`, 'info');
    } else {
        showToast('Failed to delete order', 'error');
    }
};

// View and Print Order Invoice
window.viewOrderInvoice = function(orderId) {
    const order = adminOrders.find(o => o.id === orderId);
    if (!order) return;

    const items = Array.isArray(order.items) ? order.items : [];

    invoicePrintContent.innerHTML = `
        <div style="padding: 10px; font-family: 'Plus Jakarta Sans', sans-serif;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 2px solid var(--primary); padding-bottom: 16px; margin-bottom: 20px;">
                <div>
                    <h2 style="font-size: 1.6rem; color: var(--primary); margin-bottom: 4px;">
                        KitabGhar <span style="font-size: 1.1rem; color: var(--slate-600);">(کتاب گھر)</span>
                    </h2>
                    <p style="font-size: 0.85rem; color: var(--slate-500);">
                        Pakistan's Online Bookstore Hub<br>
                        WhatsApp: +92 300 1234567 | info@kitabghar.pk
                    </p>
                </div>
                <div style="text-align: right;">
                    <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--dark);">INVOICE</h3>
                    <p style="font-size: 0.95rem; font-family: monospace; font-weight: 700; color: var(--primary); margin: 4px 0;">${order.id}</p>
                    <p style="font-size: 0.82rem; color: var(--slate-500);">${new Date(order.created_at).toLocaleString()}</p>
                </div>
            </div>

            <!-- Customer Details Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 16px; border-radius: var(--radius-md); margin-bottom: 24px; border: 1px solid var(--slate-200);">
                <div>
                    <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--slate-400); margin-bottom: 6px;">BILL & DELIVER TO:</h4>
                    <p style="font-size: 1rem; font-weight: 800; color: var(--dark);">${escapeHtml(order.customer_name)}</p>
                    <p style="font-size: 0.88rem; color: var(--slate-600); margin-top: 4px;">
                        <i class="fa-solid fa-phone"></i> ${escapeHtml(order.customer_phone)}<br>
                        <i class="fa-solid fa-location-dot"></i> ${escapeHtml(order.shipping_address)}, ${escapeHtml(order.city)}
                    </p>
                </div>
                <div>
                    <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--slate-400); margin-bottom: 6px;">ORDER INFORMATION:</h4>
                    <p style="font-size: 0.88rem; color: var(--slate-700);"><strong>Payment Method:</strong> ${order.payment_method || 'Cash on Delivery'}</p>
                    <p style="font-size: 0.88rem; color: var(--slate-700);"><strong>Current Status:</strong> ${order.status}</p>
                    ${order.notes ? `<p style="font-size: 0.85rem; color: var(--slate-500); margin-top: 4px;"><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>` : ''}
                </div>
            </div>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background: var(--slate-100); text-align: left; font-size: 0.85rem; color: var(--slate-600);">
                        <th style="padding: 10px;">Item / Book Title</th>
                        <th style="padding: 10px; text-align: center;">Qty</th>
                        <th style="padding: 10px; text-align: right;">Unit Price</th>
                        <th style="padding: 10px; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr style="border-bottom: 1px solid var(--slate-200); font-size: 0.9rem;">
                            <td style="padding: 12px 10px;">
                                <strong>${escapeHtml(item.title)}</strong>
                            </td>
                            <td style="padding: 12px 10px; text-align: center;">${item.quantity}</td>
                            <td style="padding: 12px 10px; text-align: right;">Rs. ${Number(item.price).toLocaleString()}</td>
                            <td style="padding: 12px 10px; text-align: right; font-weight: 700;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <!-- Calculation breakdown -->
            <div style="display: flex; justify-content: flex-end;">
                <div style="width: 280px; font-size: 0.9rem;">
                    <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                        <span>Subtotal:</span>
                        <span>Rs. ${Number(order.subtotal || 0).toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                        <span>Delivery Fee:</span>
                        <span>${Number(order.shipping_fee) === 0 ? 'FREE' : `Rs. ${order.shipping_fee}`}</span>
                    </div>
                    ${order.discount ? `
                        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: var(--success);">
                            <span>Discount:</span>
                            <span>-Rs. ${Number(order.discount).toLocaleString()}</span>
                        </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 2px solid var(--dark); font-size: 1.15rem; font-weight: 800; color: var(--primary);">
                        <span>Total Payable:</span>
                        <span>Rs. ${Number(order.total_amount).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div style="text-align: center; margin-top: 36px; padding-top: 14px; border-top: 1px dashed var(--slate-300); font-size: 0.8rem; color: var(--slate-500);">
                Thank you for choosing KitabGhar! May your reading bring immense wisdom and joy.
            </div>
        </div>
    `;

    invoiceModal.classList.add('active');
};

// ================= BOOKS MANAGEMENT =================
function renderBooksTable() {
    let list = [...adminBooks];
    const query = bookSearchInput.value.toLowerCase().trim();

    if (query) {
        list = list.filter(b => {
            const title = (b.title || '').toLowerCase();
            const author = (b.author || '').toLowerCase();
            const cat = (b.category || '').toLowerCase();
            return title.includes(query) || author.includes(query) || cat.includes(query);
        });
    }

    if (list.length === 0) {
        booksTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--slate-500);">
                    No books in catalog matching criteria.
                </td>
            </tr>
        `;
        return;
    }

    booksTableBody.innerHTML = list.map(b => {
        const safeImg = b.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
        return `
            <tr>
                <td>
                    <img src="${safeImg}" alt="Cover" class="table-thumb">
                </td>
                <td>
                    <strong>${escapeHtml(b.title)}</strong>
                    <div style="font-size: 0.8rem; color: var(--slate-500);">By ${escapeHtml(b.author || 'Unknown')}</div>
                </td>
                <td>
                    <span style="font-size: 0.8rem; background: var(--slate-100); padding: 4px 10px; border-radius: var(--radius-full); font-weight: 600;">
                        ${escapeHtml(b.category || 'General')}
                    </span>
                </td>
                <td>
                    <strong style="color: var(--primary);">Rs. ${Number(b.price).toLocaleString()}</strong>
                    ${b.old_price ? `<div style="font-size: 0.78rem; text-decoration: line-through; color: var(--slate-400);">Rs. ${Number(b.old_price).toLocaleString()}</div>` : ''}
                </td>
                <td>
                    <span style="font-weight: 700; color: ${b.stock > 5 ? 'var(--dark)' : 'var(--danger)'};">
                        ${b.stock || 0} in stock
                    </span>
                </td>
                <td>
                    <span style="color: #f59e0b; font-weight: 700; font-size: 0.85rem;">
                        <i class="fa-solid fa-star"></i> ${b.rating ? Number(b.rating).toFixed(1) : '4.8'}
                    </span>
                </td>
                <td>
                    ${b.is_featured ? `<span style="color: var(--success); font-weight: 700; font-size: 0.85rem;"><i class="fa-solid fa-check"></i> Yes</span>` : '<span style="color: var(--slate-400);">No</span>'}
                </td>
                <td style="text-align: right;">
                    <div class="action-btns" style="justify-content: flex-end;">
                        <button class="btn-icon" onclick="openEditBookModal('${b.id}')" title="Edit Book">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon danger" onclick="deleteBookItem('${b.id}')" title="Delete Book">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Add/Edit Book Modal
function openAddBookModal() {
    activeEditBookId = null;
    bookModalTitle.innerHTML = `<i class="fa-solid fa-book"></i> Add New Book`;
    bookForm.reset();
    bookIdInput.value = '';
    document.getElementById('bmStock').value = '25';
    document.getElementById('bmFeatured').checked = false;
    bookModal.classList.add('active');
}

window.openEditBookModal = function(bookId) {
    const book = adminBooks.find(b => b.id == bookId);
    if (!book) return;

    activeEditBookId = bookId;
    bookModalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Book Details`;
    bookIdInput.value = book.id;
    document.getElementById('bmTitle').value = book.title || '';
    document.getElementById('bmAuthor').value = book.author || '';
    document.getElementById('bmCategory').value = book.category || 'Urdu Adab';
    document.getElementById('bmPrice').value = book.price || '';
    document.getElementById('bmOldPrice').value = book.old_price || '';
    document.getElementById('bmStock').value = book.stock || 20;
    document.getElementById('bmImageUrl').value = book.image_url || '';
    document.getElementById('bmDesc').value = book.description || '';
    document.getElementById('bmFeatured').checked = !!book.is_featured;

    bookModal.classList.add('active');
};

async function handleSaveBook(e) {
    e.preventDefault();

    const title = document.getElementById('bmTitle').value.trim();
    const author = document.getElementById('bmAuthor').value.trim();
    const category = document.getElementById('bmCategory').value;
    const price = Number(document.getElementById('bmPrice').value);
    const old_price = document.getElementById('bmOldPrice').value ? Number(document.getElementById('bmOldPrice').value) : null;
    const stock = Number(document.getElementById('bmStock').value) || 0;
    const image_url = document.getElementById('bmImageUrl').value.trim();
    const description = document.getElementById('bmDesc').value.trim();
    const is_featured = document.getElementById('bmFeatured').checked;

    const saveBtn = document.getElementById('saveBookBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

    const bookPayload = {
        title,
        author,
        category,
        price,
        old_price,
        stock,
        image_url: image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        description,
        is_featured
    };

    try {
        if (activeEditBookId) {
            // Update
            const res = await window.dbService.updateBook(activeEditBookId, bookPayload);
            if (res.success) {
                showToast(`"${title}" updated successfully!`, 'success');
            }
        } else {
            // Add new
            const res = await window.dbService.addBook(bookPayload);
            if (res.success) {
                showToast(`"${title}" added to catalog!`, 'success');
            }
        }

        bookModal.classList.remove('active');
        await loadDashboardData();
    } catch (err) {
        showToast('Error saving book: ' + err.message, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save Book (محفوظ کریں)`;
    }
}

// Delete Book
window.deleteBookItem = async function(bookId) {
    const book = adminBooks.find(b => b.id == bookId);
    const title = book ? book.title : 'this book';
    if (!confirm(`Are you sure you want to remove "${title}" from the catalog?`)) return;

    const res = await window.dbService.deleteBook(bookId);
    if (res.success) {
        adminBooks = adminBooks.filter(b => b.id != bookId);
        renderBooksTable();
        updateStats();
        showToast(`"${title}" removed from catalog`, 'info');
    } else {
        showToast('Failed to delete book', 'error');
    }
};

// ================= UTILITIES =================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}
