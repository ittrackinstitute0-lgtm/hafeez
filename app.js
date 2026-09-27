// ==========================================================
// KITABGHAR STOREFRONT APPLICATION LOGIC (app.js)
// ==========================================================

// Global State
let allBooks = [];
let filteredBooks = [];
let currentCategory = 'all';
let currentSort = 'featured';
let searchQuery = '';
let activeQuickViewBook = null;
let quickViewQty = 1;

// Cart State (stored in localStorage)
let cart = JSON.parse(localStorage.getItem('kitabghar_cart') || '[]');
let appliedPromo = null; // { code: 'KITAB10', discountPercent: 10 }

// DOM Elements
const booksGrid = document.getElementById('booksGrid');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const categoryChips = document.getElementById('categoryChips');
const cartBadge = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const cartBackdrop = document.getElementById('cartBackdrop');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsList = document.getElementById('cartItemsList');
const cartDrawerCount = document.getElementById('cartDrawerCount');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartShipping = document.getElementById('cartShipping');
const cartDiscount = document.getElementById('cartDiscount');
const discountRow = document.getElementById('discountRow');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const promoInput = document.getElementById('promoInput');
const applyPromoBtn = document.getElementById('applyPromoBtn');

// Modals
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');
const orderSuccessModal = document.getElementById('orderSuccessModal');
const closeSuccessBtn = document.getElementById('closeSuccessBtn');
const trackingModal = document.getElementById('trackingModal');
const openTrackBtn = document.getElementById('openTrackBtn');
const heroTrackBtn = document.getElementById('heroTrackBtn');
const closeTrackModalBtn = document.getElementById('closeTrackModalBtn');
const searchOrderBtn = document.getElementById('searchOrderBtn');
const trackSearchInput = document.getElementById('trackSearchInput');
const trackingResult = document.getElementById('trackingResult');

// Quick View Modal Elements
const quickViewModal = document.getElementById('quickViewModal');
const closeQuickViewBtn = document.getElementById('closeQuickViewBtn');
const qvImage = document.getElementById('qvImage');
const qvCategory = document.getElementById('qvCategory');
const qvBookTitle = document.getElementById('qvBookTitle');
const qvAuthor = document.getElementById('qvAuthor');
const qvRating = document.getElementById('qvRating');
const qvPrice = document.getElementById('qvPrice');
const qvOldPrice = document.getElementById('qvOldPrice');
const qvDescription = document.getElementById('qvDescription');
const qvQtyVal = document.getElementById('qvQtyVal');
const qvDecQty = document.getElementById('qvDecQty');
const qvIncQty = document.getElementById('qvIncQty');
const qvAddToCartBtn = document.getElementById('qvAddToCartBtn');

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', async () => {
    initEventListeners();
    updateCartUI();
    await checkDatabaseAndLoadBooks();
});

// Check Supabase health & load catalog
async function checkDatabaseAndLoadBooks() {
    const statusText = document.getElementById('dbStatusText');
    const setupLink = document.getElementById('dbSetupLink');

    try {
        const health = await window.dbService.checkConnection();
        if (health.connected) {
            statusText.innerHTML = `<span class="dot green"></span> <span>Live Supabase Database Connected & Synced</span>`;
            setupLink.style.display = 'none';
        } else {
            statusText.innerHTML = `<span class="dot amber"></span> <span>Supabase tables not detected yet. Running in fallback mode.</span>`;
            setupLink.style.display = 'inline-block';
        }
    } catch (err) {
        statusText.innerHTML = `<span class="dot amber"></span> <span>Local Mode Active</span>`;
    }

    // Fetch books
    const result = await window.dbService.getBooks();
    allBooks = result.data || [];
    renderBooks();
}

