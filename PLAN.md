# DATC Landing Page — Plan

Single source of truth. Replaces the earlier `PLAN.md` and `HERO.md`, which disagreed with
each other.

**North star:** Apple's restraint + DJI's precision + aerospace authority.
**Framing:** an honest early-stage research page, not a product page. See §1.

---

## 1. The core decision: honest, not polished-product

Two sets of source material pull in opposite directions.

- The **storyboard** and **infographic** in `DATCLANDINGINSPO` present DATC as a shipped
  product — hardware spec sheet, live operations dashboard, city-scale drone network.
- The **existing site copy** says nothing has flown, the module is preliminary experiments
  only, the QR verification link isn't hosted, and the ask is 15 minutes of feedback.

The page follows the existing copy. Reasons, in order of weight:

1. **The audience can puncture the product version.** Regulators and drone-industry people
   have seen the spec-sheet pitch many times. One overclaim they catch discounts everything
   else on the page.
2. **The same facts read differently on a proposal page.** "Nothing has flown" is a failure
   on a product page and a statement of rigor on a research page.
3. **It matches the actual goal.** The ask is help with a specific unsolved problem. A page
   claiming everything works makes that ask incoherent.
4. **It is rare.** Publishing what isn't built is a thing almost nobody does.

### How the storyboard splits

- **Scenes 1–5** (curiosity → question → denial → missing piece → identity) are the
  *argument*. They survive intact and drive the hero.
- **Scenes 6–8** (live dashboard, city-scale network, product close) are the *pitch*. They
  describe things that do not exist. Cut.

### Downstream consequences

- Hero beat C proposes rather than asserts.
- The hardware spec table (155×120×60mm, AES-256, ESP32…) is cut — those numbers describe a
  design, not a built object.
- The "live operations" dashboard becomes the **approval dashboard**, which is real and is
  the strongest thing actually built.
- The city-scale network section is cut.
- **Asset load drops from ~9 renders to 3.** Only the hero needs generated imagery.

---

## 2. The argument, as prose

Agreed before any layout. If it doesn't persuade as a paragraph, no amount of scroll work fixes it.

> Drones can already do the work — inspection, delivery, mapping, reforestation. What stops them
> is not capability, it's that no authority can verify, in real time, whose drone that is or
> whether it is cleared to be there. So regulators do the only safe thing available to them and
> restrict. Aviation hit this exact wall and solved it: ADS-B gave controllers continuous,
> verifiable visibility, and that visibility is what made open airspace governable rather than
> forbidden. DATC is an early attempt at that layer for drones. Parts of it are built, most of
> it isn't, and one problem in the middle is still unsolved.

**Audience:** regulators, drone operators, technical peers. Skeptical and technical. That
audience needs **mechanism before proof** — they won't accept results until they understand the
machine — and it means the problem beat must read as *diagnosis*, not pressure.

**Beat order:** `Agitation → Promise → Authority → Mechanism → Proof + objection handling → Open question → Close`

Authority sits third on purpose. ADS-B is borrowed credibility from an industry that already
won this argument; for a regulator it's the most persuasive object on the page and shouldn't
be buried.

---

## 3. Section structure — 7 sections

| # | Section | Beat | Treatment |
|---|---|---|---|
| 1 | **Hero** — three beats | Agitation → Promise | Pinned, 240vh desktop / 180vh mobile. Pin #1. |
| 2 | **The gap** — two numbers, then why authorities can't see | Agitation | Dark. `₹2.5T` / `38,575`, then the Digital Sky prose. |
| 3 | **The precedent: ADS-B** | Authority | Light steel. One line diagram. Full quiet screen. |
| 4 | **The approach** — 01/02/03 | Mechanism | Dark. Pin #2, steps light one at a time. |
| 5 | **What's built, what isn't** | Proof + objection handling | Dark. Built / Preliminary / Planned pills. |
| 6 | **The open question** — connectivity | The real content | Raised surface. |
| 7 | **The ask** | Close | Dark. One CTA. |

Section 5 doing proof *and* objection handling in one move is the central trick of the honest
version. Ten sections was a plan for a team with an asset budget; seven is the right scope for
one person.

---

## 4. The hero — three beats

Carries `Agitation → Promise`.

### Beat A — The question · 0–30%

- **Frame:** the drone, three-quarter, dark. Skyline only suggested. Soft 45° key light.
  Module LED **off**.
- **Text:** `One drone. One simple question.` / **`Can authorities trust what's in the sky?`**

### Beat B — The wall · 24–64%

- **Frame:** camera holds. A red geofence wall rises and cuts the drone off. **Longest hold** —
  the only moment on the page where something is wrong, so it gets the weight.
- **Text:** `UNVERIFIED — ACCESS DENIED` / **`Because they can't verify it, they restrict it.`**

### Beat C — The module · 58–100%

- **Frame:** **the camera moves to the module.** It attaches, the blue LED comes up, a link beam
  runs to the ground, the red wall dissolves into a green corridor. By the last frame the module
  is the subject and the drone is background.
- **Text:** **`Not another drone. A way to trust the ones already flying.`** with the sub-line
  `An early attempt at that layer. Most of it isn't built yet.`, plus a mono strip:
  `IDENTIFY · VERIFY · AUTHORIZE · MONITOR`

### Why these three, and why they each stand alone

- **Four beats was one too many.** "Drone in studio" and "drone over city" are the same beat
  told twice. Pinned height is expensive; a restatement is the worst thing to spend it on.
- **Beat C must resolve on the module.** A scroll-driven hero transform is only worth its cost
  if the object *is* the product. DATC does not make drones — if the sequence ends on the
  airframe, the most expensive move on the page teaches the reader the wrong thing.
- **Each beat is a finished frame with a complete sentence.** Many readers flick past. A fast
  scroll should degrade into three legible stills, not a smear.
- **Nothing is gated behind animation.** The H1 is real text in the DOM at first paint. The
  fade can be slow; the content cannot be absent.

### How the hero is rendered — a real 3D model

The hero loads **real 3D model files** and renders them live in the browser with three.js. Not
generated imagery, and not geometry assembled from primitives in code — both read as cheap next
to a properly modelled asset.

**What has to be sourced (not by me)**

| Asset | What it is | Where |
|---|---|---|
| `drone.glb` | Folding quadcopter, Mavic-style, matching the moodboard's aircraft | Sketchfab (filter: downloadable + CC licence), CGTrader or TurboSquid for higher quality |
| `module.glb` | The DATC module | Modelled in Blender, or commissioned. It is a simple form — see below |
| `studio.hdr` | Environment map for reflections | Poly Haven, free CC0, a neutral studio interior |

The HDRI is what makes anodised aluminium read as metal. Without it the model looks like flat
grey plastic, which is the usual reason browser 3D looks bad.

**The module form — from the brand moodboard, not the infographic**

`ChatGPT Moodboard Aug 16 2026.png` supersedes the earlier infographic render. The module is a
**flat, wide, rounded-square puck**, not a chunky box: matte dark anodised finish, a single
diagonal split line across the top face, a bright chamfer catching light along the edge, `DATC`
debossed on the side wall, and one small indicator LED on the front edge. Roughly 155 × 120 ×
60 mm at a guess from the infographic's spec table, but the moodboard's proportions win.

**Budgets.** `.glb` format, one file each including materials. Under 100k triangles and under
5 MB total across both models. No baked-in scene lighting.

**Lighting.** One soft key at roughly 45°, ambient fill, no harsh shadows, reflections that
shift as the camera moves. This is the Apple moodboard's spec verbatim — *"edge bevels catch
light subtly: a signal of craftsmanship"* — and it is the difference between premium and
amateur far more than polygon count is.

**What I build:** the loader, the scroll-driven camera path, the material state changes, the
red denial plane and green corridor, the performance work, and the fallback. **What I do not
build:** the models.

**Scene by beat**

| Beat | Camera | Scene state |
|---|---|---|
| A | Wide, three-quarter, slightly above | Grid faint. Module LED dark. Rotors turning slowly. |
| B | Holds, slight drift | A red grid plane rises ahead of the aircraft. Motion stops. |
| C | Pushes in to the module, which fills frame | LED lights blue, uplink line drops to a ground node, red plane dissolves, green corridor opens. |

**Fallback.** If WebGL is unavailable or reduced motion is requested, the page shows a still
image of beat C — a screenshot of the finished scene, not a redrawn substitute.


---

## 5. Does the motion earn its place?

The filter: **what would the reader misunderstand if this were static?** No answer means cut it.

| Beat | Static failure | Motion's job | Verdict |
|---|---|---|---|
| A → B | A drone over a city is a drone ad; the problem never appears | **Sequencing** | Earned |
| B → C | Module and drone read as two unrelated objects | **Relationship** — causation shown, not claimed | Earned |
| B hold | Reader skims the only wrong thing on the page | **Weight** | Earned |
| Section 4 steps | Three parallel items read as a list, not a sequence | **Sequencing** | Earned |
| Ambient float, cursor follower, parallax elsewhere | Nothing | Nothing | **Cut** |

