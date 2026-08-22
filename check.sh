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
git fetch -q origin main 2>/dev/null
local=$(git rev-parse main 2>/dev/null)
remote=$(git rev-parse origin/main 2>/dev/null)
if [ -z "$remote" ]; then
  echo "  cannot reach the repo"
elif [ "$local" = "$remote" ]; then
  echo "  in sync at ${local:0:7}"
else
  echo "  $(git rev-list --count origin/main..main) commit(s) not pushed"
fi
