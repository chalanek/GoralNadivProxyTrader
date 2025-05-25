import express from 'express';
import { json } from 'body-parser';
import { setRoutes } from './routes/api';
import errorHandler from './middleware/error';
import dotenv from 'dotenv';
import cors from 'cors';

// Načtěte proměnné prostředí ze souboru .env
dotenv.config();

const app = express();
// Použijte Number() pro převod na číslo a zajistěte, že použijete číselnou hodnotu
const PORT = Number(process.env.PORT) || 3000;

console.log(`Server will listen on port ${PORT}`);

// Middlewares
app.use(json());
app.use(cors());

setRoutes(app);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Crypto Proxy Service is running on host 0.0.0.0, port ${PORT}`);
});

export default app;