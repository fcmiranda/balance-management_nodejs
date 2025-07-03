import express from 'express';
import { routes } from './routes/index';

const app = express();

app.use(express.json());
app.use('/api', routes);

const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Server Listening on PORT: ${PORT}`);
});