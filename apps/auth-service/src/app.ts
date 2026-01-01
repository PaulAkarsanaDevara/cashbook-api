import express from 'express';
import cookieParser from 'cookie-parser';

import { errorHandler } from './shared/error-handler';
import authRoutes from './modules/auth/auth.routes';

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/auth', authRoutes);
app.use(errorHandler);
