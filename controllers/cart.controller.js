let cart = [];

export const addToCart = (req, res) => {
    const { item } = req.body;

    const existing = cart.find(i => i.id === item.id);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...item, qty: 1 });
    }

    res.json(cart);
};

export const removeFromCart = (req, res) => {
    const { itemId } = req.body;

    const existing = cart.find(i => i.id === itemId);

    if (existing) {
        if (existing.qty === 1) {
            cart = cart.filter(i => i.id !== itemId);
        } else {
            existing.qty--;
        }
    }

    res.json(cart);
};

export const getCart = (req, res) => {
    res.json(cart);
};

export const clearCart = (req, res) => {
    cart = [];
    res.json({ success: true });
};
