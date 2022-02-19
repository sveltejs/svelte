---
title: "What's new in Svelte: March 2022"
description: "Shadow endpoints and update detection come to SvelteKit"
author: Daniel Sandoval
authorURL: https://desandoval.net
---

Some long-requested features have been added to SvelteKit this month... including shadow endpoints! This change in how `load` functions makes it easier to fetch data required for basic pages, redirect from POST responses and handle 404s and other errors.

More on that and other new features and fixes below!

## New across Svelte and Language Tools
- Any highlights from the Svelte Changelog? Feels like it was mostly bugfixes
...
- svelte.dev is [now available in Russian](https://ru.svelte.dev/)! If you'd like to contribute to the community transaltions, check out [sveltejs-translations/content-server](https://github.com/sveltejs-translations/content-server)
- Accessing properties in markups has been improved in the Svelte language tools ([105.12.0](https://github.com/sveltejs/language-tools/releases/tag/extensions-105.12.0)) - working around some known issues with autocomplete ([#538](https://github.com/sveltejs/language-tools/issues/538), [#786](https://github.com/sveltejs/language-tools/issues/786) and [#1302](https://github.com/sveltejs/language-tools/issues/1302))

## What's new in SvelteKit
- Shadow endpoints significantly decrease the boilerplate needed when loading a page ([Issue](https://github.com/sveltejs/kit/issues/3532), [PR](https://github.com/sveltejs/kit/pull/3679), [Docs](https://kit.svelte.dev/docs/routing#endpoints))
- Application versioning and update detection support lets you determine what to do when a route fails to load after an app update ([Issue](https://github.com/sveltejs/kit/issues/87), [PR](https://github.com/sveltejs/kit/pull/3412), [Docs](https://kit.svelte.dev/docs/configuration#version))


**Breaking Changes**
- The `target` option is no longer available. Instead, the `init` script hydrates the its `parentNode` ([#3674](https://github.com/sveltejs/kit/pull/3674))
- App-level types now live in the `SvelteKit` namespace ([#3670](https://github.com/sveltejs/kit/pull/3670))
- `JSONString` is now `JSONValue` ([#3683](https://github.com/sveltejs/kit/pull/3683))
- `createIndexFiles` has been removed — it is now controlled by the `trailingSlash` option ([#3801](https://github.com/sveltejs/kit/pull/3801))
- SvelteKit will no longer exclude root-relative external links from prerendering, which will cause 404s if these URLs are intended to be served by a separate app. Use a custom [`prerender.onError`](https://kit.svelte.dev/docs/configuration#prerender) handler if you need to ignore them ([#3826](https://github.com/sveltejs/kit/pull/3826))


---

## Community Showcase

**Apps & Sites**
- [Supachat](https://github.com/Lleweraf/supachat) is a real-time chat app using Svelte and Supabase
- [Radicle](https://radicle.xyz/) is a peer-to-peer stack for building software together
- [The Making Known](https://the-making-known.com/) is a narrated encounter with posters designed by the Nazi German government to communicate with the occupied nations of Belgium, France, and Luxembourg during the Second World War
- [Svelte Kanban](https://github.com/V-Py/svelte-kanban) is a simple Svelte Kanban made in pure CSS
- [fngrng](https://github.com/nvlgzr/fngrng) is a typing trainer focussed on accuracy over speed
- [Generative grids](https://svelte.dev/repl/873988ce33db43f097c0ca69df57b3ac?version=3.46.4) is a neat little generative SVG grid in a Svelte REPL, with randomly generated color palettes and shapes
- [LifeHash](https://github.com/BlockchainCommons/lifehash.info) is a method of hash visualization that creates beautiful, deterministic icons
- [Speedskating](https://github.com/spiegelgraphics/speedskating) is an animation widget to show olympic speedskating runs. Built with Svelte, D3 and regl.
- [Web tail](https://github.com/mishankov/web-tail) is a web application to view lines from file on local system or on remote server

Want to work on a SvelteKit site with others? [Contribute to the Svelte Society site](https://github.com/svelte-society/sveltesociety.dev/issues)!


**Learning and Listening**

_To Read_
- [Svelte Components as Web Components](https://medium.com/@yesmeno/svelte-components-as-web-components-b400d1253504) by Matias Meno
- [Simple Svelte Routing with Reactive URLs](https://bjornlu.com/blog/simple-svelte-routing-with-reactive-urls) by Bjorn Lu
- [Leveling Up my Sveltekit / Sanity.io Blog Content with Featured Videos and Syntax Highlighting](https://ryanboddy.net/level-up-blog) by Ryan Boddy
- [How This Blog Makes the Most of GitHub](https://paullj.github.io/posts/how-this-blog-makes-the-most-of-github/) by paullj
- [FullStack JWT Auth: Introducing SvelteKit](https://dev.to/sirneij/fullstack-jwt-introducing-sveltekit-3jcn) by John Idogun
- [Svelte-Cubed: Adding Motion to 3D Scenes](https://dev.to/alexwarnes/svelte-cubed-adding-motion-to-3d-scenes-51lo) by Alex Warnes
- [Creating a RSS feed with Sanity and Svelte Kit](https://ghostdev.xyz/posts/creating-a-rss-feed-with-sanity-and-svelte-kit) by GHOST
- [How to use Svelte's style directive](https://geoffrich.net/posts/style-directives/) by Geoff Rich

_To Watch_
- [Shadow Endpoints In Svelte Kit - Weekly Svelte](https://www.youtube.com/watch?v=PoYPZT7ruqI) by LevelUpTuts
- [Testing For Beginners (Playlist)](https://www.youtube.com/watch?v=y53wwdBr5AI&list=PLA9WiRZ-IS_z7KpqhPELfEMbhAGRwZrzn) by Joy of Code
- [KitQL - The native SvelteKit library for GraphQL](https://www.youtube.com/watch?v=6pH4fnFN70w) by Jean-Yves COUËT

_To Listen To_
- 

**Libraries, Tools & Components**
- [svelte-ethers-store](https://www.npmjs.com/package/svelte-ethers-store) uses the ethers.js library as a collection of readable Svelte stores for Svelte, Sapper or SvelteKit
- [Fluid Grid](https://fluid-grid.com/) is a CSS grid system for future web
- [stirstack](https://github.com/seeReadCode/stirstack) is an opinionated framework that combines Svelte.js, TailwindCSS, InertiaJS and Ruby on Rails
- [OATHqr](https://codeberg.org/vhs/oathqr) helps users create security credentials for use with 2FA/MFA and other OATH-enabled apps. Use it to generate scannable QR codes for one-time password authenticator apps such as Aegis or YubiKey
- [svelte-GridTiles](https://github.com/honeybeeSunshine/svelte-GridTiles) is a drag and drop resizable tiles library built on a responsive grid
- [walk-and-graph-svelte-components](https://github.com/j2l/walk-and-graph-svelte-components) is a CLI node script to walk svelte and js files, to draw a beautiful JPG of your dependencies aka "imports"
- [Felte](https://www.npmjs.com/package/felte) is a simple to use form library for Svelte


What'd we miss? Join us on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.com/invite/yy75DKs) to continue the conversation.

See y'all next month!