### Pin budget: 2, and both are spent

Excessive pinning fights native scroll and hurts mobile. Pin #1 is the hero, pin #2 is the
mechanism. Everything else is a 24px fade-up: `opacity 0→1`, `y 24→0`, 0.7s,
`cubic-bezier(0.22, 1, 0.36, 1)`, fires once. Transform and opacity only.

---

## 6. Typography

**IBM Plex Sans** (display + body) and **IBM Plex Mono** (data, labels, section numbers,
eyebrows). One superfamily, two voices.

IBM Plex was drawn as an engineering typeface — neutral, technical, entirely un-futuristic,
which is the register. It's on Google Fonts, so no build step in a plain HTML project. This
replaces Space Grotesk + Inter in the current build.

**Settled against the brand board.** `ChatGPT Moodboard Aug 16 2026.png` specifies SF Pro /
Inter, which in practice means Inter, since SF Pro cannot be licensed for general web use. Put
to the user as a direct choice and IBM Plex was chosen. It holds the same register as the board
asks for — clean, modern, confident, built for clarity — and it brings its own matched monospace,
which Inter does not.

Also rejected: Exo/Roboto Mono, the top database match for this product type. Exo is a sci-fi
display face and "overly futuristic" is on the project's Avoid list.

```
H1 (hero)        clamp(2.4rem, 6.2vw, 5rem) / 1.02 / -0.035em
Section heading  clamp(1.8rem, 3.6vw, 3.1rem) / 1.08 / -0.025em
Body             1.0625rem / 1.62
Data (mono)      0.9375rem / 1.4 / tabular-nums
Eyebrow (mono)   0.75rem / uppercase / 0.18em
```

Headlines never exceed 9 words. Body paragraphs never exceed 3 lines — anything longer wants a
diagram instead.

---

## 7. Color

```
--bg          #0B0D10   near-black, never pure   [brand]
--surface     #1A1D21                            [brand]
--steel       #E6E8EB   light sections (§3 only) [brand]
--text        #F5F5F0
--muted       #3A3F46 → lightened for contrast    [brand base]
--line        rgba(245,245,240,0.10)

--identity    #2D7BFF                            [brand]   DATC. Brand, links, the module LED, the uplink beam.
--authorized  #22C55E   State: verified. Status pills, the corridor.
--denied      #EF4444   State: unverified. Hero beat B ONLY. Nowhere else.
```

Red appearing exactly once is what gives it force. The moment it shows up in an icon or a chart,
the hero loses its punch. One light section only — §3, where light reads as blueprint.

---

## 8. Assets

| Asset | Needed for | Source |
|---|---|---|
| `drone.glb` | Hero | Sketchfab / CGTrader / TurboSquid |
| `module.glb` | Hero | Blender, or commissioned |
| `studio.hdr` | Hero lighting — **now optional** | Poly Haven (CC0). three.js `RoomEnvironment` generates equivalent image-based lighting procedurally and is in use; an HDRI would only be for finer control. |
| Hero still | Reduced-motion + no-WebGL fallback | Screenshot of the finished scene |
| OG image 1200×630 | Link previews | Screenshot |
| Favicon | — | From the DATC mark |

Sections 3 and 4 remain inline SVG line diagrams — those are process drawings, not rendered
objects, and line art is correct for them.

---

## 9. Open items

None. All decisions are closed.

- Beat C copy: the measured option (§4).
- Contact address: `vihaan.mittal@pathways.in`.
- Typography: IBM Plex, chosen over the brand board's Inter (§6).
- Hero technique: real 3D models, sourced (§4, §8).

Outstanding **inputs**, not decisions: `drone.glb`, `module.glb`, `studio.hdr`.

---

## 10. Build order — not started

1. Static structure, all 7 sections, real copy, no motion, hero as three stacked frames.
2. Hero pin and the three beats.
3. Mechanism pin, then the fade-ups.
4. Polish: contrast, focus states, reduced motion, mobile pin timing, 375/768/1024/1440.
5. Deploy.

Built. `index.html`, `styles.css` and `hero.js` are the live page; `devserver.py` serves it in
development with no-store headers and asset stamping.

Assets in `public/models/`: `drone.glb` (DJI Mavic 3, CC BY, compressed 17.6 MB → 1.3 MB) and
`city-light.exr` (Joburg Central Sunset 1K, CC0). Unused files from earlier passes — the
uncompressed drone, the 2K sky and a Boeing 787 — have been removed; the originals remain in
Downloads if ever needed.
