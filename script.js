// ──────────────────────────────────────────────
//  DATA & STATE
// ──────────────────────────────────────────────

let products = [];
let cart = [];
let currentUser = null;
let isAdmin = false;

function generateProducts() {
    const categories = ['Wine', 'Clothes', 'Accessories', 'Electronics'];
    const baseNames = {
        Wine:       ['Merlot', 'Cabernet', 'Pinot Noir', 'Chardonnay', 'Sauvignon'],
        Clothes:    ['Hoodie', 'Jeans', 'T-Shirt', 'Jacket', 'Dress'],
        Accessories:['Necklace', 'Wallet', 'Sunglasses', 'Watch', 'Bag'],
        Electronics:['Speaker', 'Charger', 'Earphones', 'Mouse', 'Cable']
    };

    products = [];
    for (let i = 1; i <= 100; i++) {
        const catIdx = (i - 1) % 4;
        const category = categories[catIdx];
        const nameBase = baseNames[category][i % 5];
        const price = (Math.random() * 38 + 5.99).toFixed(2);

        products.push({
            id: i,
            name: `${nameBase} ${category} #${Math.floor((i-1)/5)+1}`,
            price: parseFloat(price),
            category,
            image: `https://picsum.photos/id/${(i + 120) % 200 + 10}/400/400`,
            sold: Math.floor(Math.random() * 1200) + 80
        });
    }
}

// ──────────────────────────────────────────────
//  RENDER FUNCTIONS
// ──────────────────────────────────────────────

function renderProducts(filtered = products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer';
        card.innerHTML = `
            <img src="${p.image}" alt="${p.name}" class="w-full h-48 sm:h-56 object-cover">
            <div class="p-4">
                <div class="text-sm text-orange-400">${p.category}</div>
                <div class="font-semibold text-base sm:text-lg mt-1 line-clamp-2">${p.name}</div>
                <div class="mt-2 flex justify-between items-end">
                    <div class="text-2xl font-bold">$${p.price.toFixed(2)}</div>
                    <div class="text-xs text-zinc-500">${p.sold} sold</div>
                </div>
                <button onclick="addToCart(${p.id});event.stopPropagation()"
                        class="mt-4 w-full bg-white text-black hover:bg-orange-500 py-3 rounded-xl font-semibold transition">
                    Add to Cart
                </button>
            </div>
        `;
        card.onclick = () => alert(`Selected: ${p.name} – $${p.price}`);
        grid.appendChild(card);
    });
}

function renderFlashDeals() {
    const container = document.getElementById('flashDeals');
    if (!container) return;
    container.innerHTML = '';

    products.slice(0, 8).forEach(p => {
        const div = document.createElement('div');
        div.className = 'bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer';
        div.innerHTML = `
            <img src="${p.image}" class="w-full h-40 sm:h-48 object-cover">
            <div class="p-4">
                <div class="text-red-500 text-sm font-bold">-${Math.floor(Math.random()*40+15)}%</div>
                <div class="font-medium text-base line-clamp-1">${p.name}</div>
                <div class="text-xl font-bold mt-1">$${p.price.toFixed(2)}</div>
            </div>
        `;
        div.onclick = () => { addToCart(p.id); showPage('shop'); };
        container.appendChild(div);
    });
}

