---
title: "What's new in Svelte: July 2021"
description: Keeping cool with fixes, TypeScript tooling and tonnes of new features
author: Daniel Sandoval
authorURL: https://desandoval.net
---

As the northern hemisphere heats up, Svelte has stayed cool with lots of performance and bug fixes, better TypeScript support, and lots of new components & tools from around the ecosystem. Let's take a peek 👀

## New in SvelteKit
- `adapter-node` now precompresses assets using gzip & brotli ([#1693](https://github.com/sveltejs/kit/pull/1693))
- Support for TypeScript transpilation has been added to the `svelte-kit package` tooling ([#1633](https://github.com/sveltejs/kit/pull/1633))
- Improved caching defaults in `adapter-node` ([#1416](https://github.com/sveltejs/kit/pull/1416))
- Allow configuring Rollup output options ([#1572](https://github.com/sveltejs/kit/pull/1572))
- Fixed usage of SSL with HMR ([#1517](https://github.com/sveltejs/kit/pull/1517))



## Features & bug fixes from around svelte/*
- [Svelte 3.38.3](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md#3383) (released June 22) includes a bunch of performance and bug fixes - including hydration optimizations, `this` preservation in bubbled events, and more!
- The latest language tools releases added support for prop renaming from outside of a component, PostCSS syntax grammar, and a `.d.ts` output target in `svelte2tsx` which can be used to create type definitions from Svelte files.
- Also in language tools, some long-awaited experimental features for enhanced TypeScript support were added - including explicitly typing all possible component events or slots, and using generics. Have a look at [the RFC](https://github.com/sveltejs/rfcs/pull/38) for more details and leave feedback in [this issue](https://github.com/sveltejs/language-tools/issues/442) if you are using it.
- `svelte-scroller` got some quality-of-life fixes in 2.0.7 - fixing an initial width bug and updating its `index` more conservatively


## Coming soon to Svelte
- Constants in markup ([RFC](https://github.com/sveltejs/rfcs/blob/master/text/0000-markup-constants.md)): Adds a new `{@const ...}` tag that defines a local constant ([PR](https://github.com/sveltejs/svelte/pull/6413))

---

## Community Showcase

**Apps & Sites**
- [SvelteThemes](https://sveltethemes.dev/) is a curated list of Svelte themes and templates built using svelte, sveltekit, elderjs, routify etc.
- [Beatbump](https://github.com/snuffyDev/Beatbump) is an alternative frontend for YouTube Music created using Svelte/SvelteKit.
- [Sveltuir](https://github.com/webspaceadam/sveltuir) is an app help you memorize the guitar fretboard


**Educational Content**
- [Svelte Radio: A Jolly Good Svelte Summer](https://share.transistor.fm/s/60880542) is a conversation about what's new in Svelte and a celebration of Svelte Radio's 1-year anniversary
- [Class properties in Svelte](https://navillus.dev/blog/svelte-class-props) is a refresher on the power of `class` for developers switching over to Svelte from React
- [Sveltekit Tutorial for Beginners](https://www.youtube.com/playlist?list=PLm_Qt4aKpfKjf77S8UD79Ockhwp_699Ms) is a video playlist for learning SvelteKit by WebJeda
- [How To Cache Dynamic Pages On Demand With A Service Worker In SvelteKit](https://jochemvogel.medium.com/how-to-cache-dynamic-pages-on-demand-with-a-service-worker-in-sveltekit-4b4a7652583d) walks through the power of service workers when used within SvelteKit for on-demand caching
- [Vue vs Svelte: Comparing Framework Internals](https://www.vuemastery.com/blog/vue-vs-svelte-comparing-framework-internals/) dives deep into the differences between Vue and Svelte from the inside out
- [Setting up a development environment for SvelteKit with Docker and Docker Compose](https://jenyus.web.app/blog/2021-05-30-setting-up-a-development-environment-for-sveltekit-with-docker-and-compose) walks through how to use Docker to create reusable development environments, no matter what kind of device you run your code on
- Scalable Scripts released three videos this month documenting how to deploy dockerized Svelte Apps to [AWS](https://youtu.be/VOs2Od5jYOc), [Azure](https://youtu.be/gdg4ne_uDm8) and [Google Cloud](https://youtu.be/_-uBb61Tikw)
- [Render Katex with Svelte from zero to hero](https://www.youtube.com/watch?v=euowJs9CblA) demonstrates how to implement Katex in a Svelte project
- [Using Custom Elements in Svelte](https://css-tricks.com/using-custom-elements-in-svelte/) shows some of the quirks to look out for when using custom elements in a Svelte site


**Libraries, Tools & Components**
- [svelte-pipeline](https://github.com/novacbn/svelte-pipeline) provides custom Javascript contexts and the Svelte Compiler as Svelte Stores, for REPLs, Editors, etc.
- [Sveltotron](https://github.com/Salemmous/sveltotron) is an Electron-based app made to inspect your Svelte app
- [svelte-qr-reader-writer](https://github.com/pleasemarkdarkly/svelte-qr-reader-writer) is a Svelte component that helps read and write data from QR codes
- [svelte-stack-router](https://www.npmjs.com/package/svelte-stack-router) Aims to make Svelte apps feel more native by routing with Stacks
- [svelte-typed-context](https://www.npmjs.com/package/svelte-typed-context) provides an interface which, when provided to `getContext` or `setContext`, allows for stricter types
- [svelte-modals](https://svelte-modals.mattjennings.io/) is a simple, flexible, zero-dependency modal manager for Svelte


**Want to contribute a component? Interested in helping make Svelte's presence on the web better?** Submit a Component to the Svelte Society site by making [a PR to this file](https://github.com/svelte-society/sveltesociety-2021/blob/main/src/routes/components/components.json) or check out [the list of open issues](https://github.com/svelte-society/sveltesociety-2021/issues) if you'd like to contribute to the Svelte Society rewrite in SvelteKit.


## See you next month!

Want more updates? Join us on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.com/invite/yy75DKs)!
