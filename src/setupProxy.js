const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://www.reddit.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Supprimer '/api' pour faire passer directement la requête à Reddit
      },
      onProxyReq: (proxyReq, req, res) => {
        // Ajouter des en-têtes pour éviter les problèmes CORS si nécessaire
        proxyReq.setHeader('Origin', 'https://www.reddit.com');
      },
    })
  );
};
