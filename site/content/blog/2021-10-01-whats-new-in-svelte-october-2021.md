---
title: What's new in Svelte: October 2021
description: A whole year of "What's new in Svelte"
author: Daniel Sandoval
authorURL: https://desandoval.net
---

Hey y'all 👋 It's been 1 year since "What's new in Svelte" started being cross-posted to the Svelte blog. I wanted to take this moment at the top to thank all of you for reading and for all the contributors every month. From the maintainers to everyone who posts their work in the Discord and Reddit, it's amazing to witness all the effort that goes into making the Svelte community great.

Keep up the good work, everyone! Now, let's dive into this month's news...

## New around Svelte

- New additions to Svelte's export map now expose no-op versions of lifecycle functions for SSR (Svelte **3.43.0**)
- Custom components with a `src` attribute no longer break `svelte-native` builds (Svelte **3.42.4**)
- Svelte plugin users without [the TypeScript plugin](https://www.npmjs.com/package/typescript-svelte-plugin) enabled will now be prompted to enable it. It enhances TypeScript and JavaScript files with additional intellisense to interact with Svelte files. [Please leave feedback](https://github.com/sveltejs/language-tools/issues/580) if you are using it (Svelte extensions **105.4.0**)
- Event modifiers have been added to intellisense as autocomplete and hover info (Svelte extensions **105.4.0**)
- TypeScript users no longer have to strictly separate type imports and value imports when using Svelte version 3.39 or higher and `svelte-preprocess` version 4.9.5 or higher. This means you can now write `import { MyInterface, myValue } from './somewhere'` instead of `import type { MyInterface } from './somewhere'; import { myValue } from './somewhere'`. Huge thanks to community member [@SomaticIT](https://github.com/SomaticIT) who mainly implemented this!

For a full list of features and bug fixes, check out the [Svelte changelog](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md).

## SvelteKit Updates

Nearly 100 PRs committed again this past month, but there's still lots to do and Svelte maintainers are [looking for help getting SvelteKit to 1.0](https://github.com/sveltejs/kit/issues/2100). Antony said it well in a [recent comment](https://github.com/sveltejs/kit/issues/2100#issuecomment-895446285) on the issue: 

> If you think you are too n00b to contribute (you're not), then add tests, or write tests for the feature you want to add, before you add it! Start small, and learn the codebase that way.

If you'd like to help, please consider working on any of the [1.0 milestone issues labeled with "help wanted"](https://github.com/sveltejs/kit/issues?q=is%3Aopen+is%3Aissue+milestone%3A1.0+label%3A%22help+wanted%22).

Notable SvelteKit improvements this month include...

- Service workers are now allowed to access files using the `$lib` alias ([#2326](https://github.com/sveltejs/kit/pull/2326))
- Svelte libraries should now work out-of-the-box without any Vite configuration ([#2343](https://github.com/sveltejs/kit/pull/2343))
- Improvements to package exports field ([#2345](https://github.com/sveltejs/kit/pull/2345) and [#2327](https://github.com/sveltejs/kit/pull/2327))
- [breaking] The `prerender.pages` config option has been renamed to `prerender.entries` ([#2380](https://github.com/sveltejs/kit/pull/2380))
- A new generic argument has beend added to allow typing Body from hooks ([#2413](https://github.com/sveltejs/kit/pull/2413))
- The `svelte` field will be added to package.json when running the package command ([#2431](https://github.com/sveltejs/kit/pull/2431))
- [breaking] The `context` parameter of the load function was renamed to `stuff` ([#2439](https://github.com/sveltejs/kit/pull/2439))
- Added an `entryPoint` option for building a custom server with `adapter-node` ([#2414](https://github.com/sveltejs/kit/pull/2414))
- `vite-plugin-svelte` improved support for [useVitePreprocess](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#usevitepreprocess), which uses Vite to automatically preprocess TypeScript, PostCSS, Scss, etc in Svelte components ([#173](https://github.com/sveltejs/vite-plugin-svelte/pull/173))

To see all updates to SvelteKit, check out the [SvelteKit changelog](https://github.com/sveltejs/kit/blob/master/packages/kit/CHANGELOG.md).


---

## Community Showcase

**Apps & Sites**
- [radiofrance](https://www.radiofrance.fr/) just migrated their website to SvelteKit
- [FLAYKS](https://flayks.com/) is the portfolio site for Félix Péault made with SvelteKit, Sanity, and Anime.js
- [hirehive](https://www.hirehive.com/) is a candidate and job tracking site
- [Microsocial](https://microsocial.xyz/) is an experimental Peer-to-Peer Social Platform 
- [Dylan Ipsum](https://www.dylanlyrics.app/) is a random text generator to replace lorem ipsum with Bob Dylan lyrics
- [Chip8 Svelte](https://github.com/mikeyhogarth/chip8-svelte) is a CHIP-8 emulator frontend, built on top of CHIP8 Typescript

**Looking for a Svelte project to work on? Interested in helping make Svelte's presence on the web better?** Check out [the list of open issues](https://github.com/svelte-society/sveltesociety-2021/issues) if you'd like to contribute to the Svelte Society rewrite in SvelteKit.

**Podcasts Featuring Svelte**
- [Syntax Podast: From React to SvelteKit](https://podcasts.apple.com/us/podcast/from-react-to-sveltekit/id1253186678?i=1000536276106) Scott talks with Wes about moving Level Up Tutorials from React to SvelteKit — why he did it, how, benefits, things to watch out for, and more!
- [Web Rush Podcast: Svelte Tools and Svelte Society](https://www.webrush.io/episodes/episode-150-svelte-tools-and-svelte-society) Kevin Åberg Kultalahti talks about what Svelte Society is, what he's excited about with Svelte, how important documentation is to any product, and much _much_ more
- [Svelte: The Compiled Future of Front End](https://www.arahansen.com/the-compiled-future-of-front-end/) details the history of component-based frontends and how a compiler changes everything
- [Svelte Radio: Contributing to Svelte with Martin 'Grygrflzr' Krisnanto Putra](https://share.transistor.fm/s/10aa305c) Grygrflzr shares his journey to becoming a maintainer and his views on React, Vite and a host of other things
- [Svelte Radio: Routify 3 with Jake and Willow](https://share.transistor.fm/s/10aa305c) the Svelte Radio crew sits down with the maintainers of Routify and discusses the just-released Routify 3
- [JS Party: 1Password](https://twitter.com/geoffrich_/status/1441816829853253640?s=20) mentioned on the latest episode of The Changelog's JS Party that they use Svelte to power their in-page suggestions

**Educational Content**
- [How I built a blog with Svelte and SvelteKit](https://fantinel.dev/blog-development-sveltekit/) is an introduction to Svelte, SvelteKit and Progressive Enhancement with code examples
- [I built a decentralized chat dapp](https://www.youtube.com/watch?v=J5x3OMXjgMc) is a tutorial on how to use popular web3 technologies like GUN to build a decentralized web app (dapp)
- [Writing a Svelte Store with TypeScript](https://javascript.plainenglish.io/writing-a-svelte-store-with-typescript-22fa1c901a4) is a deep dive into writing Svelte stores with TypeScript
- [How Svelte scopes component styles](https://geoffrich.net/posts/svelte-scoped-styles/) explains scoping using classes and more complex CSS specifiers
- [SvelteKit Hooks](https://www.youtube.com/watch?v=RarufLoEL08) shows how to use hooks.js in Sveltekit.. When you're done, check out [Part 2](https://www.youtube.com/watch?v=RmIBG3G0-VY)
- [An early look at SvelteKit](https://www.infoworld.com/article/3630395/an-early-look-at-sveltekit.html) is a post from Infoworld walking through the features and onboarding of SvelteKit

**Libraries, Tools & Components**
- [sveltekit-netlify-cms](https://github.com/buhrmi/sveltekit-netlify-cms) is a SvelteKit skeleton app configured for use with Netlify CMS
- [SvelteFireTS](https://github.com/jacobbowdoin/sveltefirets) is a SvelteKit + Typescript + Firebase library inspired by Fireship.io 
- [stores-x](https://github.com/Anyass3/stores-x) lets you use Svelte stores just like vueX
- [sveltekit-snippets](https://github.com/stordahl/sveltekit-snippets) is a VSCode extension that provides snippets for common patterns in SvelteKit & Vanilla Svelte
- [svelte-xactor](https://github.com/wobsoriano/svelte-xactor) is a middleware that allows you to easily convert your xactor machines into a global store that implements the store contract
- [vite-plugin-pages-svelte](https://github.com/aldy505/vite-plugin-pages-svelte) is a vite plugin for automatic filesystem-based routing
- [sveltio](https://www.npmjs.com/package/sveltio) is a Svelte wrapper for valtio - a proxy-state library
- [svelte-transition-classes](https://github.com/rmarscher/svelte-transition-classes) is a custom Svelte transition for adding and swapping CSS classes
- [Svelte-Boring-Avatars](https://github.com/paolotiu/svelte-boring-avatars) is Svelte port of the popular [Boring Avatars](https://github.com/boringdesigners/boring-avatars) React project
- [Svelte DataTables](https://github.com/homescriptone/svelte-datatables) brings DataTable, a popular JavaScript library allowing you to easily display your data in a user-friendly table, into your Svelte project.
- [focus-svelte](https://github.com/chanced/focus-svelte) is a focus trap for Svelte with zero dependencies
- [filedrop-svelte](https://github.com/chanced/filedrop-svelte) is a file dropzone action & component for Svelte


Check out the community site [sveltesociety.dev](https://sveltesociety.dev/templates/) for more templates, adders and adapters from across the Svelte ecosystem.


## Before you go, answer the call for speakers!

Svelte Summit Fall 2021 (happening 20 November 2021) is looking for speakers. Submit your talk propsoal before 30 October... all are welcome to present and attend.

### More info on the [sessionize site](https://sessionize.com/svelte-summit-fall-2021/)

Can't wait for the summit? Join us on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.com/invite/yy75DKs)!
