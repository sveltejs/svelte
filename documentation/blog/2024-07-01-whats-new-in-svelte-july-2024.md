---
title: "What's new in Svelte: July 2024"
description: 'svelte/events, simpler elements and more optional options'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

This month, we got a bunch of new features in the Svelte 5 release candidate, Rich Harris [explained to Prismic's CEO](https://www.youtube.com/live/uWLTDUjNrhQ) how Svelte optimizes for vibes and Geoff Rich [shared even more about this philosophy at CascadiaJS 2024](https://cascadiajs.com/2024/talks/optimize-for-vibes-svelte-5-and-the-new-age-of-svelte).

Let's jump in!

## What's new in Svelte
Below, you'll find the highlights from the Svelte 5 release notes (now in [Release Candidate](https://www.npmjs.com/package/svelte?activeTab=versions)):

- The new `on` import from `svelte/events` allows you to preserve the event order of a handler (**5.0.0-next.152**, [Docs](https://svelte-5-preview.vercel.app/docs/imports#svelte-events), [#11912](https://github.com/sveltejs/svelte/pull/11912))
- Event handlers and bindings will now yield effect updates (Breaking Change, **5.0.0-next.140**, [#11706](https://github.com/sveltejs/svelte/pull/11706))
- The `Component` type now represents the new shape of Svelte components (**5.0.0-next.143**, [#11775](https://github.com/sveltejs/svelte/pull/11775))
- `<svelte:document>` now has both `activeElement` and `pointerLockElement` binds (**5.0.0-next.150**, [#11879](https://github.com/sveltejs/svelte/pull/11879))
- `svelte:element`, CSS custom property wrappers and string normalization have all been simplified and made more performant (**5.0.0-next.152**, [#11773](https://github.com/sveltejs/svelte/pull/11773), [#11948](https://github.com/sveltejs/svelte/pull/11948), [#11954](https://github.com/sveltejs/svelte/pull/11954), [#11792](https://github.com/sveltejs/svelte/pull/11792), [#11949](https://github.com/sveltejs/svelte/pull/11949))
- `render`, `mount` and `hydrate` options are now actually optional (**5.0.0-next.163**, [Docs](https://svelte-5-preview.vercel.app/docs/imports#svelte), [#12111](https://github.com/sveltejs/svelte/pull/12111))

---

## Community Showcase

**Apps & Sites built with Svelte**

- [Shootmail](https://shootmail.app/) is an email template and content creation tool
- [wplatest](https://wplatest.co/) automates your WordPress plugin updates across multiple websites
- [Svelte-MiniApps](https://github.com/Michael-Obele/Svelte-MiniApps) is a collection of bite-sized, user-friendly tools built with SvelteKit
- [Interior Render AI](https://www.interiorrenderai.com/) redesigns your interior with AI in seconds


**Learning Resources**

_Featuring Svelte Contributors and Ambassadors_
- [Prismic 🧡 Svelte: Meetup with Rich Harris, creator of Svelte!](https://www.youtube.com/live/uWLTDUjNrhQ) by Prismic
- [How Svelte and RSCs are Changing Web Development with Rich Harris, Creator of Svelte](https://www.youtube.com/watch?v=QTJtR8IUsQM) by This Dot Media
- [Learn Why JavaScript Frameworks Love Signals By Implementing Them](https://www.youtube.com/watch?app=desktop&v=1TSLEzNzGQM) and [The Svelte 5 Reactivity Guide For The Modern Developer](https://www.youtube.com/watch?v=tErKyuUTzsM) and [Crafting Magical Spells Using Svelte's Powerful Reactivity](https://www.youtube.com/watch?v=HnNgkwHZIII) by Joy Of Code
- [Practical Svelte 5 - Shopping Cart](https://www.youtube.com/watch?v=geAcAzheu_Y) by Huntabyte
- [CascadiaJS 2024: Optimize for vibes](https://geoffrich.net/posts/cascadiajs-2024/) by Geoff Rich (Livestream of Geoff's talk [starts at 1:08:30](https://www.youtube.com/live/o2VQXBI_yk8?si=Vv4FSZ367dC50Ii7&t=4110))
- This Week in Svelte - deep dives into the Svelte changelog and new learnings from the week:
  - [Ep. 66](https://www.youtube.com/watch?v=yaAGazsz6Lc) - adapter-node, new SvelteKit docs, Debugging Event modifiers in Svelte 5
  - [7 Jun](https://www.youtube.com/watch?v=5JNcz7mOfMI) - Validation libraries, $effect.active() usage
  - [31 May](https://www.youtube.com/watch?v=edoYKNgUQQI) - Floating UI, StartStopNotifier
- Svelte Society Vienna
  - [Ermin Celikovic — Building Web Components using Svelte](https://www.youtube.com/watch?v=T4zwmtUW7Gw)
  - [Domenik Reitzner — Svelte 5 Runes explained for Vue devs](https://www.youtube.com/watch?v=4idUQlFV02I)
- [Svelte London — June 2024](https://www.youtube.com/watch?v=J5srLwhlBdw)
- [Svelte Dev Vlog — June 2024](https://www.youtube.com/watch?v=4TGwlWFoGvM) with Rich Harris


_To Read_

- [Lessons using sveltekit to build a dataviz platform](https://www.reddit.com/r/sveltejs/comments/1dggvhh/lessons_using_sveltekit_to_build_a_dataviz/) by DNLBLN on Reddit
- [Frontend Frameworks in 2024 for eCommerce](https://crystallize.com/blog/best-frontend-frameworks?utm_medium=social&utm_source=Discord) by Crystallize
- [Using Unplugin Icons in SvelteKit: A Step-by-Step Guide](https://www.launchfa.st/blog/sveltekit-unplugin-icons) by Rishi Raj Jain
- [Migrating Tronic247 from WordPress to SvelteKit](https://www.tronic247.com/migrating-tronic247-from-wordpress-to-sveltekit?_) and [Methods to Load Data in Svelte and SvelteKit](https://www.tronic247.com/methods-to-load-data-in-svelte) by tronic247


_To Watch_

- [The Easiest Way to Build Web Apps](https://www.youtube.com/watch?v=ZT0yQgUIZho) and [13 Svelte Concepts you Need to Know](https://www.youtube.com/watch?v=A-6MVm0yt20) by Awesome
- [SvelteKit Form Validation with Zod](https://www.youtube.com/watch?v=11AbCRomRhs) by Ross Robino
- [Bringing together Auth and Payments with AirBadge](https://www.youtube.com/watch?v=6w3v9QD2ae4) by Stripe Developers
- [Svelte 4 vs. Svelte 5 – Runes and Snippets](https://www.youtube.com/watch?v=X37exLLQHwg) by SvelteRust



**Libraries, Tools & Components**

- [svelte5-commenter](https://github.com/cardgraph22/svelte5-commenter) is component demonstration for the common comments section
- [SSC](https://github.com/ssc-project/ssc) (Speedy Svelte Compiler) is a super-fast Svelte compiler written in Rust


That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next month 👋
