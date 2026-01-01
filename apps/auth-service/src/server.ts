import path from 'path';

import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

import { app } from './app';
import { connectDB } from './config/database';
import { env } from './config/env';

(async () => {
  await connectDB();
  app.listen(env.port, () => console.log(`Auth Service running on port ${env.port}`));
})();
