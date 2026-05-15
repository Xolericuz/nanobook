import { getAssetFromKV, NotFoundError, MethodNotAllowedError } from '@cloudflare/kv-asset-handler'

export default {
  async fetch(request, env, ctx) {
    try {
      const page = await getAssetFromKV({ request, env, ctx })
      const response = new Response(page.body, page)
      response.headers.set('X-XSS-Protection', '1; mode=block')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('Referrer-Policy', 'no-referrer-when-downgrade')
      return response
    } catch (e) {
      if (e instanceof NotFoundError) {
        try {
          const page = await getAssetFromKV({
            request: new Request(`${new URL(request.url).origin}/index.html`, request),
            env,
            ctx,
          })
          const response = new Response(page.body, { ...page, status: 200 })
          response.headers.set('Content-Type', 'text/html; charset=utf-8')
          return response
        } catch {
          return new Response('Not Found', { status: 404 })
        }
      }
      if (e instanceof MethodNotAllowedError) {
        return new Response('Method Not Allowed', { status: 405 })
      }
      return new Response('Internal Error', { status: 500 })
    }
  },
}