// ================= EVENT LISTENERS =================
function initEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderBooks();
    });

    // Sorting
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderBooks();
    });

    // Category Chips
    categoryChips.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip-btn');
        if (!btn) return;
        categoryChips.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        renderBooks();
    });

    // Cart Drawer Controls
    openCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartBackdrop.addEventListener('click', closeCart);

    // Apply Promo Code
    applyPromoBtn.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        if (code === 'KITAB10') {
            appliedPromo = { code: 'KITAB10', discountPercent: 10 };
            showToast('Promo code applied: 10% Discount!', 'success');
        } else if (code === 'KITAB20') {
            appliedPromo = { code: 'KITAB20', discountPercent: 20 };
            showToast('Special Promo applied: 20% Discount!', 'success');
        } else if (code === '') {
            appliedPromo = null;
        } else {
            showToast('Invalid promo code. Try KITAB10', 'error');
            appliedPromo = null;
        }
        updateCartUI();
    });

    // Checkout Modal
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Your cart is empty! Add books to proceed.', 'error');
            return;
        }
        closeCart();
        openCheckoutModal();
    });

    closeCheckoutBtn.addEventListener('click', closeCheckoutModal);

    // Checkout Payment Method change highlights
    const payInputs = document.querySelectorAll('input[name="paymentMethod"]');
    payInputs.forEach(input => {
        input.addEventListener('change', () => {
            document.querySelectorAll('.payment-label').forEach(lbl => lbl.classList.remove('selected'));
            input.closest('.payment-label').classList.add('selected');
        });
    });

    // Checkout Form Submit
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);

    // Order Tracking Modal
    openTrackBtn.addEventListener('click', openTrackModal);
    heroTrackBtn.addEventListener('click', openTrackModal);
    closeTrackModalBtn.addEventListener('click', closeTrackModal);
    searchOrderBtn.addEventListener('click', handleTrackSearch);
    trackSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleTrackSearch();
        }
    });

    // Order Success Modal
    closeSuccessBtn.addEventListener('click', () => {
        orderSuccessModal.classList.remove('active');
    });

    document.getElementById('trackThisOrderBtn').addEventListener('click', () => {
        orderSuccessModal.classList.remove('active');
        openTrackModal();
        const orderId = document.getElementById('successOrderId').textContent;
        trackSearchInput.value = orderId;
        handleTrackSearch();
    });

    // Quick View Controls
    closeQuickViewBtn.addEventListener('click', () => {
        quickViewModal.classList.remove('active');
    });

    qvDecQty.addEventListener('click', () => {
        if (quickViewQty > 1) {
            quickViewQty--;
            qvQtyVal.textContent = quickViewQty;
        }
    });

    qvIncQty.addEventListener('click', () => {
        quickViewQty++;
        qvQtyVal.textContent = quickViewQty;
    });

    qvAddToCartBtn.addEventListener('click', () => {
        if (activeQuickViewBook) {
            addToCart(activeQuickViewBook.id, quickViewQty);
            quickViewModal.classList.remove('active');
        }
    });
}

