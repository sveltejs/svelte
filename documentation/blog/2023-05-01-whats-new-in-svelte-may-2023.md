---
title: "What's new in Svelte: May 2023"
description: 'New Ambassadors, a new ESLint plugin and a whole bunch of SvelteHack submissions'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Before we dive into the updates, there's a few announcements worth mentioning at the top:

## New Svelte Ambassadors

Regular features of this newsletter and all-around great content creators for Svelte [JoyOfCode](https://www.youtube.com/@JoyofCodeDev) and [HuntaByte](https://www.youtube.com/@Huntabyte) have been appointed as Svelte Ambassadors. Ambassadors are people who are well known for their helpfulness and contributions and for upholding Svelte’s reputation as a friendly, welcoming community, and we’re deeply grateful for their involvement!

## SvelteHack winners will be announced May 6th

In a just a few days, we'll find out who won [SvelteHack](https://hack.sveltesociety.dev/) - the Svelte Hackathon that took place between February 17th and April 17th. Tune in to [Svelte Summit](https://www.sveltesummit.com/) on May 6th to see if your favorite project was chosen 👀

Lots of submissions to the hackathon are featured in this month's showcase... but first, let's see what's new!

## What's new in Svelte

- `style` blocks now support CSS `@container` queries (**3.58.0**)
- `bind:innerText` is now available for `contenteditable` elements (**3.58.0**)
- A new accessability warning, `a11y-interactive-supports-focus` will now warn when interactive elements are not focusable (**3.58.0**)

For all the changes to the Svelte compiler, including unreleased changes, check out the [CHANGELOG](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md).

## What's new in SvelteKit

- When hot module reloading (HMR) is enabled, the page will reload after an error is fixed (**1.14.0**, [#9497](https://github.com/sveltejs/kit/pull/9497))
- Two apps loaded into the same html page can now be loaded simultaneously in "embedded" mode (**1.15.7**, [#9610](https://github.com/sveltejs/kit/pull/9610))
- Vite's compilation will now log warnings for packages that use the `svelte` field to resolve Svelte files differently than standard Vite resolve (**vite-plugin-svelte@2.1.0**, **kit@1.15.8**)

## What's new in Language Tools

- Support for `<svelte:document>` ([#1958](https://github.com/sveltejs/language-tools/pull/1958)) and intellisense report for new bindings ([#1957](https://github.com/sveltejs/language-tools/pull/1957)) (**107.3.0**)
- The new fix-all menu option for the "Quick fix..." makes it easy to "Add all missing imports" and other detected errors (**107.3.0**, [#1939](https://github.com/sveltejs/language-tools/pull/1939))
- We have a new and better official [ESLint plugin](https://github.com/sveltejs/eslint-plugin-svelte)! Previous support for Svelte in ESLint did not handle the template AST well, resulting in false positive/negatives and a high barrier to custom ESLint rules. This new official version is based on [ota-meshi](https://github.com/ota-meshi)'s [svelte-eslint-parser](https://github.com/sveltejs/svelte-eslint-parser) and is ready for prime time. Try it out and [share your feedback](https://github.com/sveltejs/eslint-plugin-svelte/issues)!

---

## Community Showcase

**Apps & Sites built with Svelte**

- [Sound of War](https://soundofwar.art/) is a storytelling data visualization project to help understand the scale of destruction in Ukraine
- [Syntax FM's swag shop](https://swag.syntax.fm/) is now built with SvelteKit, PlanetScale and Prisma
- [Appreciation Jar](https://appreciation.place/) is your own private space where you can send encouraging and appreciative messages to your partner
- [Japanese Jouzu](https://jp-jouzu.netlify.app/) is a Japanese sound and symbol learning app
- [MarkMyImages](https://www.markmyimages.com/) is a tool to bulk watermark, image resize, rename, effects, and more - all on-device for speed and privacy
- [Immich](https://github.com/immich-app/immich) is a self-hosted photo and video backup solution directly from your mobile phone
- [Earbetter](https://github.com/ryanatkn/earbetter) is an ear training game and tools for playing and programming music and audio
- [Tune Twisters](https://tune-twisters.vercel.app/) is a guessing game for songs... in reverse
- [ResponseHunt](https://www.responsehunt.com/) is a mystery game based on browser requests - use your programming skills to get to the “golden” response
- [Wolfensvelte 3D](https://github.com/snuffyDev/Wolfensvelte-3D/) is a Svelte "port" of Wolfenstein 3D
- [Code Solving](https://code-svelte.vercel.app/) teaches how to solve problems with code
- [Make Bookmarklets](https://make-bookmarklets.com/) is a quick way to create JavaScript bookmarklets with linting, intellisense and auto-minification
- [GeniePM](https://genie.pm) is an AI tool to help Product Managers write user stories and requirements
- [Bitesized News](https://bitesized.news/) is an AI that delivers news digests and responds to questions via chat
- [Open Tunings](https://www.open-tunings.com/) is a place to explore alternative guitar tunings without having to retune your guitar
- [BlinkSMS](https://blinksms.se/#) is a text alert tool for Stockholm Student Housing to help with booking laundry times
- [Dev Links](https://github.com/killswitchh/dev-links) helps dev showcase multiple links in a single place - similar to Linktree and Kofi
- [Audiogest](https://audiogest.app/) is a tool to convert speech to text & summarize any audio
- [MineSweep](https://alecames.com/minesweep) is a rendition of Minesweeper built with Svelte and JavaScript
- [Biolytics](https://biolytics.app/) lets you import your lab tests to see all your lab tests in one place
- [Zero share](https://github.com/ntsd/zero-share) is a secure P2P file sharing using WebRTC
- [Svelte lab](https://www.sveltelab.dev/) is a sandbox for creating and sharing SvelteKit projects

**Learning Resources**

_Featuring Svelte Contributors and Ambassadors_

- [Dev Vlog: April 2023 - TypeScript vs JSDoc, Transitions API, Dominic Gannaway joins Svelte team](https://www.youtube.com/watch?v=MJHO6FSioPI)
- [Rich Harris on frameworks, the web, and the edge.](https://www.youtube.com/watch?v=uXCipjbcQfM) from Vercel's Svelte Meetup in NYC
- [Svelte & SvelteKit](https://frontendmasters.com/workshops/svelte-sveltekit/) taught by Rich Harris on Frontend Masters
- This Week in Svelte:
  - [2023 March 31 - SvelteKit, Svelte; static sites and headless CMS demos](https://www.youtube.com/watch?v=-YjLubiieYs)
  - [2023 April 22 - SvelteKit 1.15.7, skip links, error handling, static assets](https://www.youtube.com/watch?v=SCMosMo85_8)
  - [2023 April 14 - SvelteKit 1.15.5, accessible buttons, advanced toggle state 🧪🔥](https://www.youtube.com/watch?v=H2kOO5mvUQs)
  - [2023 April 21 - SvelteKit 1.15.7, skip links, error handling, static assets](https://www.youtube.com/watch?v=SCMosMo85_8)
- Svelte Radio
  - [Using Svelte in React with Puru Vijay](https://www.svelteradio.com/episodes/using-svelte-in-react-with-puru-vijay)
  - [Eric Brehault and Nuclia](https://www.svelteradio.com/episodes/eric-brehault-and-nuclia)
  - [Svelte at AppWrite with Alex Patterson](https://www.svelteradio.com/episodes/svelte-at-appwrite-with-alex-patterson)
  - [Svelte in Research at Dartmouth with Wasita and Eshin](https://www.svelteradio.com/episodes/svelte-in-research-at-dartmouth-with-wasita-and-eshin)

_To Watch_

- [The Complete SvelteKit Course For Building Modern Web Apps](https://www.youtube.com/watch?v=MoGkX4RvZ38) and [Simple SvelteKit Page Transitions](https://www.youtube.com/watch?v=gkw1wFIXM_8) by Joy of Code
- [Svelte For React Developers | Your Next JavaScript Framework?](https://www.youtube.com/watch?v=smqE0y0z0CA) by Cretezy
- [Svelte & SvelteKit: The Complete Guide](https://www.udemy.com/course/svelte-and-sveltekit/?ranMID=39197&ranEAID=msYS1Nvjv4c&ranSiteID=msYS1Nvjv4c-oN6aTXp3jgDgUps8JCGxcg&LSNPUBID=msYS1Nvjv4c&utm_source=aff-campaign&utm_medium=udemyads) by Ali Alaa on Udemy
- [ChatGPT-4 with SvelteKit 🤖 Generative AI on the EDGE 🌍](https://www.youtube.com/watch?v=Uw5GZg96kD8) by Johnny Magrippis

_To Read_

- [Headless WordPress with GraphQL and SvelteKit](https://www.okupter.com/blog/headless-wordpress-graphql-sveltekit) and [How to fix the duplicate meta tags issue in SvelteKit](https://www.okupter.com/blog/sveltekit-fix-duplicate-metatags-issue) by Justin Ahinon
- [How to setup tRPC in a SvelteKit project](https://raqueebuddinaziz.com/blog/how-to-setup-trpc-in-a-sveltekit-project/) by Raqueebuddin Aziz
- [Better Data Visualizations with Svelte](https://www.newline.co/courses/better-data-visualizations-with-svelte/welcome) by newline
- [Offline App with SvelteKit + SQLite Part 1: Setup WebAssembly SQLite](https://www.youtube.com/watch?v=Uvnzwp72Ze8) by hartenfellerdev

**Libraries, Tools & Components**

- [Sveltris](https://github.com/mokshit06/sveltris) lets you intermix UI primitives like components, and state primitives like hooks between frameworks, without even noticing
- [SwiftMarket](https://github.com/SwiftMarket/swiftmarket-sveltekit) is an E-Commerce solution built with SvelteKit, Pocketbase as a database and Stripe for payments
- [Svelegante](https://www.npmjs.com/package/svelegante) is a Classy writable store for Svelte
- [Table Generator](https://www.table-generator.de/) lets you create, design and customize your own tables tables online using a graphical editor
- [Svelte Animated Headline](https://www.npmjs.com/package/svelte-animated-headline) is an animated headline component that can grab attention in an informative way
- [SvelteKit Music App Example](https://github.com/tguelcan/music) demonstrates how to connect and process data as well as some practical examples of how to develop frontend components with TailwindCSS
- [Socio](https://www.npmjs.com/package/socio) is a WebSocket Real-Time Communication (RTC) API framework to connect your front-end logic to a back-end database reactively
- [Flowbite Svelte](https://flowbite-svelte.com/) is an official Flowbite component library for Svelte
- [Wundergraph](https://wundergraph.com/blog/introducing_svelte_query_client), a backend for frontend framework, just released their Svelte Query client
- [Lucia](https://lucia-auth.com/blog/lucia-1) just reached 1.0 for their simple and flexible auth library for SvelteKit
- [svelte-stepper](https://github.com/efstajas/svelte-stepper) is a simple library for building animated stepper flows with Svelte

As always, feel free to let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

See ya next time!
