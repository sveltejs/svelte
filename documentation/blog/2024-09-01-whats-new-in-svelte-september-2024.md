---
title: "What's new in Svelte: September 2024"
description: 'More useful `svelte:options` and `:global`, plus the deprecation of `<svelte:component>` in Svelte 5'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

A bunch of updates to Svelte dropped in the last few weeks, plus a few quality of life improvements in the Svelte language tools.

Let's take a look...

## What's new in Svelte and Language Tools

- `$state.frozen` has been replaced with `$state.raw` (**5.0.0-next.218**, [Docs](https://svelte-5-preview.vercel.app/docs/runes#state-raw), [#12808](https://github.com/sveltejs/svelte/pull/12808))
- `$state.is` has been removed. RIP, little guy ([#12916](https://github.com/sveltejs/svelte/pull/12916))
- `$state.link` was added, experimented with, and then removed (**5.0.0-next.229 - 232**, [#12545](https://github.com/sveltejs/svelte/pull/12545) and [#12943](https://github.com/sveltejs/svelte/pull/12943))
- `svelte:options` lets you do a per-component css injection (**5.0.0-next.209**, [#12660](https://github.com/sveltejs/svelte/pull/12660))
- `<svelte:component>` is now unnecessary in runes mode and has now been deprecated (**5.0.0-next.203/217**, [#12646](https://github.com/sveltejs/svelte/pull/12646) and [#12694](https://github.com/sveltejs/svelte/pull/12694))
- `:global` is now allowed in more places - making it easier to use in `<style>` tags and fixing issues with Tailwind's `@apply` (**5.0.0-next.199**, [Docs](https://github.com/sveltejs/svelte/blob/main/documentation/docs/02-template-syntax/05-styles-and-classes.md), [#12560](https://github.com/sveltejs/svelte/pull/12560))
- A warning will now be emitted if binding to a non-reactive property **(5.0.0-next.192**, [#12500](https://github.com/sveltejs/svelte/pull/12500))
- Svelte's dynamic typescript definitions will now warn when its diagnostics detect a `d.ts` file was not generated (**svelte2tsx@0.7.14**, [#2428](https://github.com/sveltejs/language-tools/pull/2428))
- You can now specify a tsconfig in `emitDts` - helpful when working in a monorepo (**svelte2tsx@0.7.16**, [#2454](https://github.com/sveltejs/language-tools/pull/2454))

Not covered in this list are a ton of efficiency and performance improvements across css and javascript compilation. If you're interested, check out the [CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md) for more on how destructuring, state proxies and actions/styles/classes have all improved since last month.

---

## Community Showcase

**Apps & Sites built with Svelte**

- [Apple Podcasts for the web](https://podcasts.apple.com/us/browse) now uses Svelte
- [UCLA Student Affairs](https://www.studentaffairs.ucla.edu/) has created their website with SvelteKit
- [tidytube](https://github.com/kakajuro/tidytube) is a browser extension to declutter Youtube's UI
- [Graphite](https://graphite.rs/blog/graphite-progress-report-q2-2024/) is an open source 2D procedural graphics editor
- [My Yogi](https://www.yogi.my/) is a yoga sequence builder and manager
- [Mark Of Destiny](https://markofdestiny.com/) is a multiplayer online strategy game where you are the ruler of a small developing kingdom
- [Dungeons and Jacks](https://github.com/deozza/roguejack) is a game mixing blackjack and roguelite elements
- [YT Desk](https://github.com/isaxk/ytdesk) is a standalone player for YouTube and Youtube Music with a miniplayer, Discord "Rich Presence" and global shortcuts
- [Synapsis](https://h.tronic247.com/introducing-synapsis-the-complete-ai-based-learning-platform) is an AI-based learning platform 

**Learning Resources**

_Featuring Svelte Contributors and Ambassadors_
- [React VS Svelte - Which one should you choose in 2024?](https://www.youtube.com/watch?v=fR6DFKq13J0), [Svelte 5 Runes - How to talk to the compiler](https://www.youtube.com/watch?v=_SpO5T96AYY) and [Creating your JavaScript framework?](https://www.youtube.com/watch?v=i-BkN3rTK0Q) by Prismic (featuring Rich Harris)
- [Local First with Replicache - How to Build a Full Stack App with Data Syncing Part 1](https://www.youtube.com/watch?v=7gZGVT5wdX4) by Syntax
- [Avoid Using Effects To Derive Values In Svelte](https://www.youtube.com/watch?v=7N4maEDhy4w) and [Understanding Effects In Svelte And When To Use Them](https://www.youtube.com/watch?v=HRz_rU2BlZc) by Joy of Code
- [Svelte Dev Vlog (with Simon) — July 2024](https://www.youtube.com/watch?v=uqnbA1xDe8k)
- [Svelte London - August](https://www.youtube.com/watch?v=QUdntTVombw): Svelte's Boundary Areas and Prototyping Tools (in Svelte!)
- This Week in Svelte:
  - [Ep. 71](https://www.youtube.com/watch?v=cdbSCoJ6_SU) — Listening to object updates using $effect, IntelliJ, Icons
  - [Ep. 72](https://www.youtube.com/watch?v=g_XLZlrGEuc) — Changelog, using AI with Svelte 4 and 5, Icon components
  - [Ep. 73](https://www.youtube.com/watch?v=w1PfHMMbkvw) — Changelog, OptimistiKit, database options


_To Read_

- [Svelte 5 signals fix its glitchy and inconsistent reactivity](https://www.webdevladder.net/blog/svelte-5-signals-fix-its-glitchy-and-inconsistent-reactivity) by webdevladder
- [Why Svelte is a game changer for IIoT development](https://behind.flatspot.pictures/svelte-for-iiot-hmis-the-future-of-industrial-interfaces/) by Peter Repukat
- [Local First with Cloud Sync using Firestore and Svelte 5 Runes](https://captaincodeman.com/local-first-with-cloud-sync-using-firestore-and-svelte-5-runes) by Captain Codeman
- [SvelteKit - Potential Information Leakage from the State](https://blog.yuki-dev.com/blogs/jv8q0pt_42vl#hef725b6a43) by Yuki Ishii
- [Fine-Grained Reactivity in Svelte 5](https://frontendmasters.com/blog/fine-grained-reactivity-in-svelte-5/) by Frontend Masters
- [Broadcasting messages on Chrome extensions](https://medium.com/@wilkerlucio/broadcasting-messages-on-chrome-extensions-6f7718c662f5) by Wilker Lucio
- [Everything you need to know about: Svelte](https://medium.com/@jeooocarlo/everything-you-need-to-know-about-svelte-b63ff0f5d1b4) by Jeo Carlo Lubao


_To Watch_

- [Svelte 4 vs Svelte 5 🎇. what are the difference](https://www.youtube.com/watch?v=CbZUXGhxZX8) by Lawal Adebola
- [How to deploy your Sveltekit application with Firebase Hosting and Firebase Functions (adapter-node)](https://www.youtube.com/watch?v=Yle8DtdMYmo) by Melchisedek Dulcio


**Libraries, Tools & Components**

- [This gooey tooltip](https://svelte.dev/repl/790fd75f954846be83afaa9e5ea821a8?version=4.2.18) is fluid and satisfying
- [select-kit](https://github.com/snehalbaghel/select-kit) is a one-stop solution for all your select/combobox/autocomplete needs
- [ssgoi](https://github.com/meursyphus/ssgoi) is a page transition library thats support animated page transition with every browser - including Safari
- [@svelte-put/preaction](https://svelte-put-next.vnphanquang.com/docs/preaction) is a proof-of-concept Svelte preprocessor that allows usage of "preaction" - an extension to Svelte action with the ability to add static attributes on server-side
- [svelte-standalone](https://github.com/brenoliradev/svelte-standalone) is a series of configurations that aims to process any svelte widget to a single standalone javascript file

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋
