#!/bin/bash
# Are the two outstanding evidence records live yet?
set -u
cd "$(dirname "$0")"

if [ -z "${SSL_CERT_FILE:-}" ]; then
  OTSPY=$(head -1 "$(command -v ots)" | sed 's|^#!||')
  CA=$("$OTSPY" -c 'import certifi; print(certifi.where())' 2>/dev/null)
  [ -n "$CA" ] && export SSL_CERT_FILE="$CA"
fi

echo "Bitcoin"
for f in timestamps/*.ots; do
  out=$(ots upgrade "$f" 2>&1)
  if echo "$out" | grep -q "Success\|already upgraded"; then
    echo "  confirmed   $(basename "$f")"
  else
    echo "  pending     $(basename "$f")"
  fi
done

echo
echo "GitHub"
code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 https://github.com/Vihaancoding/datc)
if [ "$code" = "200" ]; then
  echo "  repo exists — ready to push"
else
  echo "  not created yet (HTTP $code) — make an empty public repo named datc"
fi
