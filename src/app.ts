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

// ODSTRAŇTE globální autentizaci
// app.use(authenticate);

setRoutes(app);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Crypto Proxy Service is running on port ${PORT}`);
});