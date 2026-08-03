import express from 'express';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4001;

interface User {
  id: number;
  name: string;
}

// In-memory data — this service only exists so the gateway has
// something real to route to during local development.
const users: User[] = [
  { id: 1, name: 'Ada Lovelace' },
  { id: 2, name: 'Grace Hopper' },
  { id: 3, name: 'Alan Turing' },
];

app.get('/users', (_req, res) => {
  res.json(users);
});

app.get('/users/:id', (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id));

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
});

app.listen(PORT, () => {
  console.log(`👤 user-service listening on http://localhost:${PORT}`);
});
