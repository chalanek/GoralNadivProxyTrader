import express from 'express';
import dotenv from 'dotenv';
import { registerRoutes } from './routes/api';
import errorHandler from './middleware/error';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? '3000';

app.use(express.json());
registerRoutes(app);
app.use(errorHandler);

app.listen(Number(PORT), () => {
  console.log(`Crypto Proxy Service is running on port ${PORT}`);
});
