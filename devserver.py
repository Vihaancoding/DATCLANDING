#!/usr/bin/env python3
"""Dev server for the DATC page.

Two jobs beyond serving files:

1. No-store headers, so nothing is cached between edits.
2. Asset stamping. Some browsers hold on to a cached styles.css or hero.js even
   when told not to, which meant edits silently never reached the page. Every
   request for the HTML rewrites the local asset links with the file's current
   modification time, so a changed file is always a new URL.
"""
import http.server, socketserver, sys, re, os, pathlib

# The port comes from the harness via PORT; the argument is only a manual override.
PORT = int(os.environ.get('PORT') or (sys.argv[1] if len(sys.argv) > 1 else 4321))
ROOT = pathlib.Path(__file__).parent
ASSET = re.compile(r'(href|src)="(styles\.css|hero\.js|script\.js)"')


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        path = self.path.split('?')[0]
        if path in ('/', '/index.html'):
            return self.serve_html()
        return super().do_GET()

    def serve_html(self):
        f = ROOT / 'index.html'
        if not f.exists():
            return self.send_error(404)

        def stamp(m):
            asset = ROOT / m.group(2)
            v = int(asset.stat().st_mtime) if asset.exists() else 0
            return f'{m.group(1)}="{m.group(2)}?v={v}"'

        body = ASSET.sub(stamp, f.read_text(encoding='utf-8')).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
os.chdir(ROOT)
with socketserver.TCPServer(('', PORT), Handler) as httpd:
    print(f'DATC dev server on http://localhost:{PORT} (no-store + asset stamping)')
    httpd.serve_forever()
