---
title: "What's new in Svelte: September 2022"
description: "Migrating to SvelteKit's new filesystem-based router"
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Still looking for something to do this month? It's your last chance to get tickets to Svelte Summit, Stockholm! [Join us on Sept 8-9th](https://www.sveltesummit.com/) 🎉

With the redesign of SvelteKit's filesystem-based router merging early last month, there's lots to cover this month - from the [migration script](https://github.com/sveltejs/kit/discussions/5774) to a number of new blog posts, videos and tutorials.

But the new routing isn't the only new feature in SvelteKit...

## What's new in SvelteKit

- `Link` is now supported as an HTTP header and works out of the box with Cloudflare's [Automatic Early Hints](https://github.com/sveltejs/kit/issues/5455) (**1.0.0-next.405**, [PR](https://github.com/sveltejs/kit/pull/5735))
- `$env/static/*` are now virtual to prevent writing sensitive values to disk (**1.0.0-next.413**, [PR](https://github.com/sveltejs/kit/pull/5825))
- `$app/stores` can now be used from anywhere on the browser (**1.0.0-next.428**, [PR](https://github.com/sveltejs/kit/pull/6100))
- `config.kit.env.dir` is a new config that sets the directory to search for `.env` files (**1.0.0-next.430**, [PR](https://github.com/sveltejs/kit/pull/6175))

**Breaking changes:**

- The filesystem-based router and `load` API improves the way routes are managed. **Before installing version `@sveltejs/kit@1.0.0-next.406` or later, [follow this migration guide](https://github.com/sveltejs/kit/discussions/5774)** ([PR](https://github.com/sveltejs/kit/pull/5778), [Issue](https://github.com/sveltejs/kit/discussions/5748))
- `event.session` has been removed from `load` along with the `session` store and `getSession`. Use `event.locals` instead (**1.0.0-next.415**, [PR](https://github.com/sveltejs/kit/pull/5946))
- Named layouts have been removed in favor of `(groups)` (**1.0.0-next.432**, [Docs](https://kit.svelte.dev/docs/advanced-routing#advanced-layouts), [PR & Migration Instructions](https://github.com/sveltejs/kit/pull/6174))
- `event.clientAddress` is now `event.getClientAddress()` (**1.0.0-next.438**, [PR](https://github.com/sveltejs/kit/pull/6237))
- `$app/env` has been renamed to `$app/environment`, to disambiguate with `$env/...` (**1.0.0-next.445**, [PR](https://github.com/sveltejs/kit/pull/6334))

For a full list of changes, check out kit's [CHANGELOG](https://github.com/sveltejs/kit/blob/master/packages/kit/CHANGELOG.md).

**Updates to language tools**

- TypeScript doesn't resolve imports to SvelteKit's $types very well, the latest version of Svelte's language tools makes it better (**105.21.0**, [#1592](https://github.com/sveltejs/language-tools/pull/1592))

---

## Community Showcase

**Apps & Sites built with Svelte**

- [canno](https://twitter.com/a_warnes/status/1556724034959818754?s=20&t=RyKWALPByqMT5A_PkLtUew) is a simple interactive 3d physics game with adjustable gravity, cannon power, and debug visualizer - made with threlte
- [straw.page](https://straw.page/) is an extremely simple website builder that lets you create unique websites straight from your phone
- [Patra](https://patra.webjeda.com/) lets you share short notes just with a link. No database. No storage
- [promptoMANIA](https://promptomania.com/) is an AI art community with an online prompt builder
- [Album by Mood](https://www.albumbymood.com/) lets you listen to music based on your mood
- [Daily Sumeiro](https://digivaux.com/sumeiro/daily/) is a daily game to test your math and logic skills
- [Lofi and Games](https://www.lofiandgames.com/) - play relaxing, casual games right from your browser
- [Pitch Pipe](https://github.com/joelgibson/pitch-pipe) is a digital pitch pipe with a frequency analyser and just-intonation intervals
- [classes.wtf](https://github.com/ekzhang/classes.wtf) is a custom, distributed search engine written in Go and Svelte to make searching for Harvard courses much quicker than the standard course catalog
- [Scrumpack](https://scrumpack.io/) is a set of tools to help agile/scrum teams with their ceremonies like Planning Poker and Retrospectives

**Learning Resources**

_Starring the Svelte team_

- [Supper Club × Rich Harris, Author of Svelte — Syntax Podcast 499](https://syntax.fm/show/499/supper-club-rich-harris-author-of-svelte)
- [Let's talk routing with Rich Harris on Svelte Radio](https://www.svelteradio.com/episodes/lets-talk-routing-with-rich-harris)
- [2.17 - Building the Future of Svelte at Vercel with Rich Harris](https://www.youtube.com/watch?v=F1sSUDVoij4)
- [1.15 - What's Up With SvelteKit with Shawn Wang (swyx)](https://www.youtube.com/watch?v=xLhuUShkYkM)
- [Adding Notion Tailwindcss and DaisyUI to Svelte App](https://www.youtube.com/watch?v=l4sbqrY0XGk)
- [Svelte 101 Session](https://www.youtube.com/watch?v=IIeBERpyxx4)
- [Astro and Svelte](https://www.youtube.com/watch?v=iYKKg-50Gm4)
- [Storyblok in Svelte](https://www.youtube.com/watch?v=xXHFRzqUxoE)
- [Svelte London August Recording](https://www.youtube.com/watch?v=ua6gE2zPulw)

_Learning the new SvelteKit routing_

- [Migrating Breaking Changes in SvelteKit](https://www.netlify.com/blog/migrating-breaking-changes-in-sveltekit/) by Brittney Postma (Netlify)
- [Major Svelte Kit API Change - Fixing `load`, and tightening up SvelteKit's design before 1.0](https://www.youtube.com/watch?v=OUGn7VifUCg) - Video by LevelUpTuts
- [SvelteKit Is Never Going To Be The Same](https://www.youtube.com/watch?v=eVFcGA-15LA) - Video by Joy of Code
- [Let's learn SvelteKit by building a static Markdown blog from scratch](https://joshcollinsworth.com/blog/build-static-sveltekit-markdown-blog) by Josh Collinsworth (updated Aug 26th to keep up with the new changes)

_To Watch_

- [Svelte Guide For React Developers](https://www.youtube.com/watch?v=uWDBEUkTRGk) and [Svelte State Management Guide](https://www.youtube.com/watch?v=4dDjQiOVrOo) by Joy of Code
- [What Is Bookit? The Svelte Kit Storybook Killer](https://www.youtube.com/watch?v=aOBGhvggsq0) and [What Is @type{import In Svelte Kit - JSDoc Syntax](https://www.youtube.com/watch?v=y0DvJTVO65M) by LevelUpTuts
- [TWF Yet another JS Framework... or not? Svelte!](https://www.youtube.com/watch?app=desktop&v=nT8QtDBIKZA) by TWF meetup

_To Read_

- [Creating a Figma Plugin with Svelte](https://www.lekoarts.de/javascript/creating-a-figma-plugin-with-svelte) by Lennart
- [Svelte Video Blog: Vlog with Mux from your own SvelteKit Site](https://plus.rodneylab.com/tutorials/svelte-video-blog) and [Svelte Shy Header: Peekaboo Sticky Header with CSS](https://rodneylab.com/svelte-shy-header/) by Rodney Lab

**Libraries, Tools & Components**

- [@svelte-plugins/tooltips](https://github.com/svelte-plugins/tooltips) is a simple tooltip action and component designed for Svelte
- [Lucia](https://github.com/pilcrowOnPaper/lucia-sveltekit) is a simple authentication library for SvelteKit that connects your SvelteKit app to your database
- [remix-router-svelte](https://github.com/brophdawg11/remix-routers/tree/main/packages/svelte) is a Svelte implementation of the `react-router-dom` API (driven by `@remix-run/router`)
- [MKRT](https://github.com/j4w8n/mkrt) is a CLI to help you create SvelteKit routes, fast
- [Histoire](https://histoire.dev/guide/) is a tool to generate stories applications - scenarios where you showcase components for specific use cases
- [sveltekit-flash-message](https://www.npmjs.com/package/sveltekit-flash-message) is a Sveltekit library that passes temporary data to the next request, usually from endpoints
- [svelte-particles](https://github.com/matteobruni/tsparticles#svelte) is a lightweight TypeScript library for creating particles
- [svelte-claps](https://github.com/bufgix/svelte-claps) adds clap button (like Medium) to any page for your SvelteKit apps
- [Neon Flicker](https://svelte.dev/repl/fd5e3b2be7da42fe8afddf89661af7d7?version=3.49.0) is a Svelte component to make your text flicker in a cyberpunk style
- [ComboBox](https://svelte.dev/repl/144f22d18c6943abb1fdd00f13e23fde?version=3.49.0) is a search input to help users select from a large list of items
- [@svelte-put](https://github.com/vnphanquang/svelte-put) is useful svelte stuff to put in your projects
- [vite-plugin-svelte-bridge](https://github.com/joshnuss/vite-plugin-svelte-bridge) lets you write Svelte components and use them from React & Vue

_UI Kits and Starters_

- [Svelte-spectre](https://github.com/basf/svelte-spectre) is a UI-kit based on spectre.css and powered by Svelte
- [Skeleton](https://skeleton.brainandbonesllc.com/) allows you to build fast and reactive web UI using the power of Svelte + Tailwind
- [iconsax-svelte](https://www.npmjs.com/package/iconsax-svelte) brings the popular icon kit to Svelte
- [laravel-vite-svelte-spa-template](https://github.com/NukeJS/laravel-vite-svelte-spa-template) is a Laravel 9, Vite, Svelte SPA, Tailwind CSS (w/ Forms Plugin & Aspect Ratio Plugin), Axios, & TypeScript starter template
- [neutralino-svelte-boilerplate-js](https://github.com/Raffaele/neutralino-svelte-boilerplate-js) is a cross platform desktop template for Neutralino and Svelte
- [figma-plugin-svelte-vite](https://github.com/candidosales/figma-plugin-svelte-vite) is a boilerplate for creating Figma plugins using Svelte, Vite and Typescript
- [Urara](https://github.com/importantimport/urara) is a sweet & powerful SvelteKit blog starter
- [SvelteKit Commerce](https://vercel.com/templates/svelte/sveltekit-commerce) is an all-in-one starter kit for high-performance e-commerce sites built with SvelteKit by Vercel

Did we miss anything? Let us know on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.com/invite/yy75DKs)!

See ya next month!
