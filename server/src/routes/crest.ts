/**
 * Crest proxy — re-serves football-data team crests from our own domain
 * with permissive CORS, so the browser canvas (html-to-image) can read them
 * without the cross-origin "tainted canvas" block.
 *
 * SSRF guard: only the football-data crest CDN is allowed.
 */
import { Router, Request, Response } from 'express';

const router = Router();
const ALLOWED_HOST = 'crests.football-data.org';

router.get('/', async (req: Request, res: Response) => {
  const url = req.query.url;
  if (typeof url !== 'string') {
    return res.status(400).json({ error: 'url query param required' });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'invalid url' });
  }

  if (parsed.hostname !== ALLOWED_HOST || parsed.protocol !== 'https:') {
    return res.status(403).json({ error: 'host not allowed' });
  }

  try {
    const upstream = await fetch(parsed.toString());
    if (!upstream.ok) {
      return res.status(502).json({ error: 'upstream fetch failed' });
    }
    const contentType = upstream.headers.get('content-type') ?? 'image/png';
    const buf = Buffer.from(await upstream.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(buf);
  } catch (err) {
    console.error('[crest proxy] failed:', err);
    return res.status(502).json({ error: 'proxy error' });
  }
});

export default router;