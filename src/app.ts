import express from 'express';
import dotenv from 'dotenv';
import { registerRoutes } from './routes/api';
import errorHandler from './middleware/error';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? '3000';

app.use(express.json());

// Public liveness probe for the external keep-warm ping (cron-job.org).
// Registered before the application routes so it requires no auth, and it
// never calls Binance. Any inbound request also wakes the Render free instance.
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

registerRoutes(app);
app.use(errorHandler);

app.listen(Number(PORT), () => {
  console.log(`Crypto Proxy Service is running on port ${PORT}`);
});
