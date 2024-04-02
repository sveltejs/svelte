---
title: "What's new in Svelte: April 2024"
description: 'Svelte Summit Spring on April 27! Plus: reactive `Map`, `Date` and `Set`'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Spring is just around the corner (for half the globe at least), which means [Svelte Summit Spring](https://www.sveltesummit.com/) is coming soon! The event will be streamed on [the Svelte Society YouTube channel](https://youtube.com/sveltesociety) on April 27.

Also, this month, a ton of new features have been merged into Svelte 5 to make it the best version of Svelte yet. We'll get into them all below, so let's jump right in!


## What's new in Svelte

[Svelte 5 is in preview](https://svelte-5-preview.vercel.app/docs/introduction) and gets closer to release every day. Below, you'll find some highlights from its [changelog](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md):

- The new `Map`, `Date` and `Set` classes can now be imported from `svelte/reactivity` and used just like their native counterparts to fit into Svelte's reactivity model (**5.0.0-next.79**, [Docs](https://svelte-5-preview.vercel.app/docs/runes#state-frozen-reactive-map-set-and-date), [#10803](https://github.com/sveltejs/svelte/pull/10803), [#10622](https://github.com/sveltejs/svelte/pull/10622), [#10781](https://github.com/sveltejs/svelte/pull/10781))
- state/derived/props can be explicitly exported from components again (**5.0.0-next.62**, [#10523](https://github.com/sveltejs/svelte/pull/10523))
- `bind:value` now allows for a dynamic `type` attribute - fixing issues with common input bindings (**5.0.0-next.66**, [#10608](https://github.com/sveltejs/svelte/pull/10608))
- `SSR` HTML mismatch validation has been improved and provides clearer error messages (**5.0.0-next.69**, [#10658](https://github.com/sveltejs/svelte/pull/10658))
- **Breaking:** Slots inside templates with a `shadowrootmode` attribute are now preserved (**5.0.0-next.73**, [#10721](https://github.com/sveltejs/svelte/pull/10721))
- **Breaking:** The `$props()` no longer accepts a generic type argument. Instead, component authors should type their props like any other variable declaration (**5.0.0-next.76**, [#10694](https://github.com/sveltejs/svelte/pull/10694))
- The new `$bindable` rune allows parents to `:bind` to a component's prop in addition to using them as regular props ([Docs](https://svelte-5-preview.vercel.app/docs/runes#props-bindable), [#10851](https://github.com/sveltejs/svelte/pull/10851)) 
- The webkitdirectory DOM boolean attribute is now supported (**5.0.0-next.81**, [#10847](https://github.com/sveltejs/svelte/pull/10847))
- Form resets are now taken into account for two way bindings (**5.0.0-next.82**, [Docs](https://svelte-5-preview.vercel.app/docs/breaking-changes#other-breaking-changes-bindings-now-react-to-form-resets), [#10617](https://github.com/sveltejs/svelte/pull/10617))


## What's new in SvelteKit

- `adapter-vercel` now has Skew Protection which ensures that the client and server stay in sync for any particular deployment (**@sveltejs/adapter-vercel@5.2.0**, [Docs](https://vercel.com/docs/deployments/skew-protection), [#11987](https://github.com/sveltejs/kit/pull/11987))
- `adapter-vercel`'s build output files now include framework metadata - improving observability on the platform (**@sveltejs/adapter-vercel@5.2.0**, [#11800](https://github.com/sveltejs/kit/pull/11800))
- `adapter-cloudflare` and `adapter-cloudflare-workers` now implement `adapter.emulate` which allows the adapter to emulate the Cloudflare platform during dev and preview ([#11732](https://github.com/sveltejs/kit/pull/11732))
- **Breaking:** `adapter-node` now shuts down gracefully and supports the new `IDLE_TIMEOUT` and `SHUTDOWN_TIMEOUT` environment variables (**@sveltejs/adapter-node@5.0.1**, [Docs](https://kit.svelte.dev/docs/adapter-node#environment-variables-shutdown-timeout), [#11653](https://github.com/sveltejs/kit/pull/11653))
- **Breaking:** The default value of `precompress` in `adapter-node` is now `true` - making sites faster by default (**@sveltejs/adapter-node@5.0.0**, [Docs](https://kit.svelte.dev/docs/adapter-node#options-precompress), [#11945](https://github.com/sveltejs/kit/pull/11945))
- Google Cloud is now supported in `adapter-auto` without any additional configuration (**@sveltejs/adapter-auto@3.2.0**, [Docs](https://kit.svelte.dev/docs/adapter-auto), [#12015](https://github.com/sveltejs/kit/pull/12015))

For all the changes in SvelteKit, including bug fixes and adapter-specific changes check out the [CHANGELOGs in each of the packages](https://github.com/sveltejs/kit/tree/f1e73c2fe54280d254a1bdfba430a678f4db527a/packages).


---

## Community Showcase

**Apps & Sites built with Svelte**

- [notepad](https://www.usenotepad.com/) is a workspace for freelancers. Providing time tracking, tasks, reports, invoices and contacts all in one tool.
- [Tokenbase](https://github.com/mateoroldos/tokenbase) is a free tool for creating, managing and distributing Design Tokens. Easily create your Design Systems and export them to code in a few clicks.
- [MelloOS](https://mellobacon.github.io/mello_os/) is a fake OS desktop in the style of Windows 95
- [PowerHound](https://powderhound.io/) is an app for tracking snow conditions across Colorado's ski resorts and backcountry
- [ProductSurveys](https://productsurveys.io/) gathers user feedback directly inside your product
- [WAIfinder](https://github.com/nestauk/dsp_waifinder) is an interactive map shows entities operating in the AI industry in the UK
- [talkmedown](https://talkmedown.net/) is an emergency landing survival game using SvelteKit UI and Three.js graphics.
- [Bird Flapping](https://github.com/zonetecde/bird-flapping) is that game with a flapping bird (not to be confused with FlappyBird)
- [Minesweeper](https://codeberg.org/wires5210/minesweeper-funnymode) FUNNYMODE is minesweeper, but FUNNY
- [Routickr](https://www.routickr.com/) is a habit-tracking app with Firefox and Chrome extensions
- [immich](https://immich.app/) is a self-hosted photo and video management solution


**Learning Resources**

_Featuring Svelte Contributors and Ambassadors_
- Svienna (Svelte Society Vienna):
  - [Domenik Reitzner - A brief history of prototyping](https://www.youtube.com/watch?v=auqkebVQYXE)
  - [Lukas Stracke - Building an Error and Performance Monitoring SDK for SvelteKit](https://www.youtube.com/watch?v=N8Hs-LVL_f8)
  - [Jean Yves Couët - Are you on the right route? ](https://www.youtube.com/watch?v=K8sKpMSCOiE)
  - [Lucas Martin - Using SvelteKit to Build An Interactive Portfolio](https://www.youtube.com/watch?v=wAttcVDP4Ec)
- This Week in Svelte:
  - [22 Mar 2024](https://www.youtube.com/watch?v=QiAMLIyM894)
  - [8 Mar 2024](https://www.youtube.com/watch?v=_vQVkOa5K-s)

_To Read/Watch_

- [How we built our 41kb SaaS Website](https://criticalmoments.io/blog/how_we_built_our_marketing_page) by Critical Moments
- [Migrating a personal homepage to Svelte](https://jakeout.com/posts/2024-03-04-svelte) by Jake Ouelletee 


**Libraries, Tools & Components**

- [Svisualize](https://svisualize.dev/) is a VS Code Extension that visualizes your components as you code
- [Neel/UI](https://github.com/aidan-neel/neel-ui) is a shadcn-inspired set of customizable components that you can copy and paste into your SvelteKit apps
- [BLICKCSS](https://blick.netlify.app/) is a small (~30kb) CSS library to build great websites and web apps quickly and easily


That's it for this month! Feel free to let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next month 👋
