#!/bin/bash
# Assemble a clean dist/ for deployment. The project folder also holds planning
# docs, the dev server and source assets, none of which belong on a public site.
set -e
cd "$(dirname "$0")"
# Preserve the Vercel project link across rebuilds. Deleting it silently
# orphans the folder, and the next deploy creates a NEW project named after the
# directory instead of updating the real one.
LINK=$(mktemp -d)
[ -d dist/.vercel ] && cp -R dist/.vercel "$LINK/" || true
rm -rf dist && mkdir -p dist/public/models
[ -d "$LINK/.vercel" ] && cp -R "$LINK/.vercel" dist/ || true
rm -rf "$LINK"

cp index.html styles.css hero.js vercel.json dist/
cp public/og.jpg public/favicon-32.png public/apple-touch-icon.png dist/public/
cp public/logo-mark.png public/logo-lockup.png dist/public/
cp public/shot-dashboard.jpg public/shot-registration.jpg dist/public/
cp public/models/drone.glb public/models/city-light.exr dist/public/models/

cat > dist/robots.txt <<'EOF'
User-agent: *
Allow: /
Sitemap: https://datc-drones.in/sitemap.xml
EOF

cat > dist/sitemap.xml <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://datc-drones.in/</loc><changefreq>monthly</changefreq></url>
</urlset>
EOF

echo "dist/ built — $(du -sh dist | cut -f1), $(find dist -type f | wc -l | tr -d ' ') files"
find dist -type f | sed 's|^dist/|  |' | sort
