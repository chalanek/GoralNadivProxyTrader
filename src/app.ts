import express from 'express';
import { json } from 'body-parser';
import { setRoutes } from './routes/api';
import errorHandler from './middleware/error';
import { authenticate } from './middleware/auth';
import config from './config/index';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = config.PORT || 3000;

app.use(json());

// Public liveness probe for the external keep-warm ping (cron-job.org).
// Registered BEFORE the global auth middleware so it needs no API key, and it
// never calls Binance. Any inbound request also wakes the Render free instance.
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use(authenticate);
setRoutes(app);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Crypto Proxy Service is running on port ${PORT}`);
});