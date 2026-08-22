---
name: page-narrative
description: Structure a web page as an argument — sequence of sections, what motion earns its place, and why a reader arrives at a conclusion. Use this whenever the user is building or critiquing a landing page, portfolio, product page, marketing site, pitch, or any scrolling page meant to persuade; whenever they ask about scroll animation, parallax, pinned sections, reveals, or "make it feel premium"; and whenever they ask why a page works or doesn't. Also use for non-web sequencing problems — a slide deck, a project writeup, a proposal — where order determines whether the reader agrees. Trigger even if the user only asks about the animation, since motion decisions are almost always section-order decisions in disguise.
---

# Page Narrative

A scrolling page is not a document. It is a sequence of claims delivered on a timeline the reader controls. The scrollbar is a playhead. Every section is a beat, and its position in the sequence changes what it means.

Motion is punctuation on that timeline. It cannot rescue a bad sequence, and a good sequence usually survives having the motion stripped out. So the order comes first, always.

## The two jobs

**Analyzing** an existing page: name its beats in order, then explain why that order was chosen and what each animation is doing to the reader.

**Building** a page: decide the argument first, sequence the beats, then add motion only where a beat needs help landing.

Both jobs run on the same underlying model, below.

## Beats

Most persuasive pages assemble from a small vocabulary of beats. They are not all required and the order is not fixed — that's the entire point.

| Beat | What it does |
|---|---|
| Promise | States the outcome. Usually first because it buys attention. |
| Agitation | Names the reader's problem. Creates the itch. |
| Authority | Borrowed or earned credibility — logos, awards, numbers, bylines. |
| Proof | Evidence the promise is real — testimonials, screenshots, case studies, data. |
| Mechanism | *How* it works. Turns a claim into something believable. |
| Specifics | Curriculum, features, spec sheet. Concrete after the abstract. |
| Differentiation | Why this and not the obvious alternative. |
| Price | The ask. |
| Objection handling | FAQ, guarantee, refund terms. Removes the last reasons to leave. |
| Close | Final call to action. |

## Sequencing is the argument

Two pages can contain identical beats and persuade completely differently. Read the order as an argument about the reader's state of mind.

**Agitation before promise** — "You're stuck, and it's not your fault." Classic, effective on a cold audience who hasn't identified the problem yet. Feels manipulative to a skeptical reader, because they can see the wound being poked.

**Agitation after price** — the reader has already seen proof and a number before being told they're stuck. This lands as explanation rather than pressure. Better for warm or sophisticated audiences.

**Authority before any claim** — award logos scrolling past before the reader knows what's being sold. Cheap to implement, and the reader often can't articulate why they now trust the page.

**Mechanism before proof** — for technical or skeptical audiences who won't believe results until they understand the machine.

**Proof before mechanism** — for audiences who don't care how it works. Consumer, mostly.

When analyzing, always state the actual order you found and say what audience it implies. When building, ask who the reader is and what they already believe, then sequence backward from that.

## Motion

Every animation should answer: *what would the reader misunderstand if this were static?*

If there's no answer, cut it. That question is the whole filter.

Legitimate jobs for motion:

- **Sequencing** — forcing beats to arrive in order rather than letting the eye jump ahead. Pinned sections and staged reveals do this.
- **Relationship** — showing that two things are connected, by moving them together or transforming one into the other.
- **Weight** — slowing the reader down at the moment that matters most. Attention is the scarce resource; motion spends it.
- **Continuity** — carrying an element across a section boundary so the page reads as one argument instead of a stack of slabs.

Illegitimate but common: proving the developer knows GSAP.

### Choosing the technique

- **Pinned section + scroll-linked state** — one idea with multiple stages. Pin, then advance a step per scroll quarter. Costs a lot of viewport height, so reserve it for the single most important explanation on the page.
- **Staged reveal on enter** — a list where order matters. Cheap, low-risk.
- **Infinite marquee** — a set that should read as "many, ongoing." Duplicate the item set 2–3x in the DOM, translate by exactly one set's width, loop. The repetition is the effect: it implies more than you have.
- **Parallax** — depth. Genuinely useful for separating foreground content from background context; overused everywhere else.
- **Number count-up** — makes a statistic feel earned rather than asserted. One per page, maximum.
- **Scroll-driven transform of a single hero object** — expensive, memorable, and the single most-copied award-site move. Only worth it if the object *is* the product.

### Restraint

Heavy-motion pages win awards and lose users. Before shipping:

- Does it work with `prefers-reduced-motion: reduce`? This is an accessibility requirement, not a nicety — vestibular disorders make large parallax genuinely nauseating.
- Can the reader still get the argument by scrolling fast? Many will.
- Does it hold up on a mid-range phone? Most scroll-linked effects that feel great on a laptop stutter badly on mobile.
- Is anything gated behind an animation completing? Never make the reader wait for the content.

A page with three deliberate animations reads as more expensive than one with fifteen. Density signals amateur.

## Typography and layout as narrative

Motion is not the only way to sequence. Cheaper devices that do the same work:

- **Strikethrough → arrow → bold** (`~~not tutorials~~ → **a system**`) compresses an entire differentiation argument into one line. No illustration, no JS.
- **Scale jumps** — a single oversized number or word among body text creates a beat by itself.
- **Whitespace before a section** — the pause before a claim. Larger gap = more weight on what follows.
- **Alignment breaks** — one element that violates the grid is read as important.

Reach for these first. They survive fast scrolling, work on every device, and cost nothing.

## Analyzing an existing page

Work in this order:

1. **List the beats in the order they appear.** Use the vocabulary above. Don't editorialize yet.
2. **Name the audience the order implies.** Cold or warm? Skeptical or eager? Technical or not?
3. **Find the load-bearing animation** — the one that, if removed, would break comprehension rather than just polish. Often there is none, which is itself the finding.
4. **Check the seams.** Where does the page ask the reader to accept something they haven't been given grounds for? That gap is usually where the animation is loudest.
5. **Separate technique from ethics.** A page can be beautifully constructed and dishonest. Say both. Fake scarcity, unverifiable testimonials, invented anchor prices, and implied-but-unstated credentials are craft failures *and* integrity failures — name them as such rather than admiring the mechanics in isolation.

## Building a page

1. **Write the argument as prose first.** Three to six sentences, no design. If it isn't persuasive as a paragraph, no amount of scroll work will fix it.
2. **Assign each sentence a beat and a section.**
3. **Order the beats** against the audience's starting belief.
4. **Draft it fully static.** Real content, no motion. Read it top to bottom.
5. **Find the one place it fails.** Where does the argument not land? That is where motion goes.
6. **Add motion there, and nowhere else.** Then add back at most two more for texture.

Step 4 is the one people skip and the one that matters. A static draft exposes a weak argument immediately; motion hides it.

## Output

When analyzing, give the beat list as an ordered list with the beat name and what it's doing. Then the interpretation. Keep the interpretation shorter than the list — the sequence is the finding.

When building, deliver the prose argument and the beat order *before* any code. Get agreement on the sequence first; implementing the wrong sequence beautifully is the expensive mistake.
