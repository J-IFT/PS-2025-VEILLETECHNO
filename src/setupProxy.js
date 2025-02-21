const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://www.reddit.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Retirer '/api' de l'URL pour envoyer directement la requête à Reddit
      },
    })
  );
};
