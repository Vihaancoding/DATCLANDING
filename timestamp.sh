#!/bin/bash
# Anchor a hash of each DATC artefact into the Bitcoin blockchain via
# OpenTimestamps. Proves the file existed on this date without publishing it.
# Verify later with: ots verify timestamps/<name>.ots -f <original file>
set -u
cd "$(dirname "$0")"
mkdir -p timestamps

P="$HOME/Documents/Personal Projects/DATC-Drone"
FILES=(
  "$HOME/Documents/Arduino/Datc/Datc.ino"
  "$HOME/Documents/Arduino/datc_cc_esp8266/datc_cc_esp8266.ino"
  "$HOME/Desktop/datc-prototype-backup.zip"
  "$P/Digital Airspace Drone System (1).pdf"
  "$P/DATC Paper Summer 2026.pdf"
  "$P/DATC Research Paper.pdf"
)

for f in "${FILES[@]}"; do
  [ -f "$f" ] || { echo "skip (missing): $(basename "$f")"; continue; }
  if ots stamp "$f" && [ -f "$f.ots" ]; then
    mv "$f.ots" "timestamps/$(basename "$f").ots"
    echo "stamped: $(basename "$f")"
  else
    echo "FAILED:  $(basename "$f")"
  fi
done

echo
echo "Proofs are in timestamps/. Bitcoin confirmation takes a few hours;"
echo "run 'ots upgrade timestamps/*.ots' tomorrow to complete them."
