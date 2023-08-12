---
title: "What's new in Svelte: November 2020"
description: Slot forwarding fixes, SvelteKit for faster local development, and more from Svelte Summit
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Welcome back to the "What's new in Svelte" series! This month, we're covering new features & bug fixes, last month's Svelte Summit and some stand-out sites and libraries...

## New features & impactful bug fixes

1. Destructuring Promises now works as expected by using the `{#await}` syntax
   (**3.29.3**, [Example](https://svelte.dev/repl/3fd4e2cecfa14d629961478f1dac2445?version=3.29.3))
2. Slot forwarding (released in 3.29.0) should no longer hang during compilation (**3.29.3**, [Example](https://svelte.dev/repl/29959e70103f4868a6525c0734934936?version=3.29.3))
3. Better typings for the `get` function in `svelte/store` and on lifecycle hooks (**3.29.1**)

**What's going on in Sapper?**

Sapper got some new types in its `preload` function, which will make typing easier if you are using TypeScript. See the [Sapper docs](https://sapper.svelte.dev/docs#Typing_the_function) on how to use them. There also were fixes to `preload` links in exported sites. Route layouts got a few fixes too - including ensuring CSS is applied to nested route layouts. You can also better organize your files now that extensions with multiple dots are supported. (**0.28.10**)

For all the features and bugfixes see the CHANGELOGs for [Svelte](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md) and [Sapper](https://github.com/sveltejs/sapper/blob/master/CHANGELOG.md).

## [Svelte Summit](https://sveltesummit.com/) was Svelte-tacular!

- Rich Harris demoed the possible future of Svelte development in a talk titled "Futuristic Web Development". The not-yet-public project is called SvelteKit (name may change) and will bring a first-class developer experience and more flexibility for build outputs. If you want to get the full sneak-peek, [check out the video](https://www.youtube.com/watch?v=qSfdtmcZ4d0).
- 17 speakers made the best of the conference's virtual format... From floating heads to seamless demos, Svelte developers from every skill level will find something of interest in this year's [YouTube playlist](https://www.youtube.com/playlist?list=PL8bMgX1kyZThM1sbYCoWdTcpiYysJsSeu)

---

## Community Showcase

- [Svelte Lab](https://sveltelab.app/) showcases a variety of components, visualizations and interactions that can be achieved in Svelte. You can click into any component to see its source or edit it, using the site's built-in REPL
- [svelte-electron-boilerplate](https://github.com/hjalmar/svelte-electron-boilerplate) is a fast way to get up and running with a Svelte app built in the desktop javascript framework, Electron
- [React Hooks in Svelte](https://github.com/joshnuss/react-hooks-in-svelte) showcases examples of common React Hooks ported to Svelte.
- [gurlic](https://gurlic.com/) is a social network and internet experiment that is super snappy thanks to Svelte
- [Interference 2020](https://interference2020.org/) visualizes reported foreign interference in the 2020 U.S. elections. You can learn more about how it was built in [YYY's talk at Svelte Summit]()
- [jitsi-svelte](https://github.com/relm-us/jitsi-svelte) lets you easily create your own custom Jitsi client by providing out-of-the-box components built with Svelte
- [Ellx](https://ellx.io/) is part spreadsheet, part notebook and part IDE. It's super smooth thanks to Svelte 😎
- [This New Zealand news site](https://www.nzherald.co.nz/nz/election-2020-latest-results-party-vote-electorate-vote-and-full-data/5CFVO4ENKNQDE3SICRRNPU5GZM/) breaks down the results of the 2020 Parliamentary elections using Svelte
- [Budibase](https://github.com/Budibase/budibase) is a no-code app builder, powered by Svelte
- [Svelt-yjs](https://github.com/relm-us/svelt-yjs) combines the collaborative, local-first technology of Yjs with the power of Svelte to enable multiple users across the internet to stay in sync.
- [tabler-icons-svelte](https://github.com/benflap/tabler-icons-svelte) is a Svelte wrapper for over 850 free MIT-licensed high-quality SVG icons for you to use in your web projects.

## See you next month!

Got an idea for something to add to the Showcase? Want to get involved more with Svelte? We're always looking for maintainers, contributors and fanatics... Check out the [Svelte Society](https://sveltesociety.dev/), [Reddit](https://www.reddit.com/r/sveltejs/) and [Discord](https://discord.com/invite/yy75DKs) to get involved!
