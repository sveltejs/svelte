---
title: "What's new in Svelte: May 2024"
description: ''
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Svelte Summit was last week - featuring a number of fantastic talks from across the community. In the final talk, What You Can Do For Your Framework, Rich Harris (with a little help from PuruVJ's neoconfetti library) [announced that Svelte 5 is now in the "Release Candidate"](https://www.youtube.com/live/gkJ09joGBZ4?si=O5HR0PF-TDvNdVNf&t=8898).

Lots of pre-release changes to cover in this post and a host of community showcase items... so let's dive in!

## Highlights from Svelte Summit Spring 2024

Below, you'll find links to all the talks in the livestream version of Svelte Summit.

- [Simple and Sustainable web development in academic libraries with Svelte](https://www.youtube.com/live/gkJ09joGBZ4?si=ha0iruRIXv2Mql1w&t=894)
- [Building a SaaS module for SvelteKit](https://www.youtube.com/live/gkJ09joGBZ4?si=bqRe0Fbykm9sUqZS&t=1517)
- [Intro To LayerChart](https://www.youtube.com/live/gkJ09joGBZ4?si=o3rn0WqGBBQckF_2&t=2680)
- [Spatial Programming with Threlte Studio](https://www.youtube.com/live/gkJ09joGBZ4?si=dBL-EfWTLtu4fYSt&t=4026)
- [Convex (Sponsored talk)](https://www.youtube.com/live/gkJ09joGBZ4?si=5KKpLYXi0fLQqwZZ&t=4891)
- [Kitbook: Easily Build, Document, Inspect & Test Svelte Components](https://www.youtube.com/live/gkJ09joGBZ4?si=NMhjp5rBWgf3lV76&t=5903)
- [Fullstack Testing](https://www.youtube.com/live/gkJ09joGBZ4?si=8p5CRD9z-LADsMtO&t=6749)
- [What You Can Do For Your Framework](https://www.youtube.com/live/gkJ09joGBZ4?si=h4LKM12I_vJBBLZ-&t=8515) - also covers a ton of the new features listed below

These will all get broken up into more sharable (and rewatchable) videos over time, so make sure you subscribe to the [Svelte Society YouTube channel](https://www.youtube.com/@SvelteSociety/featured) to keep up to date.

## What's new in Svelte

[Svelte 5 is in officially in the Release Candidate stage](https://svelte-5-preview.vercel.app/docs/introduction) and gets closer to release every day. Below, you'll find some highlights from its pre-release [changelog](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md):

- Hot module reloading is now supported in Svelte 5 (**5.0.0-next.97 and 101**, [#11106](https://github.com/sveltejs/svelte/pull/11106), [#11132](https://github.com/sveltejs/svelte/pull/11132))
- It is now possible to define global (or child global) styles in a block (**5.0.0-next.111**, [#11276](https://github.com/sveltejs/svelte/pull/11276))
- Compiled code is even more efficient for `if` blocks, `each` blocks and attribute updates (**5.0.0-next.83-85**, [#10906](https://github.com/sveltejs/svelte/pull/10906), [#10937](https://github.com/sveltejs/svelte/pull/10937) and [#10917](https://github.com/sveltejs/svelte/pull/10917))
- The built-ins from `svelte/reactivity` are now re-exported to be available on the server (**5.0.0-next.88**, [Docs](https://svelte-5-preview.vercel.app/docs/imports#svelte-reactivity), [#10973](https://github.com/sveltejs/svelte/pull/10973))
- A new reactive URL object is now available in `svelte/reactivity` (**5.0.0-next.103**, [Docs](https://svelte-5-preview.vercel.app/docs/imports#svelte-reactivity), [#11157](https://github.com/sveltejs/svelte/pull/11157))
- HTML tags are now faster with more efficient hydration markers (**5.0.0-next.90-91**, [#10986](https://github.com/sveltejs/svelte/pull/10986) and [#11019](https://github.com/sveltejs/svelte/pull/11019))
- The new `$host` rune retrieves the `this` reference of the custom element that contains a component - removing the need for `createEventDispatcher` (**5.0.0-next.96**, [Docs](https://svelte-5-preview.vercel.app/docs/runes#host), [#11059](https://github.com/sveltejs/svelte/pull/11059))


---

## Community Showcase

**Apps & Sites built with Svelte**

- 


**Learning Resources**

_Featuring Svelte Contributors and Ambassadors_
- 
- This Week in Svelte:
  - 

_To Read/Watch_

- 


**Libraries, Tools & Components**

- 


That's it for this month! Feel free to let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next month 👋
