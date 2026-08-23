# Outreach

One Reddit post, and an email template for later. Ask the question, don't pitch the project.

---

## The post

r/diydrones. Check the sidebar rules before you post — a link to your own site in the body is
the thing most likely to get it removed, so it isn't in here. If someone asks, put it in a
comment.

**Title:** Drone has to check in with a server to stay authorized. What should it do when the
link drops?

> I'm building a thing for school where a drone has to check in with a server that says whether
> it's still cleared to fly. Works fine on a bench. Falls apart the moment I think about the
> link dropping.
>
> If it keeps flying, there's an aircraft up there nobody can check. If it lands itself, then
> somebody with a valid licence just lost a flight because the signal was bad. I live in
> Gurgaon and go flying outside the city, where losing signal isn't unusual, so I can't treat
> this as rare.
>
> Best I've come up with is caching a signed permission on the module that expires after some
> window. But then the whole question is just what the window is, and I have no basis for
> picking a number.
>
> My hardware is an ESP32 talking over Wi-Fi right now. No long range link yet. I know that's
> not a real answer for flight, I just haven't got there.
>
> Has anyone built something that had to keep working when the network didn't? What went wrong?
>
> I'm in 9th grade so tell me if I'm missing something obvious.

If someone asks to see it, reply with https://datc-drones.in

---

## 3. Email

The most useful and the slowest. Find people who've published on UTM, Remote ID, or Digital
Sky. One question per email, matched to what that person actually knows.

**Subject:** Question about drone authorization, from a school project

> Dear Dr <name>,
>
> I read <paper>. <One sentence about something specific in it. This is the only part that
> proves you actually read the thing, so it has to be real.>
>
> I'm in 9th grade in Gurgaon, working on drone identity verification. I've got a registration
> system that runs a safety analysis on the specs you submit, and a dashboard where an
> authority approves or denies with a reason. The module that would go on the drone is barely
> started and nothing has flown.
>
> The thing I can't figure out by reading is how adoption starts. If nobody is required to
> check it, it doesn't matter how well it works. I don't know who has to be convinced first, or
> whether that's even the right order.
>
> If you have fifteen minutes sometime I'd really appreciate it. If not that's completely fine.
>
> Vihaan Mittal
> Pathways School Gurgaon
> https://datc-drones.in

Change the question depending on who you're writing to:

| Who | Ask |
|---|---|
| Regulator or policy | How does adoption start? Who has to be convinced first? |
| Comms or embedded engineer | What breaks when the network doesn't hold? |
| Privacy or data governance | What would you want in place before this held real operator records? |

---

## When people reply

Most won't. That's normal and says nothing about the idea.

Reply within a day. If someone corrects you, tell them what you changed — people who see their
advice used tend to keep helping. Don't ask for a second thing straight away. And if a
criticism is good, put it on the site. The open problems section is better for naming real
objections than for looking finished.
