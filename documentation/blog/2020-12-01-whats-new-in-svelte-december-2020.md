---
title: "What's new in Svelte: December 2020"
description: Better tooling, export maps and improvements to slots and context
author: Dani Sandoval
authorURL: https://dreamindani.com
---

It's the last "What's new in Svelte" of the year and there's lots to celebrate! This month's coverage includes updates from `rollup-plugin-svelte`, `Sapper` and `SvelteKit` and a bunch of showcases from the Svelte community!

## New features & impactful bug fixes

1. `$$props`, `$$restProps`, and `$$slots` are all now supported in custom web components (**3.29.5**, [Example](https://svelte.dev/repl/ad8e6f39cd20403dacd1be84d71e498d?version=3.29.5)) and `slot` components now support spread props: `<slot {...foo} />` (**3.30.0**)
2. A new `hasContext` lifecycle function makes it easy to check whether a `key` has been set in the context of a parent component (**3.30.0** & **3.30.1**, [Docs](https://svelte.dev/docs#run-time-svelte-hascontext))
3. There is now a new `SvelteComponentTyped` class which makes it easier to add strongly typed components that extend base Svelte components. Component library and framework authors rejoice! An example: `export class YourComponent extends SvelteComponentTyped<{aProp: boolean}, {click: MouseEvent}, {default: {aSlot: string}}> {}` (**3.31.0**, [RFC](https://github.com/sveltejs/rfcs/pull/37))
4. Transitions within `{:else}` blocks should now complete successfully (**3.29.5**, [Example](https://svelte.dev/repl/49cef205e5da459594ef2eafcbd41593?version=3.29.5))
5. Svelte now includes an export map, which explicitly states which files can be imported from its npm package (**3.29.5** with some fixes in **3.29.6**, **3.29.7** and **3.30.0**)
6. `rollup-plugin-svelte` had a new [7.0.0 release](https://github.com/sveltejs/rollup-plugin-svelte/blob/master/CHANGELOG.md). The biggest change is that the `css` option was removed. Users who were using that option should add another plugin like `rollup-plugin-css-only` as demonstrated [in the template](https://github.com/sveltejs/template/blob/5b1135c286f7a649daa99825a077586655051649/rollup.config.js#L48)

## What's going on in Sapper?

Lots of new TypeScript definition improvements to make editing Sapper apps even easier! CSS for dynamic imports also should now work in `client.js` files. (Unreleased)

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
- [johnells.se](https://www.johnells.se/) is a Swedish fashion e-commerce site, built with [Crown](https://crownframework.com/) - a Svelte-powered framework.
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
- [svelte-cloudinary](https://github.com/cupcakearmy/svelte-cloudinary) makes it easy to integrate Cloudinary with Svelte (including TypeScript and SSR support)
- [Svelte Nova](https://extensions.panic.com/extensions/sb.lao/sb.lao.svelte-nova/) extends the new Nova editor to support Svelte
- [saos](https://github.com/shiryel/saos) is a small svelte component to animate your elements on scroll.
- [Svelte-nStore](https://github.com/lacikawiz/svelte-nStore) is a general purpose store replacement that fulfills the Svelte store contract and adds getter and calculation features.
- [svelte-slimscroll](https://github.com/MelihAltintas/svelte-slimscroll) is a Svelte Action that transforms any div into a scrollable area with a nice scrollbar.
- [svelte-typewriter](https://github.com/henriquehbr/svelte-typewriter) is a simple and reusable typewriter effect for your Svelte applications
- [svelte-store-router](https://github.com/zyxd/svelte-store-router) is a store-based router for Svelte that suggests that routing is just another global state and History API changes are just an optional side-effects of this state.
- [Routify](https://routify.dev/blog/routify-2-released) just released version 2 of its Svelte router.
- [svelte-error-boundary](https://www.npmjs.com/package/@crownframework/svelte-error-boundary) provides a simple error boundary component for Svelte that can be can be used with both DOM and SSR targets.
- [svelte2dts](https://www.npmjs.com/package/svelte2dts) generates d.ts files from svelte files, creating truly shareable and well typed components.

## See you next month!

Got an idea for something to add to the Showcase? Want to get involved more with Svelte? We're always looking for maintainers, contributors and fanatics... Check out the [Svelte Society](https://sveltesociety.dev/), [Reddit](https://www.reddit.com/r/sveltejs/) and [Discord](https://discord.com/invite/yy75DKs) to get involved!

That's all for the year, folks! See you in January 😎
