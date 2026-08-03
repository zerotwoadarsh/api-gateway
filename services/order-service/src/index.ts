import express from 'express';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4002;

interface Order {
  id: number;
  item: string;
  status: 'pending' | 'shipped' | 'delivered';
}

const orders: Order[] = [
  { id: 1, item: 'Mechanical Keyboard', status: 'shipped' },
  { id: 2, item: 'Monitor Stand', status: 'pending' },
  { id: 3, item: 'USB-C Hub', status: 'delivered' },
];

app.get('/orders', (_req, res) => {
  res.json(orders);
});

app.get('/orders/:id', (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id));

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json(order);
});

app.listen(PORT, () => {
  console.log(`📦 order-service listening on http://localhost:${PORT}`);
});
