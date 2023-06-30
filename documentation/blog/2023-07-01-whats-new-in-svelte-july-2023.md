---
title: "What's new in Svelte: July 2023"
description: "Svelte 4.0, new website and a tour around the community"
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Svelte 4 is out and folks have been building! There's a bunch of new showcases, libraries and tutorials to share. So let's get right into it...

## What's new in Svelte
The big news this month was the release of Svelte 4.0! You can read all about it in the [Announcing Svelte 4 post](https://svelte.dev/blog/svelte-4). From performance fixes and developer experience improvements to [a brand new site, docs and tutorial](https://svelte.dev/blog/svelte-dev-overhaul)... this new release sets the stage for Svelte 5 with minimal breaking changes.

If you're already on Node.js 16, it's possible you won't see any breaking changes in your project. But be sure to read the [migration guide](https://svelte.dev/docs/v4-migration-guide) for all the details.

For a full list of all the changes to the Svelte compiler, including unreleased changes, check out the [CHANGELOG](https://github.com/sveltejs/svelte/blob/master/packages/svelte/CHANGELOG.md).

## What's new in SvelteKit
This month there were lots of awesome [bug fixes](https://github.com/sveltejs/kit/blob/master/packages/kit/CHANGELOG.md), so be sure to upgrade to the latest version! There are also a few new features to mention:
- The new `event.isSubRequest` boolean indicates whether this is a same-origin fetch request to one of the app's own APIs during a server request (**1.21.0**, [Docs](https://kit.svelte.dev/docs/types#public-types-requestevent), [#10170](https://github.com/sveltejs/kit/pull/10170))
- A new config option, `config.kit.env.privatePrefix` will set a private prefix on environment variables. This defaults to `''` (**1.21.0**, [Docs](https://kit.svelte.dev/docs/configuration), [#9996](https://github.com/sveltejs/kit/pull/9996))
- `VERSION` is now exported and accessible via `@sveltejs/kit`. This can be used for feature detection or anything else that requires knowledge of the current version of SvelteKit (**1.21.0**, [Docs](https://kit.svelte.dev/docs/modules#sveltejs-kit-version), [#9969](https://github.com/sveltejs/kit/pull/9969))

For adapter-specific changes, check out the CHANGELOGs in each of [the `adapter` directories](https://github.com/sveltejs/kit/tree/master/packages).

---

## Community Showcase

**Apps & Sites built with Svelte**
- [Heerdle](https://github.com/DreaminDani/heerdle) is a remake of Spotify's now-defunct Heardle - the daily music guessing game
- [Meoweler](https://meoweler.com/) is a travel site filled with cats and helpful facts about popular destinations
- [A tech lead from IKEA](https://www.reddit.com/r/sveltejs/comments/13w4zg3/comment/jmaxial/?utm_source=share&utm_medium=web2x&context=3) gave a few more details on the way they build pages (and page template) using Svelte
- [The Quest to Replace Passwords](https://notes.ekzhang.com/papers/passwords) features an interactive comparison visualization for all the popular password management tools
- [audiogest](https://audiogest.app/en) lets you turn speech to text & summarize any audio in one click
- [heroify](https://www.heroify.lol/) generates 3D graphics for your website with AI
- [Diesel Legacy: The Brazen Age](https://store.steampowered.com/app/1959140/Diesel_Legacy_The_Brazen_Age/) is a fighting game whose leaderboard and profile pages were all built in Svelte
- [markmyimages](https://www.markmyimages.com/) is a watermarking tool with bulk image resize, rename, effects, and more
- [md.robino.dev](https://github.com/rossrobino/md) is a web based markdown editor
- [YABin](https://github.com/Yureien/YABin) is Yet Another Pastebin with some very specific features

**Learning Resources**
- [Announcing Svelte 4 post](https://svelte.dev/blog/svelte-4)
- [svelte.dev: A complete overhaul](https://svelte.dev/blog/svelte-dev-overhaul)

_Featuring Svelte Contributors and Ambassadors_
- [Dev Vlog: June 2023](https://www.youtube.com/watch?v=AOXq89h8saI) - Svelte 4.0 with Rich Harris
- [PodRocket: Svelte 4](https://podrocket.logrocket.com/svelte-4) with Geoff
- [This Dot Media: Svelte 4 Launch Party](https://www.youtube.com/watch?v=-9gy_leMmcQ) with Simon, Ben, Geoff, and Puru
- [Exposing Svelte: Between Two Nerds](https://www.youtube.com/watch?v=kAfotLrebhY) is a comedic conversation between Rich Harris and Dax Raad
- [Community Tutorial: Self-hosting SvelteKit with a VPS, Docker, CapRover and GitHub Actions](https://www.youtube.com/watch?v=KbIFRVvdgA8) with Stanislav Khromov
- [SvelteKit and Storybook](https://www.youtube.com/watch?v=1wH7rR7hZlg) with Jeppe Reinhold
- This Week in Svelte:
  - [2023 June 2](https://www.youtube.com/watch?v=B2AOYWs6eko) - SvelteKit 1.20.1, Svelte 4 pre-release, Headless UI libraries
  - [2023 June 9](https://www.youtube.com/watch?v=OG70PKD0hEU) - Updates, Self-hosting SvelteKit, Passing styles to children
  - [2023 June 16](https://www.youtube.com/watch?v=GNEbC5K34Po) - Svelte 4 next.1, how to create a hamburger menu, group layouts
  - [2023 June 23](https://www.youtube.com/watch?v=o-qnnbMbmE4) - Svelte 4, Popovers and hover, Real Time requests with SvelteKit
- Svelte Radio
  - [SvelteLab - a Svelte REPL for SvelteKit](https://www.svelteradio.com/episodes/sveltelab-a-svelte-repl-for-sveltekit-with-antonio-and-paolo) with Antonio and Paolo
  - [Svelte Radio Live - Svelte 4 Summer Special](https://www.youtube.com/watch?v=72TIVhRtyWE) with Simon and Puru
- [Svelte Society - London June 2023](https://www.youtube.com/watch?v=EkH0aMgeIKw)
- [Using The Svelte Context API With Stores](https://www.youtube.com/watch?v=dp-7NvLDrK4), [Impossible FLIP Layout Animations With Svelte And GSAP](https://www.youtube.com/watch?v=ecP8RwpkiQw) and [Create Beautiful Presentations With Svelte](https://www.youtube.com/watch?v=67lqa5kTQkA) by Joy of Code


_To Watch_
- [Server-side filtered, paginated and sorted Table in SvelteKit](https://www.youtube.com/watch?v=VgCU0cVWgJE) by hartenfellerdev
- [Best Icon Library for Svelte and SvelteKit in 2023](https://www.youtube.com/watch?v=qJP6hC4YIhk) by SvelteRust

_To Read_
- [From Zero to Production with SvelteKit](https://www.okupter.com/events/from-zero-to-production-with-sveltekit) by Justin Ahinon
- [Thoughts on Svelte(Kit), one year and 3 billion requests later](https://claudioholanda.ch/en/blog/svelte-kit-after-3-billion-requests/) by Claudio Holanda
- [How I published a gratitude journaling app for iOS and Android using SvelteKit and Capacitor](https://khromov.se/how-i-published-a-gratitude-journaling-app-for-ios-and-android-using-sveltekit-and-capacitor/) by Stanislav Khromov
- [Learning by doing - Vue devs build a Svelte Single Page App](https://www.blackspike.com/blog/learning-svelte-by-building-a-single-page-application/) by Black Spike
- [Generate Breadcrumb and Navigation in SvelteKit](https://blog.aakashgoplani.in/generate-breadcrumb-and-navigation-in-sveltekit), [SvelteKit Authentication using SvelteKitAuth and OAuth providers: A Comprehensive Guide](https://blog.aakashgoplani.in/sveltekit-authentication-using-sveltekitauth-and-oauth-providers-a-comprehensive-guide) and [SvelteKitAuth with Salesforce OAuth provider](https://blog.aakashgoplani.in/sveltekitauth-with-salesforce-oauth-provider) by Aakash Goplani
- [Instantly find and remove Svelte component orphans](https://node-jz.medium.com/instantly-find-and-remove-svelte-component-orphans-9b2838ea2d99) by Jeremy Zaborowski
- [Migration Guide from Routify to SvelteKit Router](https://blog.aakashgoplani.in/migration-guide-from-routify-to-sveltekit-router) by Aakash Goplani
- [Creating 3D data visualization using Threlte and D3](https://www.datavizcubed.com/) by DataViz Cubed
- [Svelte Real‑time Multiplayer Game: User Presence](https://rodneylab.com/svelte-realtime-multiplayer-game/) and [SvelteKit PostCSS Tutorial: use Future CSS Today](https://rodneylab.com/sveltekit-postcss-tutorial/) by Rodney Lab
- [SvelteKit’s World of Routing: Unleash power of your app using Dynamic Routes and Parameters](https://www.inow.dev/sveltekits-world-of-routing-unleash-power-of-your-app-using-dynamic-routes-and-parameters/) by Igor Nowosad


**Libraries, Tools & Components**
- [The Vercel AI SDK](https://vercel.com/blog/introducing-the-vercel-ai-sdk) is an interoperable, streaming-enabled, edge-ready software development kit for AI apps built with React and Svelte
- [Superforms 1.0](https://superforms.rocks/) has been released. Check out the [migration guide](https://superforms.rocks/migration) and [new feature list](https://superforms.rocks/whats-new-v1) for more details
- [Panda CSS](https://panda-css.com/docs/getting-started/svelte) is CSS-in-JS with build time generated styles, RSC compatibility and multi-variant support
- [svelte-section-list](https://github.com/TIKramer/svelte-section-list) is a headless Svelte npm package that provides drag-and-drop functionality for managing items and sections
- [WebStorm](https://twitter.com/tomblachut/status/1669759906579185681?t=6WzLPUi65wsLtbVvYky7UQ&s=19) is starting to use the Svelte Language Server in its IDE tooling
- [shadcn-svelte](https://www.shadcn-svelte.com/) is an unofficial port of [shadcn/ui](https://github.com/shadcn/ui) to Svelte that makes it easy to build your component library from common base components
- [sveltekit-multibuild](https://github.com/MrNNP/sveltekit-multibuild) is a starter repo to create Android apps, web sites, desktop apps, and Chrome extensions automatically
- [SvelteKit AI Chatbot](https://github.com/jianyuan/sveltekit-ai-chatbot) is an open-source AI chatbot app template built with SvelteKit, the Vercel AI SDK, OpenAI, and Vercel KV.
- [KitAI](https://kit-ai.vercel.app/) provides batteries-included AI templates for SvelteKit and Next.js
- [Svelte Form Builder](https://github.com/pragmatic-engineering/svelte-form-builder-community) is a no-code drag&drop form builder for Svelte

Thanks for reading! As always, feel free to let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋
