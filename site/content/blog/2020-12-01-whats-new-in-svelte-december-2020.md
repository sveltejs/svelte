---
title: What's new in Svelte: December 2020
description: TBD
author: Daniel Sandoval
authorURL: https://desandoval.net
---

It's the last "What's new in Svelte" of the year... To round out the season, this month's coverage includes _things_!

## New features & impactful bug fixes

1. Transitions within `{:else}` block should now complete successfully (**3.29.5**, [Example](https://svelte.dev/repl/49cef205e5da459594ef2eafcbd41593?version=3.29.5))
2. Svelte now includes an export map, which explicitly states which files can be imported from its npm package (**3.29.5** with some fixes in **3.29.6** and **3.29.7**)

## What's going on in Sapper?
Lots of new typecript definitions to make editing Sapper apps even easier! Dynamic imports also should now work in `client.js` files. (Unreleased)

## What's the deal with SvelteKit?
We're glad you asked! If you didn't catch Rich's blog post from early last month, [you can find it here](https://svelte.dev/blog/whats-the-deal-with-sveltekit)!

For all the features and bugfixes see the CHANGELOGs for [Svelte](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md) and [Sapper](https://github.com/sveltejs/sapper/blob/master/CHANGELOG.md).

---

## Community Showcase

**Apps & Sites**
- [narration.studio](https://narration.studio/) (Chrome Only) is an automatic in-browser audio recording & editing platform for voice over narration.
- [Vippet](https://vippet.netlify.app/) is a video recording and editing tool for the browser.
- [Pattern Monster](https://pattern.monster/) is a simple online pattern generator to create repeatable SVG patterns.
- [Plant-based diets](https://planetbaseddiets.panda.org/) is a website from the World Wildlife Foundation (WWF) built with Svelte.
- [sentence-length](https://sentence-length.netlify.app/) is a learning and analysis tool to show how some authors play with different lengths, while others stick with one.
- [svelte-presenter](https://github.com/stephane-vanraes/svelte-presenter) lets you quickly make good looking presentations using Svelte and mdsvex.

**Demos**
- [u/loopcake got SSR working in Java Spring Boot](https://www.reddit.com/r/sveltejs/comments/jkh5up/svelte_ssr_but_its_java_spring_boot_and_its_native/) for all the Java shops out there looking to render Svelte server-side.
- [svelte-liquid-swipe](https://github.com/tncrazvan/svelte-liquid-swipe) shows off a fancy interaction pattern using svg paths.
- [Crossfade Link Animation](https://svelte.dev/repl/7f68e148caf04b2787bb6f296208f870?version=3.29.7) demonstrates how to animate between navigation links using a crossfade (made by Blu, from the Discord community)
- [Clip-Path Transitions](https://svelte.dev/repl/b5ad281ae8024b629b545c70c9e8764d?version=3.29.7) showcases how to use clip paths and custom transitions to create magical in-and-out transitions (made by Faber, from the Discord community)

**Learning Resources**
- [lihautan](https://www.youtube.com/channel/UCbmC3HP3FaAFdcZkui8YoMQ/featured) has been making easy-to-follow videos to share his in-depth knowledge of Svelte.
- [Lessons From Building a Static Site Generator](https://nicholasreese.com/lessons-from-building-a-static-site-generator/) shares the backstory and thinking behind Elder.js - and the design decision made along the way.
- [Svelte Tutorial and Projects Course ](https://www.udemy.com/course/svelte-tutorial-and-projects-course/) is a udemy course by John Smilga where students learn Svelte.js by building interesting projects.
- [Building Pastebin on IPFS - with FastAPI, Svelte, and IPFS](https://amalshaji.wtf/building-pastebin-on-ipfs-with-fastapi-svelte-and-ipfs) explains how to make a distributed pastebin-like application.


**Components, Libraries & Tools**
- [svelte-crossword](https://russellgoldenberg.github.io/svelte-crossword/) is a customizable crossword puzzle component for Svelte.
- [svelte-cloudinary](https://github.com/cupcakearmy/svelte-cloudinary) makes it easy to integrate Cloudinary with Svelte (including Typescript and SSR support)
- [Svelte Nova](https://extensions.panic.com/extensions/sb.lao/sb.lao.svelte-nova/) extends the new Nova editor to support Svelte
- [saos](https://github.com/shiryel/saos) is a small svelte component to animate your elements on scroll.
- [Svelte-nStore](https://github.com/lacikawiz/svelte-nStore) is a general purpose store replacement that fulfills the Svelte store contract and adds getter and calculation features.
- [svelte-slimscroll](https://github.com/MelihAltintas/svelte-slimscroll) is a Svelte Action that transforms any div into a scrollable area with a nice scrollbar.
- [svelte-typewriter](https://github.com/henriquehbr/svelte-typewriter) is a simple and reusable typewriter effect for your Svelte applications
- [svelte-store-router](https://github.com/zyxd/svelte-store-router) is a store-based router for Svelte that suggests that routing is just another global state and History API changes are just an optional side-effects of this state.
- [Routify](https://routify.dev/blog/routify-2-released) just released the V2 of its Svelte router.
- [svelte-error-boundary](https://www.npmjs.com/package/@crownframework/svelte-error-boundary) provides a simple error boundary component for Svelte that can be can be used with both DOM and SSR targets.
- [svelte2dts](https://www.npmjs.com/package/svelte2dts) generates d.ts files from svelte files, creating truly sharable and well typed components!

## See you next month!

Got an idea for something to add to the Showcase? Want to get involved more with Svelte? We're always looking for maintainers, contributors and fanatics... Check out the [Svelte Society](https://sveltesociety.dev/), [Reddit](https://www.reddit.com/r/sveltejs/) and [Discord](https://discord.com/invite/yy75DKs) to get involved!

That's all for the year, folks! See you in January 😎