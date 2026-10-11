import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { ENV } from './config/env.js';

const app = express();

// Security and middleware setup
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost dev origins or matching client origin
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === ENV.CLIENT_ORIGIN) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Version 1 Mount Point
app.use('/api/v1', routes);

// Root path diagnostic route
app.get('/', (req, res) => {
  res.json({
    name: 'Credit Risk AI Platform Backend',
    version: '1.0.0',
    documentation: '/docs/API_DOCUMENTATION.md',
    status: 'online',
    apiRoot: '/api/v1',
  });
});

// 404 Not Found Handler
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
