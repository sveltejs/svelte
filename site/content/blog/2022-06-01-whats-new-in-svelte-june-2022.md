---
title: "What's new in Svelte: June 2022"
description: "Cancellable dispatched events, deeper {@const} declarations and more!"
author: Daniel Sandoval
authorURL: https://desandoval.net
---

With last month's [Svelte Summit](https://www.youtube.com/watch?v=qqj2cBockqE) behind us, we're ready to apply everything we learned in this new month of June! Also new this month are some quality-of-life changes to `createEventDispatcher`, `@const` declarations and tons of progress toward SvelteKit 1.0.

Let's dive in!

## What's new in Svelte
- Custom events can now be cancelled in the `createEventDispatcher` function (**3.48.0**, [Docs](https://svelte.dev/docs#run-time-svelte-createeventdispatcher), [PR](https://github.com/sveltejs/svelte/pull/7064))
- The `{@const}` tag can now be used in `{#if}` blocks to conditionally define variables (**3.48.0**, [Docs](https://svelte.dev/docs#template-syntax-const), [PR](https://github.com/sveltejs/svelte/pull/7451))
- Lots of bug fixes across `<svelte:element>`, animations and various DOM elements. Check out the [CHANGELOG](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md#3480) for a deeper dive!


## What's new in SvelteKit
- Vite 2.9.9 was released as one of the last Vite 2 releases. The Svelte team has been hard at work contributing to the the Vite 3 release to make the integration between SvelteKit and Vite smoother than ever ([Vite 3.0 Milestone](https://github.com/vitejs/vite/milestone/5))
- `config.kit.alias` lets you more easily declare a custom alias to replace values in `import` statements ([Docs](https://kit.svelte.dev/docs/configuration#alias), [PR](https://github.com/sveltejs/kit/pull/4964))
- Pages marked for prerendering will now fail during SSR at runtime ([PR](https://github.com/sveltejs/kit/pull/4812))

**Breaking Changes**
- Node 14 is no longer supported ([PR](https://github.com/sveltejs/kit/pull/4922))
- Requests to `/favicon.ico` will no longer be suppressed and will instead be handled as a valid route ([PR](https://github.com/sveltejs/kit/pull/5046))
- AMP support has been moved to a separate `@sveltejs/amp` package ([Docs](https://kit.svelte.dev/docs/seo#manual-setup-amp), [PR](https://github.com/sveltejs/kit/pull/4710))
- Generated types are now written to `_types` directories - update your imports accordingly ([PR](https://github.com/sveltejs/kit/pull/4705))
- `%svelte.head%` and `%svelte.body%` are now `%sveltekit.head%` and `%sveltekit.body%` in `app.html` ([Docs](https://kit.svelte.dev/docs/migrating#project-files-src-template-html), [PR](https://github.com/sveltejs/kit/pull/5016/))
- `LoadInput` is now `LoadEvent`
- Dropped support for Wrangler 1 in favor of Wrangler 2 ([PR](https://github.com/sveltejs/kit/pull/4887))

---

## Community Showcase

**Apps & Sites built with Svelte**
- [Plantarium](https://github.com/jim-fx/plantarium) is a tool for the procedural generation of 3D plants.
- [SPATULA](https://github.com/AlexWarnes/lamina-spatula) is a tool for building shading materials that are exportable as code material in any project that uses lamina and threejs
- [Waaard](https://waaard.com/) lets you create and send protected links with a variety of SSO providers
- [Magidoc](https://github.com/magidoc-org/magidoc) is a fast and highly customizable GraphQL documentation generator
- [myMarkmap](https://github.com/eyssette/myMarkmap) is a custom editor for Markmap, built with SvelteKit
- [PassShare](https://passshare.mynt.pw/) is a way for you to share your passwords to your friends, securely and effortlessly
- [DashingOS](https://beta.dashingos.com/) is a tool (like Notion + CodeSandbox) to make it quick and easy to prototype and document your work all in one place
- [worker-kit-email](https://github.com/miunau/worker-kit-email) helps you develop transactional emails quickly using regular SvelteKit routes
- [kaios-weather-svelte](https://github.com/cyan-2048/kaios-weather-svelte) is a very familiar looking weather app for KaiOS
- [svelte-gantt](https://github.com/ANovokmet/svelte-gantt) is a lightweight and fast interactive gantt chart/resource booking component
- [Miru](https://github.com/ThaUnknown/miru) is a BitTorrent streaming software for cats

Looking for a great SvelteKit website to contribute to? [Help build the Svelte Society site](https://github.com/svelte-society/sveltesociety.dev/issues)!


**Learning Resources**

_To Read_
- [Component party](https://component-party.dev/) is a site that compares common patterns in different frameworks
- [Quick tip: style prop defaults](https://geoffrich.net/posts/style-prop-defaults/) by Geoff Rich
- [Working with reduced motion in Svelte](https://ghostdev.xyz/posts/working-with-reduced-motion-in-svelte) by GHOST
- [Building a Musical Instrument with the Web Audio API](https://www.taniarascia.com/musical-instrument-web-audio-api/) by Tania Rascia
- [Svelte-Cubed: Creating an Accessible and Consistent Experience Across Devices](https://dev.to/alexwarnes/svelte-cubed-creating-an-accessible-and-consistent-experience-across-devices-42ae) and [Svelte-Cubed: Loading Your glTF Models](https://dev.to/alexwarnes/svelte-cubed-loading-your-gltf-models-14lf) by Alex Warnes

_To Watch_

From Svelte Society:
- [The Svelte Summit Spring 2022 stream recording](https://www.youtube.com/watch?v=qqj2cBockqE) has been updated with chapter markers to make it easy to watch again and again
- [The full recording of Svelte London, April 2022](https://www.youtube.com/watch?v=zIxzJzTnoxA) is up! Check out the amazing talks from across the Svelte London community
- [Persian Svelte Society](https://www.youtube.com/channel/UCfWH9lCsXN3j8oXq8dru82Q) is making Persian-language videos about Svelte
- Svelte Sirens has been talking monthly to creators and contributors across the Svelte Community:
  - [SvelteKit + Sanity.io: a match made in heaven](https://www.youtube.com/watch?v=j0_1hfiEVWA&list=PL8bMgX1kyZThkJ_Rk6AAFI4eY24g5XKwK&index=5) on May 13
  - [Slicing up your Svelte Sites with Prismic](https://www.youtube.com/watch?v=FUbHwwMALkk) on May 20
  - [Rendering your Svelte apps on Render](https://www.youtube.com/watch?v=SnV_hMLVyqs) on May 24
  - [The story behind the (unofficial) Svelte newsletter](https://www.youtube.com/watch?v=aK0xXm3hPxk&list=PL8bMgX1kyZThkJ_Rk6AAFI4eY24g5XKwK&index=7) on May 27


Across the Web:
- [Building vite-plugin-svelte-inspector](https://www.youtube.com/watch?v=udYB24IMtsY), [What is Singleton?](https://www.youtube.com/watch?v=xhi0m1QZue0) and [What is Navigation?](https://www.youtube.com/watch?v=Ym-OnGUps2c) by lihautan
- [Auto Import Components In Svelte Kit - Weekly Svelte](https://www.youtube.com/watch?v=JXvKBtTPr64) by LevelUpTuts
- [🧪 Test SvelteKit with TDD & VITEST 🧪](https://www.youtube.com/watch?v=5bQD3dCoyHA) by Johnny Magrippis
- [Google Analytics With SvelteKit](https://www.youtube.com/watch?v=l-x6H0fnqqQ), [Using WebSockets With SvelteKit](https://www.youtube.com/watch?v=mAcKzdW5fR8), [SvelteKit Authentication Using Cookies](https://www.youtube.com/watch?v=T935Ya4W5X0) and [Svelte Headless UI Component Library](https://www.reddit.com/r/sveltejs/comments/ueu849/svelte_headless_ui_component_library/) by Joy of Code
- [Named Layouts In Nested Routes in SvelteKit](https://www.youtube.com/watch?v=hKg_V3jouLk) by The Svelte Junction
- [SvelteKit Shiki Syntax Highlighting: Markdown Codeblocks](https://rodneylab.com/sveltekit-shiki-syntax-highlighting/) and [Svelte Capsize Styling: Typography Tooling](https://rodneylab.com/svelte-capsize-styling/) by Rodney Lab

_To Hear_
- Svelte Radio has been putting out weekly episodes:
  - [The Adventures of Running a Svelte Meetup](https://www.svelteradio.com/episodes/the-adventures-of-running-a-svelte-meetup)
  - [The other Rich! Geoff! (feat. Geoff Rich)](https://www.svelteradio.com/episodes/the-other-rich-geoff)
  - [Inspecting Svelte Code with Dominik G.](https://www.svelteradio.com/episodes/inspecting-svelte-code-with-dominik-g)
  - [Stores Galore](https://www.svelteradio.com/episodes/stores-galore)
- [Svelte and the Future of Frontend Development (feat. Rich Harris)](https://thenewstack.io/svelte-and-the-future-of-front-end-development/) from The New Stack


**Libraries, Tools & Components**
- [vite-plugin-svelte-console-remover](https://github.com/jhubbardsf/vite-plugin-svelte-console-remover) is a Vite plugin that removes all console statements (log, group, dir, error, etc) from Svelte, JS, and TS files during build so they don't leak into production
- [Svelte Headless Tables](https://github.com/bryanmylee/svelte-headless-table) is an unopinionated and extensible data tables for Svelte
- [y-presence](https://github.com/nimeshnayaju/y-presence) is a lightweight set of libraries to easily add presence (live cursors/avatars) to any web application (now with Svelte support!)
- [Svelcro](https://github.com/oslabs-beta/Svelcro) is a component performance tracker for Svelte applications
- [Svelte-Splitpanes](https://github.com/orefalo/svelte-splitpanes) lets you create dynamic and predictable view panels to layout an application
- [svelte-miniplayer](https://github.com/ThaUnknown/svelte-miniplayer) is a lightweight, fast, resizable and draggable miniplayer for media
- [svelte-keybinds](https://github.com/ThaUnknown/svelte-keybinds) is a minimalistic keybinding interface, with rebinding and saving
- [svelte-speech-recognition](https://github.com/jhubbardsf/svelte-speech-recognition) converts speech from the microphone to text and makes it available to your Svelte components

**Special Feature: Svelte Stores**
There were lots of Svelte stores released this month from a number of authors...

- [svelte-mutable-store](https://github.com/feltcoop/svelte-mutable-store) is a Svelte store for mutable values with the `immutable` compiler option
- [svelte-damped-store](https://github.com/aredridel/svelte-damped-store) is a derived writable store that can suspend updates while [svelte-lens-store](https://github.com/aredridel/svelte-lens-store) is a functional lens over Svelte stores
- [svelte-persistent-store](https://github.com/furudean/svelte-persistent-store) is a writable svelte store that saves and loads data from `Window.localStorage` or `Window.sessionStorage`.


Did we miss anything? Join us on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.com/invite/yy75DKs) to add your voice.

Don't forget that you can also join us in-person at the Svelte Summit in Stockholm! Come join us for two days of awesome Svelte content! [Get your tickets now](https://ti.to/svelte/svelte-summit-fall-edition).

See y'all next month!
