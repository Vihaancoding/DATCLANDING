# DATC — Record of Authorship

Vihaan Mittal. Compiled 2026-08-22.

This records when the DATC idea was developed and what evidence supports each
date. It distinguishes between evidence that a third party can verify and
evidence that rests on my own machine.

## Timeline

| Date | Artefact | Significance |
|---|---|---|
| 2026-01-12 | `Datc.ino` — ESP8266 firmware | Earliest dated artefact. Already named DATC, and already contains `AUTHORITY_URL`: a drone reporting to an authority platform. The core architecture, seven months before the site. |
| 2026-01-18 | `datc_esp32_cc_gps` | GPS added to the companion computer. |
| 2026-06-30 | `datc-prototype-backup.zip` | Full prototype snapshot. |
| 2026-07-13 | Drone Infrastructure Design Summary | The eight-scene narrative for the system. |
| 2026-07-19 | Digital Airspace Drone System (PDF) | Written system description. |
| 2026-08-15 | DATC Paper Summer 2026 (PDF) | The research paper. |
| 2026-08-22 | datc-drones.in published | Public launch. |

### Earlier school work, held on the school's systems

These predate everything above and are the origin of the idea. They carry
institutional timestamps I did not set.

| Date | Work | Significance |
|---|---|---|
| 2023-05-12 | *Forever Greens* (PYPx, Grade 5S) | Reforestation. A seed-planting rover, ~400 seeds a minute. Microsoft version history records the author as "Vihaan Mittal (Student - Pathways School Gurgaon)" at 18:57 on this date. |
| 2023-24 | *Innovations Process Journal* (MYP-2, I&S PBL) | ForestGuard XR AI: a LiDAR and AI-camera drone against illegal logging, with CAD drawings and build photos. Filed under `PSG MYP 2023-24/ I&S PBL/Alka Singh/ MYP-2`. |
| 2023-24 | MYP-2 product presentation | States the drone "can detect suspicious logging activity in real time and send alerts to forest rangers/authorities" - the authority-notification idea that became DATC. |

Both projects ran into drone regulation, which is what led to DATC.

## Content hashes

Any later copy can be compared against these. A match proves the file is
byte-identical to what existed on this date.

    Datc.ino                          91eb6cd39ed4fdc3b8556c5efe2b5c6dd57375f20443fabae69f99e7e13fa388
    datc_cc_esp8266.ino               4db92367e2c6dc7cd777fb79320de6c824308f244e6176816e8c799323e11050
    datc-prototype-backup.zip         7f38e234c4143261e0106332edd407ff32f6e76a064c2a9783968d91d0a9df8a
    Digital Airspace Drone System.pdf 2dbc5ed26422cf8ef52d076267c2a8d60afede0f1ab73603a42fe41293fd2e1f
    DATC Paper Summer 2026.pdf        2f793553eb353802363a3ebd491ac1f56091ef7d6102ad11f1fc06a4a05afe39
    DATC Research Paper.pdf           35aee034333d3667a6838f18ab48a421193bf5dfd55322803a4aa43f6e14d567

## Cryptographic timestamps

`timestamp.sh` builds `timestamps/MANIFEST.txt` — every DATC file on the
machine with its creation date, size and SHA-256 — and anchors that manifest
into the Bitcoin blockchain via OpenTimestamps. One proof covers every file,
and nothing is published: only the hashes leave the machine.

    ots verify timestamps/MANIFEST.txt.ots -f timestamps/MANIFEST.txt

Unlike file dates, this cannot be back-dated. The blockchain fixes when the
hash was submitted, and the hash could only have been produced by files that
already existed.

## What each kind of evidence is worth

**Verifiable by a third party.** The Internet Archive captured the live site at
2026-08-22 10:24:03 UTC. Neither I nor anyone else can alter that record.

    https://web.archive.org/web/20260822102403/https://datc-drones.in/

**Self-attested.** The file dates above come from my own computer and can be
changed by anyone with access to it. They are consistent and detailed, which
makes them credible, but on their own they are not proof.

**Institutional.** The school submissions for PYPx and MYP2, and any dated
correspondence, are held by third parties and carry far more weight than
anything on this machine.

## Honest limits

This shows the idea existed and was being built by January 2026. It cannot show
that nobody else thought of something similar earlier, and no record can.
Copyright protects the expression — this code, this paper, this site — and is
automatic. It does not protect the underlying concept.
