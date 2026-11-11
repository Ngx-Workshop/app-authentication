const authOrigin = 'https://auth.ngx-workshop.io';

module.exports = {
  '^/api/auth/social/providers$': {
    target: authOrigin,
    changeOrigin: true,
    headers: { cookie: '', authorization: '' },
  },
  '^/api/auth/social/(google|github|apple)/start(?:\\?|$)': {
    target: authOrigin,
    bypass(request, response) {
      if (request.method !== 'GET') return false;
      // The hosted callback expects its browser cookie to be set on the auth origin.
      response.writeHead(302, {
        Location: new URL(request.url, authOrigin).href,
        'Cache-Control': 'no-store',
      });
      response.end();
      return request.url;
    },
  },
};
