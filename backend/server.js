const app = require('./src/app');
const { connectDatabase, disconnectDatabase } = require('./src/config/db');
const { env } = require('./src/config/env');

async function start() {
  await connectDatabase();
  console.log(`MongoDB connected (${env.mongoDb})`);

  const server = app.listen(env.port, () => {
    console.log(`SwiftBus API listening on http://localhost:${env.port}`);
  });

  server.on('error', async (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `Port ${env.port} is already in use. Stop the other SwiftBus API instance or set PORT to a free port in backend/.env.`
      );
    } else {
      console.error('SwiftBus API server error:', error.message);
    }

    await disconnectDatabase();
    process.exit(1);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Closing server...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('Failed to start SwiftBus API:', error.message);
  process.exit(1);
});
