// ======================
// GLOBAL STATE
// ======================
let cart = [];
let activeCategory = 'populares';

// ======================
// DOM
// ======================
const registerOverlay = document.getElementById('registerOverlay');
const registerBtn = document.getElementById('registerBtn');
const gpsBtn = document.getElementById('gpsBtn');

const menuGrid = document.getElementById('menuGrid');
const categoryButtons = document.querySelectorAll('.category-btn');
const cartBtn = document.getElementById('cartBtn');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const totalAmount = document.getElementById('totalAmount');
const cartBadge = document.getElementById('cartBadge');
const checkoutBtn = document.getElementById('checkoutBtn');

// ======================
// MENU DATA
// ======================
const menuData = {
    populares: [
        { id: 1, name: 'Charsiu', desc: 'Chaufa con panceta de cerdo', price: 28, img: 'img/charsiu.jpg' },
        { id: 2, name: 'Encurtidos', desc: 'Vinagre, sal y especias selectas', price: 25, img: 'img/encurtidos.jpg' },
        { id: 3, name: 'Pollo Chi Jau Kay', desc: 'Pollo crocante con salsa especial', price: 32, img: 'img/frejolito.jpg' },
        { id: 4, name: 'Wantan Frito', desc: 'Con salsa tamarindo', price: 22, img: 'img/wantan.jpg' }
    ],
    tallarines: [
        { id: 5, name: 'Tallarín Saltado', desc: 'Con pollo o carne', price: 24, img: 'img/tallarin.jpg' },
        { id: 6, name: 'Tallarín con Pollo', desc: 'En salsa de ostión', price: 26, img: 'img/tallarin.jpg' },
        { id: 7, name: 'Tallarín Especial', desc: 'Combinado de carnes', price: 28, img: 'img/saltado.jpg' }
    ],
    arroz: [
        { id: 8, name: 'Chaufa de Carne', desc: 'Clásico chaufa peruano', price: 22, img: 'img/chaufa.jpg' },
        { id: 9, name: 'Chaufa Especial', desc: 'Con charsiu y wantan', price: 30, img: 'img/chaufaespecial.jpg' },
        { id: 10, name: 'Chaufa de Champiñones', desc: 'Con champiñones salteados', price: 20, img: 'img/chaufachampiñones.jpg' }
    ],
    bebidas: [
        { id: 11, name: 'Cerveza Oro Liquido', desc: '330ml', price: 20, img: 'img/oro.jpg' },
        { id: 12, name: 'Cerveza La Pelirroja', desc: '375ml', price: 35, img: 'img/pelirroja.jpg' },
        { id: 13, name: 'Pisco Cholo Number Guan', desc: '750ml', price: 180, img: 'img/pisco.jpg' }
    ]
};

// ======================
// INIT
// ======================
document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();

    if (user) {
        hideRegister();
    } else {
        showRegister();
    }

    renderMenu(activeCategory);
    setupEventListeners();
});

// ======================
// REGISTRO
// ======================
registerBtn.addEventListener('click', () => {
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const address = document.getElementById('regAddress').value.trim();

    if (!name || !phone || !address) {
        alert('Completa todos los datos');
        return;
    }

    const user = { name, phone, address };
    localStorage.setItem('mrsholees_user', JSON.stringify(user));

    hideRegister();
});

// GPS
gpsBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('Tu navegador no soporta GPS');
        return;
    }

    gpsBtn.innerText = 'Obteniendo ubicación...';

    navigator.geolocation.getCurrentPosition(
        pos => {
            const { latitude, longitude } = pos.coords;
            document.getElementById('regAddress').value = `📍 ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            gpsBtn.innerText = '📍 Usar mi ubicación';
        },
        () => {
            alert('No se pudo obtener tu ubicación');
            gpsBtn.innerText = '📍 Usar mi ubicación';
        }
    );
});

function showRegister() {
    registerOverlay.classList.remove('hidden');
}

function hideRegister() {
    registerOverlay.classList.add('hidden');
}

// ======================
// EVENTS
// ======================
function setupEventListeners() {
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.category;
            renderMenu(activeCategory);
        });
    });

    cartBtn.addEventListener('click', () => {
        const user = getUser();
        if (!user) {
            showRegister();
            return;
        }
        cartOverlay.classList.add('active');
    });

    closeCart.addEventListener('click', () => cartOverlay.classList.remove('active'));
    checkoutBtn.addEventListener('click', sendWhatsAppOrder);
}

// ======================
// MENU RENDER
// ======================
function renderMenu(category) {
    const items = menuData[category];
    menuGrid.innerHTML = items.map(item => `
        <div class="menu-item">
            <img src="${item.img}" onerror="this.src='img/placeholder.jpg'">
            <h3>${item.name}</h3>
            <p>${item.desc}</p>
            <div class="menu-bottom">
                <span class="price">S/ ${item.price}</span>
                <button onclick="addToCart(${item.id})">🛒 Agregar</button>
            </div>
        </div>
    `).join('');
}

// ======================
// CART LOGIC
// ======================
function addToCart(id) {
    const user = getUser();
    if (!user) {
        showRegister();
        return;
    }

    let item;
    for (const cat in menuData) {
        const found = menuData[cat].find(i => i.id === id);
        if (found) item = found;
    }

    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty++;
    else cart.push({ ...item, qty: 1 });

    updateCart();
}

function updateCart() {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const count = cart.reduce((s, i) => s + i.qty, 0);

    totalAmount.textContent = `S/ ${total.toFixed(2)}`;
    cartBadge.textContent = count;

    cartItems.innerHTML = cart.map(i => `
        <div class="cart-item">
            <img src="${i.img}" onerror="this.src='img/placeholder.jpg'">
            <div class="cart-info">
                <strong>${i.name}</strong>
                <span>S/ ${(i.price * i.qty).toFixed(2)}</span>
                <div class="cart-controls">
                    <button onclick="changeQty(${i.id}, -1)">−</button>
                    <span>${i.qty}</span>
                    <button onclick="changeQty(${i.id}, 1)">+</button>
                    <button onclick="deleteItem(${i.id})">✖</button>
                </div>
            </div>
        </div>
    `).join('');
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);

    updateCart();
}

function deleteItem(id) {
    cart = cart.filter(i => i.id !== id);
    updateCart();
}

// ======================
// WHATSAPP
// ======================
function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }

    const user = getUser();
    if (!user) {
        showRegister();
        return;
    }

    let message = `🧾 *Pedido MR SHOLEES*%0A`;
    message += `👤 ${user.name}%0A📞 ${user.phone}%0A📍 ${user.address}%0A%0A`;

    cart.forEach(i => {
        message += `• ${i.qty} x ${i.name} - S/ ${(i.price * i.qty).toFixed(2)}%0A`;
    });

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    message += `%0A*Total: S/ ${total.toFixed(2)}*`;

    const phoneNumber = '51999999999'; // CAMBIA A TU NUMERO
    const url = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(url, '_blank');

    cart = [];
    updateCart();
    cartOverlay.classList.remove('active');
}

// ======================
// UTILS
// ======================
function getUser() {
    return JSON.parse(localStorage.getItem('mrsholees_user'));
}

// LOGOUT PRO
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('mrsholees_user');
    localStorage.removeItem('cart');
    location.reload();
});
const continueBtn = document.getElementById('continueBtn');
// close cart overlay
if (continueBtn) {
    continueBtn.addEventListener('click', () => {
        cartOverlay.classList.remove('active');
    });
}
