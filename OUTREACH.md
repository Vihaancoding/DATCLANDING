# Outreach drafts

Three audiences, three different asks. Nothing here is sent — these are drafts to edit.

The rule running through all of them: **lead with the question, not the project.** Nobody owes
a stranger a site visit. They might answer a good engineering question, and the link is where
they go if the question interests them.

---

## 1. PX4 / ArduPilot forums

Best audience for the link-drop problem. These are people who have actually lost telemetry
mid-flight and argued about what should happen next. Post in Developer / General, not Showcase.

**Subject:** Link loss and authorization state — fail open or fail closed?

> I'm working on a school research project on drone identity: a module that reports who a
> drone is, checked against a live authorization record, so an authority can verify an
> aircraft in flight rather than trusting a form filled in beforehand.
>
> The part I can't resolve is what happens when the link drops.
>
> Fail open and an aircraft nobody can verify stays airborne, which defeats the point. Fail
> closed and a licensed operator loses a flight to bad coverage, which is the original problem
> in a new costume. Neither is acceptable, and over rural India the link dropping isn't an edge
> case.
>
> What I've considered: a signed authorization cached on the module valid for a bounded window,
> a degraded mode with a tighter geofence, store-and-forward reconciled on reconnect. All of
> them feel like they trade the same thing.
>
> If you've kept a system working when the network doesn't — drone comms, telemetry, industrial
> control — what broke, and what would you never do again?
>
> Context if useful: https://datc-drones.in
> I'm in Grade 9, so assume I've missed something obvious and say so.

**Why it's shaped this way:** the technical question is the whole first two-thirds. The last
line pre-empts the "this kid doesn't know what he doesn't know" reaction by saying it first,
which makes people more willing to correct rather than dismiss.

---

## 2. Reddit

Two subreddits, two different questions. Post one, wait a few days, post the other. Reddit
punishes anything that reads as promotion, so there is no link and no project name in either.

Both are written to give nothing away. The link-loss trade-off is a real question on its own
terms — you can ask it without describing what you are building, and the answers are just as
useful.

### r/diydrones — the engineering question

Builders and firmware people. Best fit for the failure-mode question.

**Title:** What should a drone do if it loses its connection to a ground authorization service?

> Hypothetical I keep going in circles on.
>
> Say a drone has to stay in contact with a service that says whether it's currently cleared to
> fly. Mid-flight, the link drops.
>
> Two options. It keeps flying, and now something is in the air that can't be checked. Or it
> comes down, and an operator who did nothing wrong loses a flight to bad signal.
>
> Is there a third answer? I keep landing on some version of "cache a permission that expires,"
> but that just moves the problem to how long the window is.
>
> Anyone dealt with something like this in practice?

### r/drones — the regulation question

Operators and people who follow the rules closely.

**Title:** How would a rule requiring live authorization checks actually get adopted?

> Curious about the process rather than the tech.
>
> If someone proposed that drones should be checkable in real time — not just registered
> beforehand — who would actually have to agree for that to become a requirement? Regulator
> first, manufacturers first, insurers?
>
> Has anything similar gone from proposal to mandatory, and how long did it take?

**If someone asks what you're working on**, then say so and link it. Volunteered, it reads as
an ad; asked for, it reads as an answer.

---

## 3. Targeted email

Highest value, lowest volume. Find people who have published on UTM, Remote ID, or Digital Sky
— authors of papers, people who worked at a regulator, anyone who has run a drone registration
programme. **One question per email**, matched to what that person actually knows.

**Subject:** One question about drone authorization, from a school project

> Dear Dr <name>,
>
> I read <specific paper or work> — <one concrete sentence about what you took from it, so it's
> clear you actually read it>.
>
> I'm a Grade 9 student in Gurgaon working on drone identity verification: a module reporting
> identity in flight, checked against a live authorization record. I've built a registration
> and safety-analysis system and an approval dashboard; the physical module is early and
> nothing has flown.
>
> My question is the one I can't research my way out of: **how does adoption actually begin?**
> A verification layer nobody is obliged to check is just a concept, and I don't understand who
> has to be convinced first, or in what order.
>
> If you have fifteen minutes at some point I'd be grateful. If not, no reply needed.
>
> Vihaan Mittal
> Pathways School Gurgaon
> https://datc-drones.in

**Vary the question by recipient:**

| Who they are | Ask them |
|---|---|
| Regulator / policy | How does adoption begin? Who has to be convinced first? |
| Comms / embedded engineer | What breaks when the network doesn't hold, and what would you never do again? |
| Privacy / data governance | What would you insist on before a system like this held real operator records? |

---

## Handling replies

Expect most to go unanswered — that's normal and not a signal about the idea. For the ones that
do reply:

- Answer within a day, while they still remember writing it.
- If they correct something, say what you changed. People who see their advice used tend to
  keep helping.
- Don't ask for a second thing in the first reply.
- If a criticism lands, put it on the site. The open-problems section is stronger for naming
  real objections than for looking finished.
