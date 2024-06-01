---
title: "What's new in Svelte: June 2024"
description: 'Better `bind`s, migration tooling and a new comparison rune'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

The maintainers have been hard at work getting the [Svelte 5 Release Candidate](https://svelte.dev/blog/svelte-5-release-candidate) ready for release. In this month's newsletter, you'll find highlights from the pre-release [CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md) and a host of items from our community showcase.

Let's dive in!

## What's new in Svelte

- `bind:` is now disallowed on component exports in runes mode and has much better types to tell if a prop is `$bindable` (**5.0.0-next.113, 114 and 125**, [Docs](https://svelte-5-preview.vercel.app/docs/runes#bindable), [#11238](https://github.com/sveltejs/svelte/pull/11238), [#11225](https://github.com/sveltejs/svelte/pull/11225) and [#11498](https://github.com/sveltejs/svelte/pull/11498))
- Tons of work on the `migrate` tool to make migrating to Svelte 5 syntax easier (**5.0.0-next.116, 136 and 137**, [Docs](https://svelte-5-preview.vercel.app/docs/old-vs-new), [#11334](https://github.com/sveltejs/svelte/pull/11334), [#11659](https://github.com/sveltejs/svelte/pull/11659), [#11704](https://github.com/sveltejs/svelte/pull/11704))
- MathML is now supported (**5.0.0-next.120**, [Docs](https://www.w3.org/TR/mathml-core/#mathml-elements-and-attributes), [#11387](https://github.com/sveltejs/svelte/pull/11387))
- The Svelte Inspector is now supported (**5.0.0-next.125**, [Docs](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/inspector.md), [#11514](https://github.com/sveltejs/svelte/pull/11514))
- The `$state.is` rune lets you compare values or check if an object exists within a deeply reactive object/array (**5.0.0-next.134**, [Docs](https://svelte-5-preview.vercel.app/docs/runes#state-is), [#11613](https://github.com/sveltejs/svelte/pull/11613))
- The `rootDir` compiler option makes filenames relative to simplify development in monorepos or complex folder structures (**5.0.0-next.135**, [#11627](https://github.com/sveltejs/svelte/pull/11627))


---

## Community Showcase

**Apps & Sites built with Svelte**

- [Onlook](https://onlook.dev/) is a chrome extension that enables designers to contribute to their team's UI codebase
- [Fluid Type Generator](https://fluid-type.tolin.ski/) is a modern fluid type generator built with Svelte 5
- [LCH Palette Generator](https://github.com/pauslyapp/lch-palette) is a tool that allows you to easily create and save gradient palettes to be used in UI design
- [Typepost](https://dezain.io/typepost/) is a simple text post generator for social media
- [Equimake](https://equimake.com/) is a collaborative real-time 3D platform for learners, gamers, artists, and coders
- [svelte.dev-machine](https://github.com/Neosoulink/svelte.dev-machine) is a physical based animation to replicate the Svelte machine on the svelte.dev homepage 


**Learning Resources**

_Featuring Svelte Contributors and Ambassadors_
- [Svelte 5: Compiler, Signals, and Web App Performance](https://www.youtube.com/watch?v=mjYt35lN3-k) by JSJ 627 with Rich Harris
- [Svelte London - May 2024](https://www.youtube.com/watch?v=EggM2qMzqdU)
- This Week in Svelte - deep dives into the Svelte changelog and new learnings from the week:
  - [3 May](https://www.youtube.com/watch?v=8FXwOtj5NpY)
  - [10 May](https://www.youtube.com/watch?v=3WcU7imp0lQ)
  - [17 May](https://www.youtube.com/watch?v=O1VoD-xhYqs)
  - [24 May](https://www.youtube.com/watch?v=HDjPn8FH-X0)


_To Read_

- [Securing Your SvelteKit App](https://captaincodeman.com/securing-your-sveltekit-app) and [Prevent Waterfalls from Multiple SvelteKit Server Hooks in sequence](https://captaincodeman.com/prevent-waterfalls-from-multiple-sveltekit-server-hooks-in-sequence) by Captain Codeman
- [Svelte 5 Todo App with Firebase](https://code.build/p/svelte-5-todo-app-with-firebase-X1Tr3J) by Jonathan Gamble


_To Watch_

- [Svelte 5 Runes Demystified](https://www.youtube.com/playlist?list=PLBvLZ-dkskrKpA01nOZiQE_1SBFyFNB-6) by Peter Makes Websites Ltd
- [How to Build an eCommerce Store with SvelteKit](https://www.youtube.com/watch?v=S1lK4eJH0tI&t=6s) by Crystallize


**Libraries, Tools & Components**

- [Floating UI Svelte](https://github.com/skeletonlabs/floating-ui-svelte) is a library for positioning floating elements and handling interaction
- [Svelte Animated Pixels](https://github.com/tncrazvan/svelte-animated-pixels) provides an easy way to create pixelated canvas animations by just declaring maps of pixels a strings
- [SvelteKit Passkey Template](https://github.com/passlock-dev/svelte-passkeys) is a SvelteKit template project featuring Passkey authentication, Google sign in and mailbox verification
- [svelte-infinite](https://github.com/ndom91/svelte-infinite) is an infinite scrolling library designed for Svelte 5 with runes
- [svelte-next](https://github.com/shinokada/svelte-next) attempts to automated Svelte library updates


That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next month 👋
