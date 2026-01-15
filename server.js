const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;
const ORDERS_FILE = './orders.json';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let orders = [];
if (fs.existsSync(ORDERS_FILE)) {
    orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
}

// =====================
// AUTH MIDDLEWARE
// =====================
function adminAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || auth !== 'Basic ' + Buffer.from('admin:1234').toString('base64')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
        return res.status(401).send('Acceso restringido');
    }
    next();
}

// =====================
// ROOT
// =====================
app.get('/', (req, res) => {
    res.send('🔥 MR SHOLEES Backend PRO activo');
});

// =====================
// CHECKOUT
// =====================
app.post('/api/order/checkout', (req, res) => {
    const { customer, cart } = req.body;
    if (!customer || !cart || cart.length === 0) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }

    const order = {
        id: Date.now(),
        customer,
        cart,
        status: 'pendiente',
        date: new Date().toLocaleString()
    };

    orders.push(order);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));

    const phoneNumber = '51934075551';
    const message = formatMessage(customer, cart);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    res.json({ whatsappUrl });
});

// =====================
// ADMIN API
// =====================
app.get('/api/admin/orders', adminAuth, (req, res) => {
    res.json(orders);
});

app.post('/api/admin/status', adminAuth, (req, res) => {
    const { id, status } = req.body;
    orders = orders.map(o => o.id === id ? { ...o, status } : o);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    res.json({ ok: true });
});

app.delete('/api/admin/order/:id', adminAuth, (req, res) => {
    const id = parseInt(req.params.id);
    orders = orders.filter(o => o.id !== id);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    res.json({ ok: true });
});

// =====================
// DASHBOARD
// =====================
app.get('/api/admin/stats', adminAuth, (req, res) => {
    let totalSales = 0;
    let products = {};

    orders.forEach(o => {
        o.cart.forEach(i => {
            totalSales += i.price * i.qty;
            products[i.name] = (products[i.name] || 0) + i.qty;
        });
    });

    res.json({
        totalOrders: orders.length,
        totalSales,
        topProducts: products
    });
});

// =====================
function formatMessage(customer, cart) {
    let message = `🥢 *PEDIDO - MR SHOLEES*\n\n`;
    message += `👤 ${customer.name}\n📞 ${customer.phone}\n📍 ${customer.address}\n\n`;
    cart.forEach(i => {
        message += `${i.name} x${i.qty} - S/ ${(i.price * i.qty).toFixed(2)}\n`;
    });
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    message += `\n*TOTAL: S/ ${total.toFixed(2)}*`;
    return encodeURIComponent(message);
}

// =====================
app.listen(PORT, () => {
    console.log(`🔥 Backend PRO en http://localhost:${PORT}`);
});
