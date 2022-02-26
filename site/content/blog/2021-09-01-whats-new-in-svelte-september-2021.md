---
title: "What's new in Svelte: September 2021"
description: StackOverflow's most loved web framework
author: Daniel Sandoval
authorURL: https://desandoval.net
---

This month, Svelte was [voted StackOverflow's most loved web framework](https://insights.stackoverflow.com/survey/2021#section-most-loved-dreaded-and-wanted-web-frameworks), Tan Li Hau [talked to Svelte Radio](https://share.transistor.fm/s/84c7521b) about his [Svelte-filled YouTube channel](https://www.youtube.com/channel/UCbmC3HP3FaAFdcZkui8YoMQ), and SvelteKit made even more progress towards its 1.0 release!

## New in Svelte

- `use:actions` can now be used on `<svelte:body>` (**3.42.0**)
- `HTMLElement`, `SVGElement` (**3.42.2**) and `BigInt` (**3.42.3**) are now known globals
- There is less code in Svelte's output thanks to the following improvements in **3.42.2**:
  - Whitespace is now collapsed in class and style attributes
  - Hydrated components have been updated to only rely upon helpers for creating the types of elements present in the component
- Scaling is now accounted for in `flip` animations (**3.42.2**)
- All `<option>`s in a `<select>` are now deselected when the bound value doesn't match any of them (**3.42.2**)

For a full list of features and bug fixes, check out the [Svelte changelog](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md).

## SvelteKit Updates

Svelte maintainers are [looking for help getting SvelteKit to 1.0](https://github.com/sveltejs/kit/issues/2100). We've knocked out over 100 issues that were on the 1.0 milestone. There's only a couple dozen left and we'd love a hand making that list a bit shorter!

If you'd like to help, please consider working on any of the [1.0 milestone issues](https://github.com/sveltejs/kit/issues?q=is%3Aopen+is%3Aissue+milestone%3A1.0).

The focus this past month was on continuing to iron out any kinks, with well over 100 PRs merged. A few new features went in as well...

- SvelteKit will now detect if a prerendered app is trying to access a query parameter and return an error instead of failing silently ([#2104](https://github.com/sveltejs/kit/pull/2104))
- `adapter-node` now lets you [add the Kit middleware to your own server](https://kit.svelte.dev/faq#integrations) for use with other middleware. You can also [add middleware in dev mode](https://kit.svelte.dev/faq#how-do-i-use-x-with-sveltekit-how-do-i-use-middleware) with more improvements to come in this area
- The new [`sequence` helper lets you chain together multiple `handle` calls](https://kit.svelte.dev/docs/modules#sveltejs-kit-hooks)
- A new [`handleError` hook](https://kit.svelte.dev/docs/hooks#handleerror) gives you the option to send data to an error tracking service, or to customise the formatting before printing the error to the console.
- `adapter-node` can now listen on socket path ([#2048](https://github.com/sveltejs/kit/pull/2048))

To see all updates to SvelteKit, check out the [SvelteKit changelog](https://github.com/sveltejs/kit/blob/master/packages/kit/CHANGELOG.md).


---

## Community Showcase

**Apps & Sites**
- [macos-web](https://github.com/PuruVJ/macos-web) by @puruvjdev has been rebuilt with Svelte from the ground up. Check out all the details in this [Twitter thread](https://twitter.com/puruvjdev/status/1426267327687847939)
- [Brave Search](https://search.brave.com/) is using Svelte
- [exatorrent](https://github.com/varbhat/exatorrent) is a self-hostable, easy-to-use, lightweight and feature-rich torrent client written in Go and Svelte
- [json2TsTypes](https://github.com/jatinhemnani01/json2TsTypes) is a simple tool which will convert your JSON to Typescript Types/Interfaces
- [Histogram.dev](https://histogram.dev/) generates histograms for each feature in a CSV
- [cybernetic.dev](https://cybernetic.dev/) is a collection of data-centric UI experiments made while learning Svelte
- [LunaNotes](https://chrome.google.com/webstore/detail/lunanotes-youtube-video-n/oehoffnnkgcdacmbkhmlbjedinpampak?hl=en) is a Chrome extension to help with taking YouTube video notes
- [theia.games](https://theia.games/#dev)'s built-in 3D environment editor lets you create a VR world with a menu built in Svelte
- [Ferrum](https://github.com/probablykasper/ferrum) is a music library and player available for Mac, Windows or Linux
- [Fluid Earth](https://github.com/byrd-polar/fluid-earth) is an interactive WebGL application for visualizing Earth's atmosphere and oceans

**Looking for a Svelte project to work on? Interested in helping make Svelte's presence on the web better?** Check out [the list of open issues](https://github.com/svelte-society/sveltesociety-2021/issues) if you'd like to contribute to the Svelte Society rewrite in SvelteKit.

**Educational Content**
- [Tauri with Standard Svelte or SvelteKit](https://medium.com/@cazanator/tauri-with-standard-svelte-or-sveltekit-ad7f103c37e7) walks through how to setup Svelte with Tauri, a new light-weight framework for developing cross-platform hybrid desktop applications
- [Svelte - Web App Development Reimagined [An Intro to Svelte]](https://www.youtube.com/watch?v=4CGzFwHoD0A&list=PLEx5khR4g7PKSASVAXXiAhkyx02_OeruP) is a great intro talk from the goto; conference
- [LevelUpTuts - Even More 5 Things I Like More In Svelte Than React](https://www.youtube.com/watch?v=ISmnG2sIOeM) highlights Svelte's approach to refs (don't need them), meta tags and more
- [State Management in Svelte Applications](https://auth0.com/blog/state-management-in-svelte-applications/) is a tutorial on how to use the Svelte state management store to manage state in Svelte applications
- [Migrating from Sapper to SvelteKit](https://shipbit.de/blog/migrating-from-sapper-to-svelte-kit/) is a review and retrospective of ShipBit's migration from Sapper

**Libraries, Tools & Components**
- [svelte-stripe-js](https://github.com/joshnuss/svelte-stripe-js) is everything you need to add Stripe to your Svelte project. 100% SvelteKit compatible
- [svelte-steps](https://github.com/shaozi/svelte-steps) is a customizable step component written in Svelte
- [simple-optics-module](https://gitlab.com/Samzelot/simple-optics-module) is an online open source optics tool for experimenting and teaching geometrical optics
- [inlang](https://github.com/samuelstroschein/inlang) is an internationalization (i18n) tool for SvelteKit apps
- [Sveno](https://github.com/pocinnovation/sveno) is a component transpiler that transforms React components to Svelte components
- [svelte-useactions](https://github.com/paolotiu/svelte-useactions) is a fully typed library for passing actions to components
- [Svelte-Element-Query](https://github.com/leveluptuts/Svelte-Element-Query) is a 322b library/action for element queries
- [svelte-meta-tags](https://github.com/oekazuma/svelte-meta-tags) is a plug-in that makes managing SEO easier in Svelte projects
- [svelte-domtree](https://github.com/alex-knyaz/svelte-domtree) lets you visualize the DOM - similar to DOM tree in Chrome DevTools
- [Diffx](https://github.com/jbjorge/diffx/tree/master/svelte), a cross-framework state management library, just added Svelte support
- [svelte-ionic-starter](https://github.com/Zettexe/svelte-ionic-starter) a project template for Svelte + Ionic + CapacitorJS apps with live reload and iOS/Android build targets
- [demo-sveltekit-sanity](https://github.com/stephane-vanraes/demo-sveltekit-sanity/) is a starter kit for SvelteKit and Sanity, an open source React CMS

Check out the community site [sveltesociety.dev](https://sveltesociety.dev/templates/) for more templates, adders and adapters from across the Svelte ecosystem.


## See you next month!

Want more updates? Join us on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.com/invite/yy75DKs)!
