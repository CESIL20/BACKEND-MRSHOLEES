export const createOrder = (req, res) => {
    const { customer, cart } = req.body;

    if (!customer || !cart || cart.length === 0) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }

    let message = `🥢 *PEDIDO - MR SHOLEES*\n\n`;
    message += `👤 *Cliente:* ${customer.name}\n`;
    message += `📞 *Teléfono:* ${customer.phone}\n`;
    message += `📍 *Dirección:* ${customer.address}\n`;
    message += `------------------------\n\n`;

    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        message += `*${item.name}* x${item.qty}\n`;
        message += `S/ ${subtotal.toFixed(2)}\n\n`;
    });

    message += `*TOTAL: S/ ${total.toFixed(2)}*\n`;
    message += `🙏 Gracias por su pedido`;

    const phoneNumber = '51934075551'; // TU NÚMERO
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encoded}`;

    res.json({ whatsappUrl });
};
