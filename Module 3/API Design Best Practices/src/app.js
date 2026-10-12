const express = require('express');
const postRoutes = require('./routes/postRoutes');
const { resetData } = require('./data/postStore');
const controller = require('./controllers/postController');
const http = require('./utils/http');

function createApp() {
  const app = express();
  app.use(express.json());

  // Resource-based route mounting
  app.use('/posts', postRoutes);

  // Safe internal-failure demo/testing route
  app.get('/debug/failure', controller.explode);

  // 404 handler for missing routes
  app.use((req, res) => {
    http.sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
  });

  // Centralized error handler - prevents leaking stack traces, fake DB details, or internals
  app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    const message = status >= 500 ? 'Internal Server Error' : (err.message || 'Error occurred');
    return http.sendError(res, status, message);
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = 3000;
  app.listen(port, () => {
    console.log(`Starter API listening on port ${port}`);
  });
}

module.exports = {
  createApp,
  resetData
};
