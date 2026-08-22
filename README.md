# DATC — Drone Authorization, Tracking & Compliance

**Live site: [datc-drones.in](https://datc-drones.in)**

An early-stage attempt at a trust layer between drone operators and aviation
authorities: give a drone a verifiable identity so a regulator can check, in
flight, whose it is and whether it is cleared to be there.

Built by **Vihaan Mittal**, Grade 9, Pathways School Gurgaon.

---

## Why this exists

Drones can already do the work — inspection, delivery, mapping, reforestation.
What stops them is that no authority can verify, in real time, whose drone that
is. So regulators do the only safe thing available and restrict.

Aviation hit this exact wall and solved it. ADS-B gave controllers continuous,
verifiable visibility of every aircraft, and that visibility is what made open
airspace governable rather than forbidden. DATC applies the same idea to drones.

The project was not built to fight regulation. It was built to support it.

## Origin

The idea came out of two earlier projects that drone regulation blocked:

- **PYPx** — aerial reforestation, planting saplings by drone. Prototyping
  stalled because Indian drone rules made real testing impossible.
- **MYP2 (Grade 7)** — addressing illegal logging in the Davao Region,
  Philippines, through aerial surveillance. Same outcome: the most effective
  tool was the one that could not legally be flown.

Researching DGCA and FAA frameworks made the underlying reason clear. The rules
are restrictive because authorities have no visibility, not because drones are
unwelcome.

## What is actually built

| | |
|---|---|
| **Built** | Registration and automated safety analysis — thrust margin, endurance, wind risk, payload utilisation |
| **Built** | Authority approval dashboard with structured denial reasons |
| **Built** | Fernet-encrypted QR licence for field verification |
| **Preliminary** | Physical module — API calls, heartbeat and control logic over Wi-Fi only |
| **Not built** | Long-range communication. Nothing has flown. |

The site states this plainly rather than presenting the project as finished.

## Known limitations

- Depends on continuous cellular connectivity for live authorisation. Rural
  coverage gaps would degrade it.
- Only matters if aviation authorities adopt it. Without regulatory
  integration it stays a concept.
- Centralising licensing data raises real privacy and governance questions.

## Record of authorship

This repository exists partly as a dated record of the work.

| Evidence | Date |
|---|---|
| [Internet Archive snapshot](https://web.archive.org/web/20260822102403/https://datc-drones.in/) | 22 Aug 2026 |
| `paper/DATC Paper Summer 2026.pdf` — the written research, predates the site | Summer 2026 |
| [AUTHORSHIP.md](AUTHORSHIP.md) — SHA-256 hashes of every published file | 22 Aug 2026 |
| Commit history in this repository | from 22 Aug 2026 |

The Internet Archive capture is the strongest of these: a neutral third party
recorded the site at a fixed time, and that record cannot be altered afterwards
by anyone, including me.

## Repository contents

```
index.html      the page
styles.css      styling
hero.js         3D hero, scroll sequences, reveals
build.sh        assembles a clean dist/ for deployment
devserver.py    local development server
PLAN.md         design plan and the reasoning behind each decision
COPY.md         every word on the page, and why
paper/          the underlying research
```

## Credits

- Aircraft model: [DJI Mavic 3](https://skfb.ly/o8rsR) by llirikslon, [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)
- Environment: [Joburg Central Sunset](https://polyhaven.com/a/sunset_jhbcentral), Poly Haven, CC0
- Typeface: IBM Plex

---

*Looking for feedback, particularly from anyone who has worked on
connectivity-constrained real-time systems or drone communications.*
*[vihaan.mittal@pathways.in](mailto:vihaan.mittal@pathways.in)*
