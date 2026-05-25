const path = require('path');

// To allow the server to run cleanly on Vercel
process.env.VERCEL = '1';

// We import the compiled server from dist/server.cjs
// It exports the startServer function as default
let app;

module.exports = async (req, res) => {
  if (!app) {
    const serverModule = require('../dist/server.cjs');
    const startServer = serverModule.default || serverModule;
    app = await startServer();
  }
  // Vercel serverless functions handle req/res directly with the express app
  return app(req, res);
};
