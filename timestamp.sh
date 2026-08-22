#!/bin/bash
# Anchor the DATC evidence set to the Bitcoin blockchain via OpenTimestamps.
#
# The list below is deliberate, not a wildcard. Each file is here because it
# shows the idea existing or working on a date. Design references, duplicate
# exports and private correspondence are excluded: they prove nothing about the
# idea, and a padded evidence set is weaker than a tight one.
#
# Verify later:
#   ots verify timestamps/MANIFEST.txt.ots -f timestamps/MANIFEST.txt
set -u
cd "$(dirname "$0")"
mkdir -p timestamps

A="$HOME/Documents/Arduino"
P="$HOME/Documents/Personal Projects/DATC-Drone"

FILES=(
  "$A/Datc.ino"                          # 2026-01-12  earliest artefact; already contains AUTHORITY_URL
  "$A/datc_cc_esp8266/datc_cc_esp8266.ino" # 2026-01-12  companion computer firmware
  "$A/datc_esp32_cc_gps/datc_esp32_cc_gps.ino" # 2026-01-18  GPS added
  "$HOME/Desktop/datc-prototype-backup.zip"    # 2026-06-30  full working prototype
  "$P/Digital Airspace Drone System (1).pdf"   # 2026-07-19  written system description
  "$P/DATC Product Demo Video (1).mp4"         # 2026-07-19  the system running
  "$P/DATC Research Paper.pdf"                 # 2026-08-15  research
  "$P/DATC Paper Summer 2026.pdf"              # 2026-08-15  research
)

MAN=timestamps/MANIFEST.txt
{
  echo "DATC — evidence manifest"
  echo "Vihaan Mittal. Generated $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
  echo
  echo "Each file below is hashed. This manifest is anchored to the Bitcoin"
  echo "blockchain, so the hashes provably existed at that time. The files"
  echo "themselves are not published."
  echo
  printf "%-12s %12s  %-64s  %s\n" "CREATED" "BYTES" "SHA-256" "FILE"
} > "$MAN"

missing=0
for f in "${FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "MISSING: ${f/#$HOME/~}"; missing=$((missing+1)); continue
  fi
  printf "%-12s %12s  %-64s  %s\n" \
    "$(stat -f '%SB' -t '%Y-%m-%d' "$f")" "$(stat -f '%z' "$f")" \
    "$(shasum -a 256 "$f" | cut -d' ' -f1)" "${f/#$HOME/~}" >> "$MAN"
done

echo "Manifest: $(grep -c '^20' "$MAN") files, $missing missing."
[ "$missing" -gt 0 ] && echo "Fix the missing paths before relying on this."

ots stamp "$MAN" && echo "Manifest timestamped." || { echo "FAILED — check connection."; exit 1; }

# Standalone proofs for the two that carry the most weight.
for f in "$A/Datc.ino" "$HOME/Desktop/datc-prototype-backup.zip"; do
  [ -f "$f" ] || continue
  ots stamp "$f" && mv "$f.ots" "timestamps/$(basename "$f").ots" && echo "stamped: $(basename "$f")"
done

echo
echo "Bitcoin confirmation takes a few hours."
echo "Tomorrow:  ots upgrade timestamps/*.ots"
