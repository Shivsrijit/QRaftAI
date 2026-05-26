import app from './app';
import { config } from './config/env';
import { connectDB } from './config/db';
import { initializeQueue } from './services/queue.service';
import { initializeWebSocketServer } from './ws/websocket';
import { processAssignmentGeneration } from './workers/generation.worker';

async function bootstrap() {
  console.log('Starting VedaAI Assessment Creator Backend bootstrap...');

  // 1. Establish Database Connection (Mongoose + dynamic in-memory Mongo fallback)
  await connectDB();

  // 2. Initialize background BullMQ / In-Memory Generation Queue
  await initializeQueue(processAssignmentGeneration);

  // 3. Start HTTP Server
  const server = app.listen(config.PORT, () => {
    console.log(`HTTP Express Server listening at: http://localhost:${config.PORT}`);
  });

  // 4. Initialize WebSocket Server on the shared HTTP port for progress notifications
  initializeWebSocketServer(server);

  // Handle server shutdown cleanups
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Shutting down gracefully...');
    server.close(() => {
      console.log('HTTP Server closed.');
      process.exit(0);
    });
  });
}

bootstrap().catch((err) => {
  console.error('Critical system bootstrap failure:', err);
  process.exit(1);
});
