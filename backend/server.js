require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDatabase = require('./config/db');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const configuredOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const allowedOrigins = new Set([configuredOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173']);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'fsd-resume-backend' });
});
app.use('/api/auth', authRoutes);
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

async function start() {
  await connectDatabase();
  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => console.log(`Server listening on port ${port}`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error(`Unable to start server: ${error.message}`);
    process.exit(1);
  });
}

module.exports = app;