function renderCart() {
    const container = document.getElementById('cartItems');
    if (!container) return;
    container.innerHTML = cart.length === 0
        ? '<div class="text-center py-12 text-zinc-400 text-xl">Your cart is empty</div>'
        : '';

    cart.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'flex gap-4 bg-zinc-800 rounded-2xl p-4';
        div.innerHTML = `
            <img src="${item.image}" class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl">
            <div class="flex-1">
                <div class="font-semibold text-base sm:text-lg">${item.name}</div>
                <div class="text-orange-400 text-sm">${item.category}</div>
                <div class="mt-2 flex justify-between items-center">
                    <div class="text-xl font-bold">$${item.price.toFixed(2)}</div>
                    <button onclick="removeFromCart(${idx});event.stopPropagation()"
                            class="text-red-400 hover:text-red-300 text-sm">Remove</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById('modalCartCount').textContent = cart.length;
    document.getElementById('cartTotal').textContent =
        '$' + cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
}

// ──────────────────────────────────────────────
//  CART & UI LOGIC
// ──────────────────────────────────────────────

function addToCart(id) {
    const prod = products.find(p => p.id === id);
    if (prod) {
        cart.push({ ...prod });
        updateCartCount();
        alert(`Added: ${prod.name}`);
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    updateCartCount();
}

function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.length;
}

function toggleCart() {
    const m = document.getElementById('cartModal');
    if (m.classList.contains('hidden')) {
        renderCart();
        m.classList.remove('hidden');
    } else {
        m.classList.add('hidden');
    }
}

// ──────────────────────────────────────────────
//  AUTH
// ──────────────────────────────────────────────

function showAccountModal() {
    if (currentUser) {
        alert(`Logged in as: ${currentUser.username}${isAdmin ? ' (ADMIN)' : ''}`);
        return;
    }
    document.getElementById('accountModal').classList.remove('hidden');
}

function hideAccountModal() {
    document.getElementById('accountModal').classList.add('hidden');
}

function switchToSignup() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Sign Up';
}

function switchToLogin() {
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Sign In';
}

function handleLogin() {
    const u = document.getElementById('loginUsername').value.trim();
    const p = document.getElementById('loginPassword').value;

    if (u.toUpperCase() === 'ADMIN' && p === '333222osK$') {
        currentUser = { username: 'ADMIN' };
        isAdmin = true;
        document.getElementById('userDisplay').textContent = 'ADMIN';
        hideAccountModal();
        alert('ADMIN logged in');
        return;
    }

    if (u && p) {
        currentUser = { username: u };
        document.getElementById('userDisplay').textContent = u;
        hideAccountModal();
        alert(`Welcome, ${u}!`);
    } else {
        alert('Fill username & password');
    }
}

function handleSignup() {
    const u = document.getElementById('signupUsername').value.trim();
    if (u) {
        currentUser = { username: u };
        document.getElementById('userDisplay').textContent = u;
        hideAccountModal();
        alert(`Account created – welcome ${u}!`);
    }
}

function quickAdminLogin() {
    document.getElementById('loginUsername').value = 'ADMIN';
    document.getElementById('loginPassword').value = '333222osK$';
    handleLogin();
}

// ──────────────────────────────────────────────
//  PAGE & FILTER
// ──────────────────────────────────────────────

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(el => el.classList.add('hidden'));
    const page = document.getElementById(pageId + 'Page');
    if (page) page.classList.remove('hidden');
}

function filterByCategory(cat) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toUpperCase() === cat.toUpperCase());
    });

    if (cat === 'All') {
        renderProducts();
    } else {
        renderProducts(products.filter(p => p.category === cat));
    }
}

function performSearch() {
    const term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if (!term) {
        showPage('shop');
        renderProducts();
        return;
    }
    const results = products.filter(p =>
        p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
    );
    showPage('shop');
    renderProducts(results);
}

function proceedToCheckout() {
    if (cart.length === 0) return alert('Cart is empty');
    if (!currentUser) return alert('Please log in first');
    alert(`Thank you ${currentUser.username}!\nTotal: $${cart.reduce((s,i)=>s+i.price,0).toFixed(2)}\n\n(Fake payment successful)`);
    cart = [];
    updateCartCount();
    toggleCart();
}

// ──────────────────────────────────────────────
//  INIT
// ──────────────────────────────────────────────

function init() {
    generateProducts();
    renderProducts();
    renderFlashDeals();
    showPage('home');
    console.log("SHOPPY ready – 100 products loaded");
}

window.addEventListener('load', init);