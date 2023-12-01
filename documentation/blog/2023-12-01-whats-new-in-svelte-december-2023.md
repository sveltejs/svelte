---
title: "What's new in Svelte: December 2023"
description: 'Svelte 5 preview announced at Svelte Summit Fall 2023'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Svelte Summit Fall 2023 was epic! Featuring talks from across the ecosystem and the launches from the core team of new Svelte Dev Tools, image optimization, and a preview version of Svelte 5.0! The whole talk can be found [here](https://www.youtube.com/watch?v=pTgIx-ucMsY) (timestamps below):
- [0:00](https://www.youtube.com/watch?v=pTgIx-ucMsY&t=0s) Hype music!
- [18:20](https://www.youtube.com/watch?v=pTgIx-ucMsY&t=1100s) Exploring Svelte DevTools - Ignatius B (4 minutes)
- [25:27](https://www.youtube.com/watch?v=pTgIx-ucMsY&t=1527s) How does SvelteKit fare as a SPA Framework - Henry Lie (25 minutes)
- [53:00](https://www.youtube.com/watch?v=pTgIx-ucMsY&t=3180s) enhanced:img - Ben McCann (6 minutes)
- [1:03:44](https://www.youtube.com/watch?v=pTgIx-ucMsY&t=3824s) inlang-paraglide JS for SvelteKit i18n - Samuel Stroschein (10 minutes)
- [1:17:32](https://www.youtube.com/watch?v=pTgIx-ucMsY&t=4652s) How Svelte & GraphQL plays well together - Jean-Yves Couet (31 minutes)
- [1:53:10](https://www.youtube.com/watch?v=pTgIx-ucMsY&t=6790s) svelte-ecosystem-ci - Dominik G (10 minutes)
- [2:23:06](https://www.youtube.com/watch?v=pTgIx-ucMsY&t=8586s) Svelte for Creative Development - Steven Stavrakis (10 minutes)
- [2:35:33](https://www.youtube.com/watch?v=pTgIx-ucMsY&t=9333s) Translating the docs - Romain I'Ourson (11 minutes)
- [2:49:48](https://www.youtube.com/watch?v=pTgIx-ucMsY&t=10188s) ENHANCE! - Paolo Ricciuti (25 minutes)
- [3:18:25](https://www.youtube.com/watch?v=pTgIx-ucMsY&t=11905s) Accessibility tips with Svelte solutions - Enrico Sacchetti (25 minutes)
- [3:49:11](https://www.youtube.com/watch?v=pTgIx-ucMsY&t=13751s) svelte@next - Rich Harris (18 minutes)

Today is also the first day of [Advent of Svelte](https://advent.sveltesociety.dev/): A Svelte challenge for each day of December. Join the festivities and participate in a daily frontend challenge using Svelte!

Now let's dive into the updates...

## What's new in Svelte (5.0 Preview!)

[Svelte 5 preview](https://svelte-5-preview.vercel.app/docs/introduction) is now available at [svelte@next](https://www.npmjs.com/package/svelte?activeTab=versions) while Svelte 4's current version (`@latest`) is `4.2.7`. All the changes below are from the preview's branch:

- TypeScript is now supported natively via acorn-typescript (**5.0.0-next.9**, [#9482](https://github.com/sveltejs/svelte/pull/9482))
- The new `$effect.active` rune returns a boolean to indicate if an effect is active. This lets you set up subscriptions when a value is read (in an effect, or in the template) but also read values without creating subscriptions (**5.0.0-next.10**, [Docs](https://svelte-5-preview.vercel.app/docs/runes#effect-active), [#9591](https://github.com/sveltejs/svelte/pull/9591))
- The new `$effect.root` rune creates a non-tracked scope that doesn't auto-cleanup. This is useful for nested effects that you want to manually control (**5.0.0-next.14**, [Docs](https://svelte-5-preview.vercel.app/docs/runes#effect-root), [#9638](https://github.com/sveltejs/svelte/pull/9638))

For all the release notes going forward, check out [the CHANGELOG on main](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md). For the highlights, take a look below!


## What's new in SvelteKit

- Creating a new SvelteKit project will now ask if you want to try the Svelte 5 beta ([#11026](https://github.com/sveltejs/kit/pull/11026))
- Prettier 3 and `prettier-plugin-svelte` 3 are now the default versions when creating new SvelteKit projects ([#10410](https://github.com/sveltejs/kit/pull/10410))
- nodejs20.x is now supported via the Vercel adapter ([#11067](https://github.com/sveltejs/kit/pull/11067))
- `@sveltejs/enhanced-img` makes serving different sizes of images easy, thanks to pre-processing ([Docs](https://kit.svelte.dev/docs/images#sveltejs-enhanced-img), [#10788](https://github.com/sveltejs/kit/pull/10788))

For a complete list of bug fixes and performance updates, check out the [SvelteKit CHANGELOG](https://github.com/sveltejs/kit/blob/master/packages/kit/CHANGELOG.md). You can also find adapter-specific CHANGELOGs in each of [the `adapter` directories](https://github.com/sveltejs/kit/tree/master/packages).


## What's new in Language Tools

- The latest version of language tools adds best-effort fallback typings to `$props()` rune (**extensions-108.1.0**)
- Language tools better supports the `@render` tag by using the `Snippet` type (**extensions-108.0.0**)
- The Svelte ESLint plugin has been updated to support the Svelte 5 preview ([v2.36.0-next.2](https://github.com/sveltejs/eslint-plugin-svelte/releases/tag/v2.36.0-next.2))


---

## Community Showcase

**Apps & Sites built with Svelte**

- [MobileView](https://mobileview.io/) is a Chrome Extension for real-time, cross-device website simulation
- [ClassroomIO](https://www.classroomio.com/) is an Open Source Platform for Tech Bootcamps
- [sshx](https://github.com/ekzhang/sshx) is a secure web-based, collaborative terminal
- [ToneShift](https://www.toneshift.cc/) lets you clone any voice, create music, and join a community of voices
- [CanvasGPT](https://www.canvasgpt.com/) is Autonomous Mind Maps. Powered by AI
- [Wordplay](https://wordplay.dev/) is a new educational, accessible, and language-inclusive programming language for creating playful, interactive typography ([Blog Post](https://medium.com/bits-and-behavior/wordplay-accessible-language-inclusive-interactive-typography-e4b9027eaf10))
- [CodeFlow](https://github.com/SikandarJODD/CodeFlow) is a roadmap for programmers to learn, think and code better
- [Teller](https://github.com/Valink-Solutions/teller) is a comprehensive Minecraft backup solution designed to facilitate both local backups and interfacing with the ChunkVault Backend
- [Sudoku](https://github.com/betofigueiredo/sudoku) is a board created with SvelteKit, Typescript and Tailwind

**Learning Resources**

_Featuring Svelte Contributors and Ambassadors_
- [View Transitions in SvelteKit and beyond with Geoff Rich](https://www.svelteradio.com/episodes/view-transitions-in-sveltekit-and-beyond-with-geoff-rich) and [Melting UIs with Thomas G. Lopes](https://www.svelteradio.com/episodes/melting-uis-with-thomas-g-lopes) by Svelte Radio
- [Making The Best Svelte SVG Animation Library](https://www.youtube.com/watch?v=_jWnyJRKOvU), [How To Publish Your JavaScript Code To Npm With SvelteKit](https://www.youtube.com/watch?v=Xvq8rCl1lIM), and [What's New In Svelte 5? (Runes, Events, Snippets)](https://www.youtube.com/watch?v=gGwnF-lxS_Q) by Joy of Code
- Svelte Society Talks
  - [Svelte Society - San Diego November 2023](https://www.youtube.com/watch?v=Gh4ESdKP3yQ)
  - [Building a SvelteKit Adapter for WinterJS](https://www.youtube.com/watch?v=8HaAagG6V-Q) with Willow and Kev
- This Week in Svelte:
  - [2023 October 27](https://www.youtube.com/watch?v=jCNl6dtFDn4) - SvelteKit 1.27.1, the pillars of a component library
  - [2023 November 3](https://www.youtube.com/watch?v=-cyO9xzBXtk) - SvelteKit 1.27.2, choosing a database, preprocessors
  - [2023 November 10](https://www.youtube.com/watch?v=1ZWqySQNrtQ) - SvelteKit 1.27.4, Svelte 4.2.3, closing modals
  - [2023 Nov 17](https://www.youtube.com/watch?v=9lK6VvBEtL0) - SvelteKit 1.27.6, Svelte 4.2.5, new Svelte 5 features!
  - [2023 Nov 24](https://www.youtube.com/watch?v=vofaP86-HKU) - Svelte 4.2.7, TypeScript in markup, websockets in SvelteKit

_To Watch/Hear_

- [Why Stack Overflow is embracing Svelte](https://stackoverflow.blog/2023/10/31/why-stack-overflow-is-embracing-svelte/) by The Stack Overflow Podcast
- [Building a Twitter Clone with Svelte, SvelteKit, ,Firebase, Tailwind Css, Shad-cn Svelte etc](https://www.youtube.com/watch?v=MoHtXyRI7CQ) by Lawal Adebola
- [SvelteKit Crash Course: Build a Full Website in 90 min! - 2023 Tutorial](https://www.youtube.com/watch?v=QKxJW6VVp6w) by Prismic

_To Read_

- [Hands-On Experience: How to Build an eCommerce Store with SvelteKit?](https://crystallize.com/blog/building-ecommerce-with-sveltekit) by Bård Farstad
- [Productive Dark Mode with SvelteKit, PostCSS, and TailwindCSS (Behind the Screen)](https://www.sveltevietnam.dev/en/blog/20231110-behind-the-screen-dark-mode-with-sveltekit-tailwindcss-and-postcss) by Quang Phan
- [Setting up OAuth with Auth.js in a SvelteKit Project](https://mainmatter.com/blog/2023/11/23/setting-up-oauth-with-auth-js-and-sveltekit/) by Andrey Mikhaylov
- [SvelteKit 🤝 Storybook](https://mainmatter.com/blog/2023/11/28/sveltekit-storybook/) by Paolo Ricciuti
- [Integrate Storybook in Svelte: Doing it the Svelte-way](https://mainmatter.com/blog/2023/09/18/integrate-storybook-in-svelte-doing-it-the-svelte-way/) by Óscar Domínguez Celada
- [Drizzle ORM with Sveltekit](https://medium.com/@anasmohammed361/drizzle-orm-with-sveltekit-8aecbc8cc39d) and [Sveltekit — Streaming SSR](https://medium.com/@anasmohammed361/sveltekit-streaming-ssr-40ce666daffa) by Mohammed Anas
- [Svelte & WordPress Full Stack Course](https://www.udemy.com/course/svelte-wordpress-full-stack/) by Artneo Web Design on udemy
- [Add a loading indicator to a Form Action in SvelteKit](https://snippets.khromov.se/add-a-loading-indicator-to-a-form-action-in-sveltekit/) by Useful Snippets (Stanislav Khromov)

**Libraries, Tools & Components**

- [sveltekit-view-transition](https://github.com/paoloricciuti/sveltekit-view-transition) provides a simplified `view-transition-api` for Sveltekit
- [T18S](https://t18s.sigrist.dev/) aims to provide the best internationalization experience for SvelteKit, delivering typesafety, performance, and ease of use
- [Svelte Flow](https://svelteflow.dev/) is a customizable Svelte component for building node-based editors and interactive diagrams
- [Super Sitemap](https://github.com/jasongitmail/super-sitemap) is a SvelteKit sitemap focused on ease of use and making it impossible to forget to add your paths
- [Svelte UX](https://svelte-ux.techniq.dev/) is a Tailwind-based component library to simplify creating highly interactive and visual applications
- [CanIKit](https://github.com/tombroomfield/CanIKit) provides a simple way to add authorization to your SvelteKit application
- [Svelte Toggles](https://github.com/Team-GOATS/svelte-toggles-npm-package) manages light & dark mode interactions and preference storage
- [Baselime](https://baselime.io/docs/sending-data/cloudflare/pages/sveltekit/) now supports SvelteKit for the edge-logger package

That's it for this month! Feel free to let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋
