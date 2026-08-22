#!/bin/bash
# Build a manifest of every DATC artefact on this machine, then anchor it to the
# Bitcoin blockchain via OpenTimestamps. One proof covers everything: any single
# file can later be verified by re-hashing it and finding it in the manifest.
#
# Verify later:  ots verify timestamps/MANIFEST.txt.ots -f timestamps/MANIFEST.txt
set -u
cd "$(dirname "$0")"
mkdir -p timestamps

MAN=timestamps/MANIFEST.txt
{
  echo "DATC — artefact manifest"
  echo "Vihaan Mittal. Generated $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
  echo
  echo "Every DATC file on this machine, with creation date, size and SHA-256."
  echo "This manifest is timestamped; the files themselves stay private."
  echo
  printf "%-12s %12s  %-64s  %s\n" "CREATED" "BYTES" "SHA-256" "FILE"
} > "$MAN"

# Everything DATC-related, wherever it lives.
find "$HOME/Documents" "$HOME/Desktop" "$HOME/Downloads" \
     \( -iname "*datc*" -o -iname "*forestguard*" -o -iname "*airspace*" \) \
     -type f 2>/dev/null \
  | grep -v "/datclanding/" | grep -viE "node_modules|/\.git/" | sort \
  | while read -r f; do
      printf "%-12s %12s  %-64s  %s\n" \
        "$(stat -f '%SB' -t '%Y-%m-%d' "$f")" \
        "$(stat -f '%z' "$f")" \
        "$(shasum -a 256 "$f" | cut -d' ' -f1)" \
        "${f/#$HOME/~}"
    done >> "$MAN"

n=$(grep -c "^20" "$MAN")
echo "Manifest lists $n files."

if ots stamp "$MAN" && [ -f "$MAN.ots" ]; then
  echo "Manifest timestamped."
else
  echo "FAILED to timestamp the manifest — check your connection and retry."
  exit 1
fi

# Also stamp the few that matter most on their own, so each has a standalone proof.
for f in "$HOME/Documents/Arduino/Datc/Datc.ino" \
         "$HOME/Desktop/datc-prototype-backup.zip" \
         "$HOME/Documents/Personal Projects/DATC-Drone/DATC Paper Summer 2026.pdf"; do
  [ -f "$f" ] || continue
  if ots stamp "$f" && [ -f "$f.ots" ]; then
    mv "$f.ots" "timestamps/$(basename "$f").ots"
    echo "stamped: $(basename "$f")"
  fi
done

echo
echo "Done. Bitcoin confirmation takes a few hours."
echo "Tomorrow, run:  ots upgrade timestamps/*.ots"
