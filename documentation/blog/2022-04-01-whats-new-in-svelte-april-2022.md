---
title: "What's new in Svelte: April 2022"
description: 'Goodbye fallthrough routes, hello param validators!'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

This month, we felt a shift in the way SvelteKit handles page properties. The last holdout of the use-cases that required fallthrough routes, validating parameter properties, has been replaced by a more specific solution.

More on that, and what else is new in Svelte, as we dive in...

## What's new in SvelteKit

- Param matchers allow you to check if a url parameter matches before rendering a page - replacing the need for fallthrough routes for this purpose ([Docs](https://kit.svelte.dev/docs/routing#advanced-routing-matching), [#4334](https://github.com/sveltejs/kit/pull/4334))
- Explicit redirects can now be handled directly from endpoints ([#4260](https://github.com/sveltejs/kit/pull/4260))
- `svelte-kit sync` ([#4182](https://github.com/sveltejs/kit/pull/4182)), TypeScript 4.6 ([#4190](https://github.com/sveltejs/kit/pull/4190)) and Vite 2.9 were released - adding non-blocking dependency optimization and experimental CSS source maps in dev mode as well as a number of bug fixes contributed by the SvelteKit team ([#4468](https://github.com/sveltejs/kit/pull/4468))

**New Config Options**

- `outDir` fixes path issues in monorepos and other situations where the desired output directory is outside the project directory ([Docs](https://kit.svelte.dev/docs/configuration#outdir), [#4176](https://github.com/sveltejs/kit/pull/4176))
- `endpointExtensions` prevents files other than .js and .ts files from being treated as endpoints, unless you specify endpointExtensions ([Docs](https://kit.svelte.dev/docs/configuration#endpointextensions), [#4197](https://github.com/sveltejs/kit/pull/4197))
- `prerender.default` lets you prerender every page without having to write `export const prerender = true` in every page file ([Docs](https://kit.svelte.dev/docs/configuration#prerender), [#4192](https://github.com/sveltejs/kit/pull/4192))

**Breaking Changes**

- Fallthrough routes have been removed. For migration tips, check out the PR ([#4330](https://github.com/sveltejs/kit/pull/4330))
- `tabindex="-1"` is only added to `<body>` during navigation ([#4140](https://github.com/sveltejs/kit/pull/4140) and [#4184](https://github.com/sveltejs/kit/pull/4184))
- Adapters are now required to supply a `getClientAddress` function ([#4289](https://github.com/sveltejs/kit/pull/4289))
- `InputProps` and `OutputProps` can now be typed separately in generated `Load` ([#4305](https://github.com/sveltejs/kit/pull/4305))
- The `\$` character is no longer allowed in dynamic parameters ([#4334](https://github.com/sveltejs/kit/pull/4334))
- `svelte-kit package` has been marked as experimental so changes to it after Kit 1.0 will not be considered breaking ([#4164](https://github.com/sveltejs/kit/pull/4164))

## New across the Svelte ecosystem

- Svelte: Lots of new types for TypeScript and Svelte plugin users - including `style:` directives and Svelte Actions (**3.46.4** and **3.46.5**)
- Language Tools: Svelte project files are now importable/findable through references without having them imported in a TS file ([105.13.0](https://github.com/sveltejs/language-tools/releases/tag/extensions-105.13.0))
- Language Tools: Region folding is now supported in html with `<!--#region-->`/`<!--#endregion-->` ([105.13.0](https://github.com/sveltejs/language-tools/releases/tag/extensions-105.13.0))

---

## Community Showcase

**Apps & Sites built with Svelte**

- [Launcher](https://launcher.team/) is an open-source app launcher powered by SvelteKit, Prisma, and Tailwind
- [Paaster](https://paaster.io/) is a secure by default end to end encrypted pastebin built with Svelte, Vite, TypeScript, Python, Starlette, rclone & Docker.
- [Simple AF Video Converter](https://github.com/berlyozzy/Simple-AF-Video-Converter) is an Electron wrapper around ffmpeg.wasm to make converting videos between formats easier
- [Streamchaser](https://github.com/streamchaser/streamchaser) seeks to simplify movie, series and documentary search through a centralized entertainment technology platform
- [Svelte Color Picker](https://github.com/V-Py/svelte-material-color-picker) is a simple color picker made with Svelte
- [ConcertMash](https://github.com/mcmxcdev/ConcertMash) is a small website that interacts with the Spotify API and generates new playlists based on the upcoming concerts you're attending
- [Modulus](https://modulus.vision/) is a Design+Code Think Tank conceived with the main mission to evolve design and technology
- [Multiply](https://www.multiply.us/) is an integrated PR and Social agency moving at the speed of culture
- [yia!](https://www.yia.co.nz/) is a Young Innovator Award competition in New Zealand
- [Write to Russia](https://www.writetorussia.org/index) is a community email writing platform to communicate with public `.ru` email addresses
- [Markdown Playground](https://github.com/Petros-K/markdown-playground) is an online playground dedicated for your markdown experiments.
- [RatherMisty](https://rathermisty.com/) is a no frills weather app with weather data from Open-Meteo
- [Minecraft Profile Pic (MCPFP)](https://github.com/MauritsWilke/mcpfp) is a site to generate Minecraft profile pictures with ease
- [WebGL Fluid Simulation](https://github.com/jpaquim/svelte-webgl-fluid-simulation) is a configurable fluid simulation built with Svelte and WebGL
- [This @NobelPeaceOslo exhibition](https://twitter.com/perbyhring/status/1504754949791621120) was built using printed graphics, projected motion graphics, particle animations and generative sound design

Itching to contribute to a modern SvelteKit website? [Help build the Svelte Society site](https://github.com/svelte-society/sveltesociety.dev/issues)!

**Learning Resources**

_To Attend_

- [Svelte Summit: Spring](https://www.sveltesummit.com/) will take place on April 30, 2022! Join us for the 5th virtual Svelte conference on [YouTube](https://www.sveltesummit.com/) and Discord 🍾

_To Read_

- [Svelte(Kit) TypeScript Showcase + general TypeScript tips](https://github.com/ivanhofer/sveltekit-typescript-showcase) by Hofer Ivan
- [Local constants in Svelte with the @const tag](https://geoffrich.net/posts/local-constants/) by Geoff Rich
- [Design Patterns for Building Reusable Svelte Components](https://render.com/blog/svelte-design-patterns) by Eric Liu
- [Svelte is better than React](https://labs.hamy.xyz/posts/svelte-is-better-than-react/) by Hamilton Greene
- [Making Visualizations Literally with Svelte and D3](https://www.connorrothschild.com/post/svelte-and-d3) by Connor Rothschild
- [Coordinating Multiple Elements with Svelte Deferred Transitions](https://imfeld.dev/writing/svelte_deferred_transitions) by Daniel Imfeld
- [Animate on scroll with Svelte Inview - Little Bits](https://dev.to/maciekgrzybek/animate-on-scroll-with-svelte-inview-266f) by Maciek Grzybek
- [Lazy-Loading Firebase with SvelteKit](https://www.captaincodeman.com/lazy-loading-firebase-with-sveltekit) and [HeadlessUI Components with Svelte](https://www.captaincodeman.com/headlessui-components-with-svelte) by Captain Codeman
- [SvelteKit Accessibility Testing: Automated CI A11y Tests](https://rodneylab.com/sveltekit-accessibility-testing/) by Rodney Lab
- [Getting Started with KitQL and GraphCMS](https://scottspence.com/posts/getting-started-with-kitql-and-graphcms) by Scott Spence
- [React ⇆ Svelte Cheatsheet](https://dev.to/joshnuss/react-to-svelte-cheatsheet-1a2a) lists the similarities and differences between the two libraries - by Joshua Nussbaum

_To Watch_

- [Svelte Extravaganza | Async](https://www.youtube.com/watch?v=mT4CLVHgtSg) by pngwn
- [6 Svelte Packages You Should Know](https://www.youtube.com/watch?v=y5SrUKcX_Co) and [Basic React To Svelte Conversion](https://www.youtube.com/watch?v=DiSuwLlhOxs) by LevelUpTuts
- [Page/Shadow Endpoint in SvelteKit](https://www.youtube.com/watch?v=j-9D5UDyVOM) by WebJeda
- [Custom Svelte Store: Higher Order Store](https://www.youtube.com/watch?v=p1aPfVyZ1IY) by lihautan
- [SvelteKit For Beginners (Playlist)](https://www.youtube.com/watch?v=bLBHecY4-ak&list=PLA9WiRZ-IS_zXZZyW4qfj0akvOAtk6MFS) by Joy of Code - follow along with the [blog guide](https://joyofcode.xyz/sveltekit-for-beginners)
- [Fullstack SvelteKit Auth 🔐 with Firebase & Magic Links! 🪄](https://www.youtube.com/watch?v=MAHE4iQgh5Q) by Johnny Magrippis
- [Firebase Authentication in SvelteKit! Full Stack App](https://www.youtube.com/watch?v=N6Y3hqhZvNI) by Ryan Boddy

**Libraries, Tools & Components**

- [SvelTable](https://sveltable.io/) is a feature rich, data table component built with Svelte
- [svelte-cyberComp](https://github.com/Cybersteam00/svelte-cyberComp) is a powerful, lightweight component library written in Svelte and TypeScript
- [Flowbite Svelte](https://github.com/shinokada/flowbite-svelte) is an unofficial Flowbite component library for Svelte
- [Svelte-Tide-Project](https://github.com/jbertovic/svelte-tide-project) is a starter template for Svelte frontend apps with Rust Tide backend server
- [Fetch Inject](https://github.com/vhscom/fetch-inject#sveltekit) implements a performance optimization technique for managing asynchronous JavaScript dependencies - now with Svelte support
- [svelte-utterances](https://github.com/shinokada/svelte-utterances) is a lightweight comments widget built on GitHub issues
- [Liquivelte](https://github.com/malipetek/liquivelte-vscode) allows you to create your Shopify theme with Svelte-like components
- [@storyblok/svelte](https://github.com/storyblok/storyblok-svelte) is the Svelte SDK you need to interact with Storyblok API and enable the Real-time Visual Editing Experience
- [@svelte-on-solana/wallet-adapter](https://github.com/svelte-on-solana/wallet-adapter) is a modular TypeScript wallet adapter and UI components for Solana/Anchor applications using SvelteJS as framework
- [svelte-lookat](https://www.npmjs.com/package/svelte-lookat) creates a div which makes all its children follow the mouse cursor or the user's face when using a mobile phone

Join us on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.com/invite/yy75DKs) to continue the conversation.

See y'all next month!
