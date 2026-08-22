# DATC — Page Copy

Every word that appears on the page. Constraints held throughout: headlines ≤ 9 words,
paragraphs ≤ 3 lines, no claim the project can't support.

---

## Nav

- Wordmark: `DATC`
- Link: `Get in touch`

---

## 1. Hero

### Beat A
- Eyebrow: `One drone. One simple question.`
- H1: **Can authorities trust what's in the sky?**

### Beat B
- Eyebrow (red): `Unverified`
- Headline: **They can't even tell whose it is.**
- Sub: `So the safe answer is no — and the rules stay restrictive.`

The three beats have to read as one chain: A asks the question, B answers it *and* says why,
C says what would change the answer. The earlier version of B — "Because they can't verify it,
they restrict it" — skipped straight to the consequence without answering A, and its "it" had
no referent yet.

### Beat C — LOCKED (option 1)
- Eyebrow: `The missing piece`
- Headline: **Not a better drone. A way to prove whose it is.**
- Sub: `An early attempt at that. Most of it isn't built yet.`
- Mono strip: `Identify · Verify · Authorize · Monitor`

Lands the idea, then immediately sets the honest expectation. The admission arrives before the
reader has time to assume otherwise, which is what makes §5 read as consistency instead of
retreat.

*(Rejected: a forward version asserting "it's verifiable trust" — deferred the admission four
sections and made §5 read as a walk-back. And a question-led version, "What if the drone could
prove who it was?" — safe, but quieter than this page needs at its one big moment.)*


---

## 2. The gap

- Label: `The gap`
- `₹2.5T` — India's projected drone market by 2030
- `38,575` — drones nationwide with a verified ID today
- Caption: **The distance between those two numbers is trust.**

- H2: **Authorities can't see what's in the sky, so they can't trust it.**

> Drone compliance in both the US and India runs on paperwork and registration, not real-time
> field identification. Agencies have no reliable way to tell an authorized drone from an
> unauthorized one while it's actually in the air.

> India's own attempt, Digital Sky, is fragmented across portals and leans on operator
> self-declaration — unreliable enough that DGCA began migrating drone services to eGCA in 2025.
> Remote ID broadcast isn't mandated until 2027.

> So regulators choose between under-enforcement and blanket restriction. Those restrictions
> stalled two of my own drone projects, which is how I ended up here.

---

## 3. The precedent

- Label: `The precedent`
- H2: **Aviation already solved this once.**

> Before ADS-B, controllers relied on radar — slower, less accurate, less certain. ADS-B had
> aircraft broadcast their own verified position every second. The FAA mandated it in 2010 and
> gave the industry a decade to comply.

> The lesson isn't the radio protocol. It's the order things happened in: visibility built
> trust, trust enabled regulation, and regulation let the industry grow.

Diagram labels: `Aircraft` · `Verified position, once a second` · `Ground station`

---

## 4. The approach

- Label: `The approach`
- H2: **Give the drone an identity it reports in real time.**
- Intro: `The same idea, applied to drones, in three parts.`

**01 — Verifiable identity**
> A unique ID tied to owner, model and licence validity — checked electronically in flight, not
> once at registration.

**02 — Live authorization**
> Permission status updates from a central platform, instead of living in a record the operator
> controls and declares.

**03 — Real-time intervention**
> An authority can ground an active flight, rather than deny a permit beforehand or read a log
> afterwards.

---

## 5. What's built, what isn't

- Label: `Where this actually stands`
- H2: **This is early. Here's what's built and what isn't.**

| Status | Item | Detail |
|---|---|---|
| `Built` | **Registration & safety analysis** | A web form feeding a SQLite backend that scores thrust margin, endurance, wind risk and payload utilization automatically. |
| `Built` | **Authority approval dashboard** | A desktop app where an authority reviews pending registrations against those metrics and approves or denies with a structured reason. |
| `Built` | **Encrypted licence credential** | Approved drones get a Fernet-encrypted QR licence. The link it points to isn't hosted yet — a known gap, not a hidden one. |
| `Preliminary` | **Physical module** | Early experiments only: API calls, heartbeat, control logic over Wi-Fi. No long-range link. The plan is cellular; it isn't built. |
| `Planned` | **Real-world testing** | Nothing has flown. Performance under real conditions is unknown. |

---

## 6. The open question

- Label: `The actual ask`
- H2: **What happens when the connection drops?**

> The design leans on continuous cellular connectivity: the onboard computer needs a live link
> for authorization checks and heartbeat exchange. That's a single point of failure.

> Much of rural India — one of the places this matters most — doesn't have reliable coverage.
> I don't know the right answer: a cached authorization window, a fallback protocol, something
> else entirely.

> If you've worked on connectivity-constrained real-time systems, or on drone comms
> specifically, I'd like to ask what's been tried and what I'm not seeing.

---

## 7. The ask

- Label: `Get in touch`
- H2: **Fifteen minutes would help a lot.**
- Byline: `Vihaan Mittal — Grade 9, Pathways School Gurgaon.`
- CTA: `Email me` → `vihaan.mittal@pathways.in`

---

## Footer

`DATC — 2026`

---

## Notes on what changed from the v1 copy

- Paragraphs cut roughly in half. The v1 prose ran 5–6 lines; anything past 3 stops being read.
- The personal line ("stalled two of my own drone projects") moved to the end of §2, where it
  lands as motive rather than as an aside inside a paragraph about DGCA.
- §3 gained the "order things happened in" sentence. That sequence — visibility → trust →
  regulation → growth — is the actual argument being borrowed from ADS-B, and v1 left it implied.
- §5 headline lost "exactly." Saying "here's exactly what's built" slightly oversells the
  precision of the list.
- §7 headline spells out "Fifteen" rather than "15" — numerals in a headline read as data, and
  this is the one place on the page that should sound like a person.


---

## Section labels (revised)

Numbered, and each states what the section contains rather than gesturing at it.

```
01  Where drones stall today
02  What aviation did in 2010
03  What DATC actually is
04  How it works, in three parts
05  Built, and not built
06  The ask
```

## 3b. What DATC actually is

- Label: `03 · What DATC actually is`
- H2: **DATC is a way to check whose drone that is — while it's still in the air.**

Three roles, revealed one at a time on scroll:

| Role | Copy |
|---|---|
| The drone | Carries a module that reports its identity continuously, in flight. |
| **DATC** | Checks that identity and its permission against a live central record. |
| The authority | Sees what is actually flying — and can clear it, or ground it. |

Closing line: `That's the whole idea. Everything below is how far it has actually got.`

This section must **define** DATC, not describe what it does for a drone — at this point
in the page the reader has seen the name in the nav and the hero but has never been told
what it is. "Whose drone that is" deliberately repeats the hero's beat 2, so the section
reads as the answer to the question the hero asked.
