export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname

    const extless = path => {
      const ext = path.split('.').pop()
      return ext === path ? false : ext
    }

    const assetExtensions = ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp', 'woff', 'woff2', 'ttf', 'eot', 'json', 'xml', 'txt']
    const hasExtension = assetExtensions.some(e => path.endsWith('.' + e))

    if (path.startsWith('/assets/') || hasExtension) {
      return env.ASSETS.fetch(request)
    }

    const response = await env.ASSETS.fetch(new Request(url.origin + '/index.html', request))
    return new Response(response.body, {
      ...response,
      status: 200,
      headers: {
        ...Object.fromEntries(response.headers),
        'content-type': 'text/html; charset=utf-8',
      },
    })
  },
}
