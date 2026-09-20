const express = require('express');
const app = express();
// Changed default port to 4000 to avoid conflict with Tomcat on 3000
const PORT = process.env.PORT || 4000;

app.use(express.json());

let products = [
    { id: 1, name: "AI Smart Refrigerator", category: "Kitchen", price: 1299.99, inStock: true },
    { id: 2, name: "EcoSmart Front-Load Washer", category: "Laundry", price: 899.99, inStock: true },
    { id: 3, name: "Barista Pro Coffee Machine", category: "Kitchen", price: 449.99, inStock: false },
    { id: 4, name: "Robotic Vacuum Cleaner", category: "Cleaning", price: 349.99, inStock: true }
];

let cart = [];

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url}`);
    next();
});

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "Next-Gen Appliances Node API",
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// GET /api/products
app.get('/api/products', (req, res) => {
    const { category } = req.query;
    if (category) {
        const filtered = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
        return res.json({ count: filtered.length, data: filtered });
    }
    res.json({ count: products.length, data: products });
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
});

// POST /api/products
app.post('/api/products', (req, res) => {
    const { name, category, price, inStock } = req.body;
    if (!name || !category || price == null) {
        return res.status(400).json({ error: "Please provide name, category, and price." });
    }

    const newProduct = {
        id: products.length + 1,
        name,
        category,
        price: parseFloat(price),
        inStock: inStock ?? true
    };

    products.push(newProduct);
    res.status(201).json({ message: "Product created successfully", product: newProduct });
});

// DELETE /api/products/:id
app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Product not found" });
    }

    const deleted = products.splice(index, 1);
    res.json({ message: "Product deleted", product: deleted[0] });
});

// GET /api/cart
app.get('/api/cart', (req, res) => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.json({ itemCount: cart.length, totalCost: total.toFixed(2), cart });
});

// POST /api/cart
app.post('/api/cart', (req, res) => {
    const { productId, quantity } = req.body;
    const product = products.find(p => p.id === parseInt(productId));

    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    const cartItem = cart.find(item => item.productId === product.id);
    const qty = parseInt(quantity) || 1;

    if (cartItem) {
        cartItem.quantity += qty;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: qty
        });
    }

    res.status(201).json({ message: "Item added to cart", cart });
});

app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});

app.listen(PORT, () => {
    console.log(`Node API running on http://localhost:${PORT}`);
});