// Global category filter shortcut (used in footer)
window.filterCategory = function(cat) {
    currentCategory = cat;
    categoryChips.querySelectorAll('.chip-btn').forEach(btn => {
        if (btn.dataset.category === cat) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    renderBooks();
};

// ================= RENDER BOOKS CATALOG =================
function renderBooks() {
    let list = [...allBooks];

    // Filter by Category
    if (currentCategory !== 'all') {
        list = list.filter(book => book.category && book.category.toLowerCase() === currentCategory.toLowerCase());
    }

    // Filter by Search
    if (searchQuery) {
        list = list.filter(book => {
            const title = (book.title || '').toLowerCase();
            const author = (book.author || '').toLowerCase();
            const category = (book.category || '').toLowerCase();
            const desc = (book.description || '').toLowerCase();
            return title.includes(searchQuery) || author.includes(searchQuery) || category.includes(searchQuery) || desc.includes(searchQuery);
        });
    }

    // Sort
    if (currentSort === 'price-low') {
        list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (currentSort === 'price-high') {
        list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (currentSort === 'rating') {
        list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (currentSort === 'name') {
        list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (currentSort === 'featured') {
        list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    filteredBooks = list;

    if (list.length === 0) {
        booksGrid.innerHTML = `
            <div class="no-results">
                <i class="fa-solid fa-book-bookmark"></i>
                <h3>No Books Found</h3>
                <p>Try searching for a different title, author, or category.</p>
            </div>
        `;
        return;
    }

    booksGrid.innerHTML = list.map(book => {
        const discountBadge = book.old_price && book.old_price > book.price 
            ? `<div class="book-badge">${Math.round(((book.old_price - book.price) / book.old_price) * 100)}% OFF</div>`
            : (book.is_featured ? `<div class="book-badge">Popular</div>` : '');

        const safeImg = book.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';

        return `
            <div class="book-card" data-id="${book.id}">
                ${discountBadge}
                <div class="book-image-wrap" onclick="openQuickView('${book.id}')">
                    <img src="${safeImg}" alt="${escapeHtml(book.title)}" class="book-image" loading="lazy">
                    <button class="quick-view-btn" onclick="event.stopPropagation(); openQuickView('${book.id}')">
                        <i class="fa-solid fa-eye"></i> Quick View
                    </button>
                </div>
                <div class="book-info">
                    <span class="book-category">${escapeHtml(book.category || 'General')}</span>
                    <h3 class="book-title" title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</h3>
                    <p class="book-author">By ${escapeHtml(book.author || 'Unknown')}</p>
                    <div class="book-rating">
                        <i class="fa-solid fa-star"></i>
                        <span>${book.rating ? Number(book.rating).toFixed(1) : '4.8'}</span>
                    </div>
                    <div class="book-footer">
                        <div class="price-wrap">
                            <span class="current-price">Rs. ${Number(book.price).toLocaleString()}</span>
                            ${book.old_price ? `<span class="old-price">Rs. ${Number(book.old_price).toLocaleString()}</span>` : ''}
                        </div>
                        <button class="btn-add-cart" onclick="addToCart('${book.id}', 1)" title="Add to Cart">
                            <i class="fa-solid fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ================= QUICK VIEW MODAL =================
window.openQuickView = function(bookId) {
    const book = allBooks.find(b => b.id == bookId);
    if (!book) return;

    activeQuickViewBook = book;
    quickViewQty = 1;
    qvQtyVal.textContent = "1";

    qvTitle.textContent = book.title;
    qvBookTitle.textContent = book.title;
    qvAuthor.textContent = book.author || 'Unknown';
    qvCategory.textContent = book.category || 'Literature';
    qvRating.textContent = book.rating ? Number(book.rating).toFixed(1) : '4.9';
    qvPrice.textContent = `Rs. ${Number(book.price).toLocaleString()}`;
    qvOldPrice.textContent = book.old_price ? `Rs. ${Number(book.old_price).toLocaleString()}` : '';
    qvDescription.textContent = book.description || 'Delve into this captivating and enriching book, carefully printed on superior quality paper with crisp typography.';
    qvImage.src = book.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';

    quickViewModal.classList.add('active');
};

// ================= SHOPPING CART LOGIC =================
window.addToCart = function(bookId, quantity = 1) {
    const book = allBooks.find(b => b.id == bookId);
    if (!book) return;

    const existingIndex = cart.findIndex(item => item.id == bookId);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: book.id,
            title: book.title,
            price: Number(book.price),
            image_url: book.image_url,
            category: book.category,
            quantity: quantity
        });
    }

    saveCart();
    updateCartUI();
    showToast(`Added "${book.title}" to cart!`, 'success');
};

function updateCartQuantity(bookId, delta) {
    const item = cart.find(i => i.id == bookId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(bookId);
        return;
    }

    saveCart();
    updateCartUI();
}

function removeFromCart(bookId) {
    cart = cart.filter(i => i.id != bookId);
    saveCart();
    updateCartUI();
    showToast('Item removed from cart', 'info');
}

function saveCart() {
    localStorage.setItem('kitabghar_cart', JSON.stringify(cart));
}

function calculateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Free shipping above Rs. 1500
    const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 199;
    
    let discount = 0;
    if (appliedPromo && appliedPromo.discountPercent) {
        discount = Math.round((subtotal * appliedPromo.discountPercent) / 100);
    }

    const total = Math.max(0, subtotal + shipping - discount);

    return { subtotal, shipping, discount, total };
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
    cartBadge.textContent = totalItems;
    cartDrawerCount.textContent = totalItems;

    const { subtotal, shipping, discount, total } = calculateCartTotals();

    cartSubtotal.textContent = `Rs. ${subtotal.toLocaleString()}`;
    cartShipping.textContent = shipping === 0 ? 'FREE' : `Rs. ${shipping}`;
    cartTotal.textContent = `Rs. ${total.toLocaleString()}`;

    if (discount > 0) {
        discountRow.style.display = 'flex';
        cartDiscount.textContent = `-Rs. ${discount.toLocaleString()} (${appliedPromo.code})`;
    } else {
        discountRow.style.display = 'none';
    }

    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="cart-empty">
                <i class="fa-solid fa-cart-arrow-down"></i>
                <h4>Your Cart is Empty</h4>
                <p>Browse our catalog to add your favorite books!</p>
            </div>
        `;
    } else {
        cartItemsList.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}" class="cart-item-img" alt="${escapeHtml(item.title)}">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${escapeHtml(item.title)}</h4>
                    <div class="cart-item-price">Rs. ${item.price.toLocaleString()}</div>
                    <div class="cart-item-actions">
                        <div class="qty-control">
                            <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                        </div>
                        <button class="btn-remove-item" onclick="removeFromCart('${item.id}')" title="Remove">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function openCart() {
    cartBackdrop.classList.add('active');
    cartDrawer.classList.add('active');
}

function closeCart() {
    cartBackdrop.classList.remove('active');
    cartDrawer.classList.remove('active');
}

// ================= CHECKOUT & ORDER SUBMISSION =================
function openCheckoutModal() {
    const { total } = calculateCartTotals();
    checkoutTotalAmount.textContent = `Rs. ${total.toLocaleString()}`;
    checkoutModal.classList.add('active');
}

function closeCheckoutModal() {
    checkoutModal.classList.remove('active');
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const city = document.getElementById('custCity').value;
    const address = document.getElementById('custAddress').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    const notes = document.getElementById('custNotes').value.trim();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    if (!name || !phone || !city || !address) {
        showToast('Please fill in all required fields (*)', 'error');
        return;
    }

    const { subtotal, shipping, discount, total } = calculateCartTotals();

    // Generate unique order ID e.g. ORD-68421
    const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);

    const submitBtn = document.getElementById('submitOrderBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Order...`;

    const orderPayload = {
        id: orderId,
        customer_name: name,
        customer_phone: phone,
        customer_email: email || null,
        city: city,
        shipping_address: address,
        payment_method: paymentMethod,
        notes: notes || null,
        items: cart,
        subtotal: subtotal,
        shipping_fee: shipping,
        discount: discount,
        total_amount: total,
        status: 'Pending',
        created_at: new Date().toISOString()
    };

    try {
        const res = await window.dbService.createOrder(orderPayload);
        if (res.success) {
            // Clear cart
            cart = [];
            appliedPromo = null;
            saveCart();
            updateCartUI();

            closeCheckoutModal();
            checkoutForm.reset();

            // Populate success modal
            document.getElementById('successOrderId').textContent = orderId;
            document.getElementById('successOrderDetails').innerHTML = `
                <div class="receipt-row"><span>Customer:</span> <strong>${escapeHtml(name)}</strong></div>
                <div class="receipt-row"><span>Phone:</span> <strong>${escapeHtml(phone)}</strong></div>
                <div class="receipt-row"><span>City & Address:</span> <strong>${escapeHtml(city)}, ${escapeHtml(address)}</strong></div>
                <div class="receipt-row"><span>Payment:</span> <strong>${paymentMethod}</strong></div>
                <div class="receipt-row"><span>Total Payable:</span> <strong style="color:var(--primary); font-size:1.05rem;">Rs. ${total.toLocaleString()}</strong></div>
            `;

            orderSuccessModal.classList.add('active');
            showToast('Order confirmed successfully!', 'success');
        } else {
            showToast('Could not save order. Please try again.', 'error');
        }
    } catch (err) {
        console.error("Order submission error:", err);
        showToast('An unexpected error occurred while placing order.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-check-circle"></i> Place Order Now (آرڈر کنفرم کریں)`;
    }
}

// ================= ORDER TRACKING =================
window.openTrackModal = function() {
    trackingModal.classList.add('active');
    trackSearchInput.focus();
};

function closeTrackModal() {
    trackingModal.classList.remove('active');
}

async function handleTrackSearch() {
    const query = trackSearchInput.value.trim();
    if (!query) {
        showToast('Please enter Order ID or Phone number', 'info');
        return;
    }

    trackingResult.innerHTML = `
        <div style="text-align: center; padding: 30px;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--primary);"></i>
            <p style="margin-top: 10px; color: var(--slate-600);">Searching order records...</p>
        </div>
    `;

    try {
        const { data } = await window.dbService.searchOrder(query);

        if (!data || data.length === 0) {
            trackingResult.innerHTML = `
                <div style="text-align:center; padding: 25px; color: var(--slate-600);">
                    <i class="fa-regular fa-circle-question" style="font-size: 2.2rem; color: var(--warning); margin-bottom: 10px;"></i>
                    <h4>No Order Found</h4>
                    <p style="font-size: 0.88rem;">We could not find any order matching "<strong>${escapeHtml(query)}</strong>". Please verify your Order ID or phone number.</p>
                </div>
            `;
            return;
        }

        const order = data[0];
        const status = order.status || 'Pending';

        // Steps mapping
        const steps = [
            { key: 'Pending', label: 'Order Placed', desc: 'Order received in system' },
            { key: 'Confirmed', label: 'Confirmed', desc: 'Verified and queued for dispatch' },
            { key: 'Processing', label: 'Packed & Dispatched', desc: 'Courier rider on the way' },
            { key: 'Delivered', label: 'Delivered', desc: 'Successfully delivered to customer' }
        ];

        const statusIdx = steps.findIndex(s => s.key.toLowerCase() === status.toLowerCase());
        const currentIdx = statusIdx === -1 ? 0 : statusIdx;

        const isCancelled = status.toLowerCase() === 'cancelled';

        let timelineHtml = '';
        if (isCancelled) {
            timelineHtml = `
                <div style="background: var(--danger-light); color: var(--danger); padding: 14px; border-radius: var(--radius-md); text-align: center; font-weight: 700; margin: 16px 0;">
                    <i class="fa-solid fa-triangle-exclamation"></i> This order has been CANCELLED.
                </div>
            `;
        } else {
            timelineHtml = `
                <div class="timeline">
                    ${steps.map((step, idx) => {
                        let stateClass = '';
                        if (idx < currentIdx) stateClass = 'completed';
                        else if (idx === currentIdx) stateClass = 'active';

                        const icon = idx < currentIdx ? '<i class="fa-solid fa-check"></i>' : (idx + 1);

                        return `
                            <div class="timeline-step ${stateClass}">
                                <div class="timeline-icon">${icon}</div>
                                <div class="timeline-info">
                                    <h5>${step.label}</h5>
                                    <p>${step.desc}</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        const itemsSummary = (Array.isArray(order.items) ? order.items : [])
            .map(i => `${escapeHtml(i.title)} (x${i.quantity})`)
            .join(', ');

        trackingResult.innerHTML = `
            <div style="background: white; border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--slate-200); padding-bottom: 10px;">
                    <div>
                        <span style="font-weight: 800; color: var(--primary); font-size: 1.05rem;">${order.id}</span>
                        <div style="font-size: 0.78rem; color: var(--slate-500);">${new Date(order.created_at).toLocaleString()}</div>
                    </div>
                    <span style="padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 700; background: ${getStatusBadgeBg(order.status)}; color: ${getStatusBadgeColor(order.status)}">
                        ${order.status}
                    </span>
                </div>

                ${timelineHtml}

                <div class="receipt-summary" style="margin-top: 16px;">
                    <div class="receipt-row"><span>Customer:</span> <strong>${escapeHtml(order.customer_name)}</strong></div>
                    <div class="receipt-row"><span>Destination:</span> <strong>${escapeHtml(order.city || '')}</strong></div>
                    <div class="receipt-row"><span>Items:</span> <span>${itemsSummary || 'Books'}</span></div>
                    <div class="receipt-row" style="margin-top: 6px; border-top: 1px dashed var(--slate-300); padding-top: 6px;">
                        <span>Total Bill:</span> <strong style="color: var(--primary);">Rs. ${Number(order.total_amount).toLocaleString()}</strong>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        trackingResult.innerHTML = `<p style="color:var(--danger); text-align:center;">Failed to query order.</p>`;
    }
}

function getStatusBadgeBg(status) {
    switch ((status || '').toLowerCase()) {
        case 'delivered': return 'var(--success-light)';
        case 'confirmed': return '#dbeafe';
        case 'processing':
        case 'shipped': return '#fef3c7';
        case 'cancelled': return 'var(--danger-light)';
        default: return '#f1f5f9';
    }
}

function getStatusBadgeColor(status) {
    switch ((status || '').toLowerCase()) {
        case 'delivered': return 'var(--success)';
        case 'confirmed': return '#1d4ed8';
        case 'processing':
        case 'shipped': return '#b45309';
        case 'cancelled': return 'var(--danger)';
        default: return 'var(--slate-700)';
    }
}

// ================= TOAST NOTIFICATION HELPER =================
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

// Helper to escape HTML characters
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
