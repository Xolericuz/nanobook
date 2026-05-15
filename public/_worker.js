export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const staticAssets = [
      '/assets/', '/index.html', '/manifest.json', '/favicon.svg',
      '/books.json', '/_redirects', '/_headers'
    ]
    if (staticAssets.some(p => url.pathname.startsWith(p)) || /\.\w{2,5}$/.test(url.pathname)) {
      return env.ASSETS.fetch(request)
    }
    return env.ASSETS.fetch(new Request(url.origin + '/index.html', request))
  },
}
