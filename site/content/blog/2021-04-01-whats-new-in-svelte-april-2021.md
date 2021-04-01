---
title: What's new in Svelte: April 2021
description: SvelteKit beta and new way to use slots
author: Daniel Sandoval
authorURL: https://desandoval.net
---

Two projects that have been months (even years) in the making have made their way out into the world. SvelteKit is now in public beta and slotted components are now available in Svelte!

## What's up with SvelteKit?
[SvelteKit](https://kit.svelte.dev/) - Svelte's versatile framework for building SSR, serverless applications, or SPAs - is now officially in public beta. Expect bugs! Lots more detail in the [latest blog post](https://svelte.dev/blog/sveltekit-beta). Want to know when 1.0 is close? Check out the milestone on [github](https://github.com/sveltejs/kit/milestone/2).

Want to learn more about how to get started, what's different compared to Sapper, new features and migration paths? Check out this week's [episode of Svelte Radio](https://www.svelteradio.com/episodes/svelte-kit-public-beta) for a deep dive with Antony, Kev and Swyx.

## New in Svelte & Language Tools
- Slotted components, including `<svelte:fragment slot="...">` lets component consumers target specific slots with rich content (**Svelte 3.35.0, Language Tools [104.5.0](https://github.com/sveltejs/language-tools/releases/tag/extensions-104.5.0)**, check out the [docs](https://svelte.dev/docs#svelte_fragment) and the [tutorial](https://svelte.dev/tutorial/svelte-fragment))
- Linked editing now works for HTML in Svelte files (**Language Tools, [104.6.0](https://github.com/sveltejs/language-tools/releases/tag/extensions-104.6.0)**)
- Type definitions `svelte.d.ts` are now resolved in order, allowing library authors to ship type definitions with their svelte components (**Language Tools, [104.7.0](https://github.com/sveltejs/language-tools/releases/tag/extensions-104.7.0)**)
- [vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte) is available for general use of Svelte in Vite. `npm init @vitejs/app` includes Svelte options using this plugin.

---

## Community Showcase

**Apps & Sites**

- [Nagato](https://nagato.app/) is a task management tool that connects popular time tracking and to-do tools all in one place.
- [type-kana](https://type-kana.cass.moe/setup) is a quiz app to help you learn ひらがな (hiragana) and カタカナ (katakana), the Japanese syllabaries.
- [Pittsburgh Steps](https://pittsburgh-steps.samlearner.com/) is an interactive map of the more than 800 sets of public outdoor stairways in Pittsburgh, PA.
- [Music Mode Wheels](https://tobx.github.io/music-mode-wheels/) is a website that displays music modes as interactive wheels.
- [Critical Notes](https://www.critical-notes.com/) helps game masters and players keep track of their roleplaying games campaigns and adventures.
- [Svelte Game of Life](https://github.com/alanrsoares/svelte-game-of-life) is an educational implementation of Conway's Game of Life in TypeScript + Svelte
- [foxql](https://github.com/foxql) is a peer to peer full text search engine that runs on your browser.


**Demos, Libraries, Tools & Components**

- [svelte-nodegui](https://github.com/nodegui/svelte-nodegui) is a way to build performant, native and cross-platform desktop applications with Node.js and Svelte
- [Svelte Story Format](https://www.npmjs.com/package/@storybook/addon-svelte-csf) allows you to write your "stories" in Storybook using the Svelte syntax. More info in the [Storybook blog](https://storybook.js.org/blog/storybook-for-svelte/)
- [SelectMadu](https://github.com/pavish/select-madu) is a replacement for the select menu, with support for searching, multiple selections, async data loading and more.
- [Svelte Checklist](https://www.npmjs.com/package/svelte-checklist) is a customizable CheckList built with Svelte.
- [Suspense for Svelte](https://www.npmjs.com/package/@jamcart/suspense) is a Svelte component that implements the core idea of React's `<Suspense>`.
- [MiniRx](https://spierala.github.io/mini-rx-store/) is a RxJS Redux Store that works with Svelte and TypeScript
- [svelte-formly](https://github.com/arabdevelop/svelte-formly) generates dynamic forms for Svelte and Sapper
- [7ty](https://www.npmjs.com/package/@jamcart/7ty) is a static site generator that uses Svelte, supports partial hydration of components, and uses file based routing resembling Sapper and 11ty.

**Want to contribute your own component?** Submit a [Component](https://sveltesociety.dev/components) to the Svelte Society site by making [a PR to this file](https://github.com/svelte-society/sveltesociety.dev/blob/master/src/pages/components/components.json).


**Starters**

- [sveltekit-electron](https://github.com/FractalHQ/sveltekit-electron) is a starter kit for Electron using SvelteKit
- [sveltekit-tailwindcss-external-api](https://github.com/acidlake/sveltekit-tailwindcss-external-api) is everything you need to build a Svelte project with TailwindCSS and an external API, powered by create-svelte.
- [Sapper Netlify](https://www.npmjs.com/package/sapper-netlify) is a Sapper project that can run on a Netlify function.


**Looking for a particular starter?** Check out [svelte-adders](https://github.com/svelte-add/svelte-adders) and a number of other integration examples at [sveltejs/integrations](https://github.com/sveltejs/integrations)

**Learning Resources**
- [How to Build a Website with Svelte and SvelteKit](https://prismic.io/blog/svelte-sveltekit-tutorial) is a step-by-step tutorial walking through the new SvelteKit setup.
- [A Svelte store for prefers-reduced-motion](https://geoffrich.net/posts/svelte-prefers-reduced-motion-store/) demonstrates how to make a custom Svelte store whose value will indicate whether the user has requested reduced motion and improve accessibility.
- [TypeScript support in Svelte](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/Svelte_TypeScript) is an MDN guide to using TypeScript in Svelte.
- [How to merge cells with svelte-window](https://gradientdescent.de/merging-cells/) is a walkthrough of svelte-window, a port of the popular react-window tool for merging table cells. For more on this migration, see [from react-window 1:1 to svelte-window](https://gradientdescent.de/porting-react-window/).
- [Easy-to-Embed Svelte Components](https://codeandlife.com/2021/03/06/easy-to-embed-svelte-components/) explains how to use Rollup and a script tag to embed Svelte components anywhere.
- [Convert Svelte project from Rollup to Snowpack](https://www.youtube.com/watch?v=-sHcqj4YLeQ) walks through a common migration pattern on video.
- [How to internationalize routing in Svelte & Sapper](https://www.leaf.cloud/blog/how-to-internationalize-routing-in-svelte-sapper?utm_medium=story&utm_source=reddit.com&utm_campaign=awareness&utm_content=sapper_routing) explains how leaf.cloud translated their site to Dutch.
- [Svelte Store: Reactive context using Svelte Store](https://www.youtube.com/watch?v=-rTnWlbdjoY) is a video answer to the question, "How do we make [a] context value reactive?"
- [Creating Social Sharing Images with Cloudinary and Svelte](https://www.youtube.com/watch?v=-Si5o-R7KHY) is a video from Cloudinary that demonstrates how to dynamically develop Open Graph images and Twitter Cards for a JAMstack website.


## See you next month!

Got something to add? Join us on [Svelte Society](https://sveltesociety.dev/), [Reddit](https://www.reddit.com/r/sveltejs/) and [Discord](https://discord.com/invite/yy75DKs)!
