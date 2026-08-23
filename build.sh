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

cat > dist/sitemap.xml <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://datc-drones.in/</loc><lastmod>$(date -u +%Y-%m-%d)</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>
</urlset>
EOF

cat > dist/llms.txt <<'EOF'
# DATC — Drone Authorization, Tracking and Compliance

> A student research project proposing a trust layer between drone operators
> and aviation authorities. Drones can already do the work; what stops them is
> that no authority can verify in real time whose drone is overhead and whether
> it is cleared to be there. DATC is an attempt at that missing layer.

By Vihaan Mittal, Grade 9, Pathways School Gurgaon, India.
Contact: vihaan.mittal@pathways.in
Source: https://github.com/Vihaancoding/DATCLANDING

## Status

Early-stage and honest about it. A working prototype exists — ESP32-based
companion computer, GPS, registration and verification flow. It is not a
product, and adoption by a regulator remains an unsolved problem, stated
openly on the site rather than glossed over.

## Pages

- [Home](https://datc-drones.in/): the problem, the precedent in aviation, what
  DATC proposes, current status, and the open problems help is wanted on.
EOF

echo "dist/ built — $(du -sh dist | cut -f1), $(find dist -type f | wc -l | tr -d ' ') files"
find dist -type f | sed 's|^dist/|  |' | sort
