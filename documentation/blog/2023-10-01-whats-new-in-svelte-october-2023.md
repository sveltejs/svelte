---
title: "What's new in Svelte: October 2023"
description: "Reactions to Runes and SvelteKit +server fallbacks"
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Svelte 5 isn't out yet (you can, however, [preview it now](https://svelte-5-preview.vercel.app/)), but that doesn't mean we don't get a sneak peek! Most notably are [Runes](https://svelte.dev/blog/runes) - a simpler way to manage reactive variables in Svelte code. There's lots of links the showcase section for deeper dives on all things Runes, but let's talk about what else been released this month...

## What's new in Svelte & Language Tools
- [Svelte 4.2.1](https://github.com/sveltejs/svelte/blob/master/packages/svelte/CHANGELOG.md#421) was released with a bunch of fixes to HTML, CSS and sourcemap compilation
- [The latest version of the Svelte language tools](https://github.com/sveltejs/language-tools/releases/tag/extensions-107.11.0) [enhances component references](https://github.com/sveltejs/language-tools/pull/2157) in the "Find All References" command, [fixes a persistent issue with automated types going missing](https://github.com/sveltejs/language-tools/pull/2160) after restarting a project and [adds fallback handling to auto-types](https://github.com/sveltejs/language-tools/issues/2156) (like those found in SvelteKit's `+server.js` files)

## What's new in SvelteKit
- `+server.js` now has a catch-all handler that handles all unimplemented valid server requests. Just export a `fallback` function! (**1.25.0**, [Docs](https://kit.svelte.dev/docs/routing#server-fallback-method-handler), [#9755](https://github.com/sveltejs/kit/pull/9755))

That's all for the new features! If you're looking for other patches and performance updates, check out the [SvelteKit CHANGELOG](https://github.com/sveltejs/kit/blob/master/packages/kit/CHANGELOG.md). You can also find adapter-specific CHANGELOGs in each of [the `adapter` directories](https://github.com/sveltejs/kit/tree/master/packages).

---

## Community Showcase

[Svelte Summit Fall](https://www.sveltesummit.com/) is happening on Nov 11, 2023. The 7th Virtual Svelte Conference is [open for proposals until October 15](https://sessionize.com/svelte-summit-fall-2023/) - anyone can submit!

Threlte [is throwing a hackathon](https://threlte.xyz/hackathon) (**motion warning for the landing page** - it will respect Reduce Motion settings). The kickoff event is on Sunday, 15 October 2023 16:00 UTC.

**Apps & Sites built with Svelte**
- [game-of-life-svelte](https://github.com/StephenGunn/game-of-life-svelte) is a Conway's Game of Life implementation using SvelteKit tech
- [Limey](https://limey.io/) is an easy-to-use website builder for simple sites and landing pages
- [Appwrite's new landing page](https://appwrite.io/) is now written with SvelteKit (previously covered was their [console UI](https://github.com/appwrite/console) in Svelte)
- [PlaceIt](https://github.com/Dae314/placeit-game) is a game about numbers and places
- [Sveltroid](https://sveltroid.vercel.app/) is a fan-made recreation of Metroid Prime: Remastered ([code](https://github.com/TylerTonyJohnson/Metroid))
- [Bolighub](https://www.bolighub.dk/) is a Denmark housing search portal
- [Dithering](https://www.sigrist.dev/dithering) is a tool to dither photos with plenty of options
- [Rocky Mountain Slam](https://www.rockymountainslam.com/) is an interactive map to follow Jason Heyn as he attempts to complete the first ever Rocky Mountain Slam ([code](https://github.com/martyheyn/rocky-mnt-slam))


**Learning Resources**

_Featuring Svelte Contributors and Ambassadors_
- [Svelte 5: Introducing Runes... with Rich Harris](https://www.youtube.com/watch?v=RVnxF3j3N8U) and its follow-up: [Svelte 5 runes: what's the deal with getters and setters?](https://www.youtube.com/watch?v=NR8L5m73dtE)
- [Conditionally stream data in SvelteKit](https://geoffrich.net/posts/conditionally-stream-data/) by Geoff Rich
- [Svelte Runes Change How Reactivity Works In Svelte](https://www.youtube.com/watch?v=TOTUXiYZhf4), [Make A 3D GitHub Skyline With Svelte To Flex On Your Peers](https://www.youtube.com/watch?v=f9fd1L1FEts), [Simple Page Transitions Using The View Transitions API With SvelteKit](https://www.youtube.com/watch?v=q_2irZO4SS8) and [Using JavaScript Libraries With Svelte Is Easy](https://www.youtube.com/watch?v=N9OjaQ0XtKQ) by Joy of Code
- [Modern Web Podcast S11E2](https://modernweb.podbean.com/e/modern-web-podcast-s11e2-exploring-svelte-open-source-and-discord-bots-with-willow-ghost/) - Exploring Svelte, Open Source, and Discord Bots with Willow (GHOST)
- [We are back! Svelte 5, Transitions, What's New?!](https://www.svelteradio.com/episodes/we-are-back-svelte-5-transitions-whats-new) by Svelte Radio
- This Week in Svelte:
  - [2023 September 1](https://www.youtube.com/watch?v=fonBnVCIrjE) - SvelteKit 1.24.0, View Transitions API, AbortController
  - [2023 September 8](https://www.youtube.com/watch?v=jfBjmczZwRc) - SvelteKit 1.24.1, Capacitor walkthrough, reusing prop types
  - [2023 September 15](https://www.youtube.com/watch?v=qH2FavwhU88) - SvelteKit 1.25.0, deserialize form data, magic is coming
  - [2023 September 22](https://www.youtube.com/watch?v=ek7KE1EDu2w) - Svelte 5 Runes!


_To Watch_
- [RUNES - Coming in Svelte v5 | My Take](https://www.youtube.com/watch?v=iCK1coch1wA) by Coding Garden
- [Don't Sleep on Svelte 5](https://www.youtube.com/watch?v=DgNWssn2vpc) and [Level Up Your Svelte Stores](https://www.youtube.com/watch?v=-vjNAyL2JCQ) by Huntabyte
- [Introduction To Svelte Runes (Every Svelte Rune Explained)](https://www.youtube.com/watch?v=gihSBVfyFbI) by Cooper Codes
- [Svelte Runes: Awesome or Awful?](https://www.youtube.com/watch?v=JRZCqUOmFwY) by Jack Herrington
- [Let Build A Youtube Clone With SvelteKit (Svelte, Tailwind Css, RapidApi, Shadcn Svelte, Axios, etc)](https://www.youtube.com/watch?v=65yMfpsoH4o) by Lawal Adebola


_To Read_
- [Create the Perfect Sharable Rune in Svelte](https://dev.to/jdgamble555/create-the-perfect-sharable-rune-in-svelte-ij8) by Jonathan Gamble
- [You Don't Need to "Learn" Svelte](https://kaviisuri.com/you-dont-need-to-learn-svelte) by KaviiSuri
- [Build Websites with Prismic and SvelteKit](https://prismic.io/blog/sveltekit-prismic-integration) by Angelo Ashmore
- [How to embed Svelte apps inside PHP?](https://www.okupter.com/blog/php-embed-svelte) by Justin Ahinon
- [Using Web Browser's Indexed DB in SvelteKit](https://dev.to/theether0/using-web-browsers-indexed-db-in-sveltekit-3oo3) by Shivam Meena
- [Integrate Storybook in Svelte: Doing it the Svelte-way](https://mainmatter.com/blog/2023/09/18/integrate-storybook-in-svelte-doing-it-the-svelte-way/) by Oscar Dominguez
- [The Sveltekit tutorial: Part 1 | What, why, and how?](https://tntman.tech/posts/sveltekit-guide-part-1) by Suyashtnt


**Libraries, Tools & Components**
- [KitForStartups](https://github.com/okupter/kitforstartups) is an Open Source SvelteKit SaaS boilerplate
- [SuperNavigation](https://github.com/0xDjole/super-navigation) is a mobile-like navigation UX for the web
- [skeleton-material-theme](https://github.com/plasmatech8/skeleton-material-theme) is a Material theme for the Skeleton UI library
- [better-i18n-for-svelte](https://github.com/versiobit/better-i18n-for-svelte) is a SEO focused library for multi-language SvelteKit sites
- [uico](https://github.com/rossrobino/uico) is a Tailwind plugin that provides utility classes for basic UI elements
- [svelte-maskify](https://www.npmjs.com/package/svelte-maskify) is a action wrapper for AlpineJS masks
- [sveltekit-capacitor](https://github.com/Hugos68/sveltekit-capacitor) is a template for building a SvelteKit SPA with Capacitor
- [router-gen.ts](https://gist.github.com/HugeLetters/7a2813897dfe08fa948a13cac8a359c7) is a type-safe router for SvelteKit

That's it for this month! Feel free to let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋
