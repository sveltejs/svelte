---
title: "What's new in Svelte: October 2022"
description: "Svelte Summit, `use:enhance`, and a SvelteKit Release Candidate!"
author: Daniel Sandoval
authorURL: https://desandoval.net
---

There's a bunch of updates this month... from new features in Svelte and SvelteKit to a whole 2-day *summit*! Plus, the Svelte extension gets some helpful new tools, new accessibility (a11y) warnings, and Tan Li Hau teaches us how to build our own Svelte and a Svelte spreadsheet 😎

## What happened at Svelte Summit?

A lot! Below you can find all the talks, by timestamp, from each livestream. Bite-size videos of the event will be coming soon to the Svelte Society channel, so be sure to [Subscribe](https://www.youtube.com/c/SvelteSociety), if you haven't already!

_Day One_
- [12:31](https://www.youtube.com/watch?v=pJcbZr5VlV4&t=751s) - How to get Svelte adopted at work
- [33:21](https://www.youtube.com/watch?v=pJcbZr5VlV4&t=2001s) - Animating Data Visualization in Svelte
- [2:20:36](https://www.youtube.com/watch?v=pJcbZr5VlV4&t=8436s) - Red flags & code smells
- [2:53:42](https://www.youtube.com/watch?v=pJcbZr5VlV4&t=10422s) - Enhance your DX
- [4:42:41](https://www.youtube.com/watch?v=pJcbZr5VlV4&t=16961s) - Svelte in UBS’ knowledge graph
- [5:06:42](https://www.youtube.com/watch?v=pJcbZr5VlV4&t=18402s) - How to migrate react libraries to svelte
- [5:45:27](https://www.youtube.com/watch?v=pJcbZr5VlV4&t=20727s) - DX magic in the world of Svelte
- [7:25:39](https://www.youtube.com/watch?v=pJcbZr5VlV4&t=26739s) - Data visualizations powered by Svelte
- [7:59:38](https://www.youtube.com/watch?v=pJcbZr5VlV4&t=28778s) - Partial Hydration in Svelte for Increased Performance
- [8:20:49](https://www.youtube.com/watch?v=pJcbZr5VlV4&t=30049s) - Building the future, faster

_Day Two_
- [24:09](https://www.youtube.com/watch?v=A8jkJTWacow&t=1449s) - Scrollytell me why: Ain't nothing but a piece of cake
- [2:02:40](https://www.youtube.com/watch?v=A8jkJTWacow&t=7360s) - I told you my dog wouldn’t run
- [2:29:43](https://www.youtube.com/watch?v=A8jkJTWacow&t=8983s) - 10Xing Svelte
- [3:04:56](https://www.youtube.com/watch?v=A8jkJTWacow&t=11096s) - Svemix? Re-svmix? Re-svelte?: Bringing Svelte to Remix Router
- [5:09:39](https://www.youtube.com/watch?v=A8jkJTWacow&t=18579s) - Having fun with stores: an interactive demo of Svelte’s built in state management library
- [5:37:06](https://www.youtube.com/watch?v=A8jkJTWacow&t=20226s) - When Keeping it Svelte Goes Wrong. An Analysis of Some of the Worst Svelte I Have Ever Coded
- [7:22:05](https://www.youtube.com/watch?v=A8jkJTWacow&t=26525s) - Getting started with Hooks
- [7:38:14](https://www.youtube.com/watch?v=A8jkJTWacow&t=27494s) - Special Announcement*

*In the final talk of the summit, Rich Harris announces the first Release Candidate of SvelteKit! With no planned breaking changes left, the team is hard at work squashing bugs and adding the remaining features for 1.0...

## More SvelteKit Updates
- `use:enhance` is the easiest way to progressively enhance a form ([Docs](https://kit.svelte.dev/docs/form-actions#progressive-enhancement-use-enhance), [#6633](https://github.com/sveltejs/kit/pull/6633), [#6828](https://github.com/sveltejs/kit/pull/6828), [#7012](https://github.com/sveltejs/kit/pull/7012))
- The demo app has been updated to add the Sverdle game, which Rich demoed at Svelte Summit and demonstrates `use:enhance` ([#6979](https://github.com/sveltejs/kit/pull/6979))
- Cloudflare Pages `_routes.json` specification is now supported by `adapter-cloudflare` ([#6530](https://github.com/sveltejs/kit/pull/6530))
- Improved build performance by running asset and page compression in parallel ([#6710](https://github.com/sveltejs/kit/pull/6710))

**Breaking changes:**
- Node 16.14 is now the minimum version to run SvelteKit ([#6388](https://github.com/sveltejs/kit/pull/6388))
- `App.PrivateEnv` and `App.PublicEnv` have been removed in favour of generated types ([#6413](https://github.com/sveltejs/kit/pull/6413))
- `%sveltekit.message%` has been replaced with `%sveltekit.error.message%` ([6659](https://github.com/sveltejs/kit/pull/6659))
- `App.PageError` is now `App.Error` - check for it in your hooks ([Docs](https://kit.svelte.dev/docs/hooks#shared-hooks-handleerror), [#6963](https://github.com/sveltejs/kit/pull/6963))
- `externalFetch` is now `handleFetch` and will run for all fetch calls in `load` that run on the server ([#6565](https://github.com/sveltejs/kit/pull/6565))

For a full list of changes, check out SvelteKit's [CHANGELOG](https://github.com/sveltejs/kit/blob/master/packages/kit/CHANGELOG.md).

## Svelte Updates
- New a11y warnings for `incorrect-aria-attribute-type`, `no-abstract-role`, `interactive-element-to-noninteractive-role` and `role-has-required-aria-props`.`no-noninteractive-tabindex` and `click-events-have-key-events` coming soon! (**3.50.0**)
- New types for `ComponentEvents` and `SveltePreprocessor` (**3.50.0**)
- Improved parsing speed when encountering large blocks of whitespace (**3.50.0**)
- All global JavaScript objects and functions are now recognized as known globals (**3.50.1**)

For all the changes to the Svelte compiler, including upcoming changes, check out the [CHANGELOG](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md).

## New in Language Tools
- Better code formatting for editor suggestion (**106.0.0**, [#1598](https://github.com/sveltejs/language-tools/pull/1598))
- Easily create SvelteKit route files from the context menu or command palette (**106.1.0**, [#1620](https://github.com/sveltejs/language-tools/pull/1620))

---

## Ask Questions in the Svelte Discord

In case you missed the announcement, the Svelte Discord has an exciting new update... a forum! The new [questions channel](https://discord.com/channels/457912077277855764/1023340103071965194) utilizes Discord's new forums feature to help the community better ask, find and answer questions!

It can be used for anything you may be trying to accomplish using Svelte including using SvelteKit, community libraries, tools, etc. So ask away!

---

## Community Showcase

**Apps & Sites built with Svelte**
- [Timeflow](https://www.timeflow.site/) is a smart calendar & task manager that dynamically schedules your tasks between your events
- [GeoQuest](https://github.com/woutdp/geoquest) is an open source geography game
- [Houses Of](https://housesof.world/) is a project showcasing charismatic houses around the world
- [Greenfield Brewery](https://greenfield-brewery.vercel.app/) is a tool for quickly installing a lot of homebrew casks
- [Gram Jam](https://gramjam.app/) is a word puzzle game inspired by match three games and Scrabble
- [Beatbump](https://github.com/snuffyDev/Beatbump) is a privacy-respecting alternative frontend for YouTube Music
- [RoomOS Device Widgets](https://github.com/wxsd-sales/roomos-device-widgets) is an app for demoing RoomOS device capabilities in Kiosk/PWA mode
- [World Seed](https://store.steampowered.com/app/1870320/World_Seed/) is a full blown online multiplayer game
- [Lirify](https://lirify-tan.vercel.app/) is a song lyrics writing web app tool made in Latvia
- [Splet Tech Konferencija](https://www.splet.rs/) is a tech conference in Serbia with a *very* fancy website
- [Unbounded](https://unbounded.polkadot.network/) is an open-source variable font - funded by blockchain (and an awesome-looking website)
- [Porter's Paints](https://shop.porterspaints.com/) is an eCommerce site for (you guessed it) paints built with Svelte
- [CRAN/E](https://www.cran-e.com/) is a search engine for modern R-packages 


**Learning Resources**

_Starring the Svelte team_
- [Upgrading SvelteKit](https://www.youtube.com/watch?v=vzeZskhjoeQ) by Svelte Sirens (with Brittney, Kev, and GHOST!)
- [Build your own Svelte](https://www.youtube.com/watch?v=mwvyKGw2CzU) by lihautan
- [Native Page Transitions in SvelteKit: Part 1](https://geoffrich.net/posts/page-transitions-1/) by Geoff Rich
- [Build a cross platform app with Tauri](https://ghostdev.xyz/posts/build-a-cross-platform-app-with-tauri/) by GHOST

_To Watch_
- [How To Use Future CSS In Svelte](https://www.youtube.com/watch?v=eqwtoaP-0pk) and [Master Animation With Svelte](https://www.youtube.com/watch?v=3RlBfUQCiAQ) by Joy of Code
- [Svelte Kit Form Actions 101 - New Svelte Kit API](https://www.youtube.com/watch?v=i5zdnv83mxY) and [Svelte Kit Form Actions - Real World Examples - Q&A](https://www.youtube.com/watch?v=PK2Mpt1q6K8) by LevelUpTuts

_To Read_
- [What's new in `svelte-kit, 1.0.0-next.445`: (group) layout](https://dev.to/parables/whats-new-in-svelte-kit-100-next445-group-layout-1ld5) by Parables
- [Handling breaking changes in SvelteKit pre-1.0](https://maier.tech/posts/handling-breaking-changes-in-sveltekit-pre-1-0) by Thilo Maier
- [Svelte Custom Stores Demystified](https://raqueebuddinaziz.com/blog/svelte-custom-stores-demystified/) by Raqueebuddin Aziz
- Sveltekit Changes: [Advanced Layouts](https://dev.to/theether0/sveltekit-changes-advanced-layouts-3id4), [Form Actions and Progressive Enhancement](https://dev.to/theether0/sveltekit-changes-form-actions-and-progressive-enhancement-31h9) and [Cookies and Authentication](https://dev.to/theether0/sveltekit-changes-session-and-cookies-enb) by Shivam Meena
- [How to add an Emoji Picker to Sveltekit](https://xvrc.net/) by Xavier Coiffard
- [Get Started with SvelteKit Headless WordPress](https://plus.rodneylab.com/tutorials/get-started-sveltekit-headless-wordpress) by Rodney Lab
- [Speed up SvelteKit Pages With a Redis Cache](https://www.captaincodeman.com/speed-up-sveltekit-pages-with-a-redis-cache) and [How to await Firebase Auth with SvelteKit](https://www.captaincodeman.com/how-to-await-firebase-auth-with-sveltekit) by Captain Codeman
- [Deploying SvelteKit with NodeJS to a Server Using GitLab and PM2](https://abyteofcoding.com/blog/deploying-sveltekit-with-nodejs-pm2-to-server/) by A Byte of Coding
- [Quality of Life Tips when using SvelteKit in VS Code](https://www.reddit.com/r/sveltejs/comments/xltgyp/quality_of_life_tips_when_using_sveltekit_in_vs/) by doa-doa


**Libraries, Tools & Components**
- [Svelte Fit](https://github.com/leveluptuts/svelte-fit) is an extremely simple, no dependency fit text library
- [svelte-switch-case](https://github.com/l-portet/svelte-switch-case) is a switch case syntax for your Svelte components
- [svelte-canvas-confetti](https://github.com/andreasmcdermott/svelte-canvas-confetti) uses a single canvas to render full-screen confetti
- [@slidy/svelte](https://github.com/Valexr/Slidy/tree/master/packages/svelte) is a simple, configurable & reusable carousel component built with Svelte - based on `@slidy/core`
- [svelte-currency-input](https://github.com/canutin/svelte-currency-input) is a form input that converts numbers to localized currency formats as you type
- [Adria](https://github.com/pilcrowOnPaper/adria) is a super simple form validation library, with autocomplete and value/type checking
- [Canopy](https://github.com/oslabs-beta/canopy) is a Svelte debugging app for the Chrome devtools panel
- [MenuFramework](https://github.com/MyHwu9508/altv-os-menu-framework) is a menu framework written for [alt:V](https://altv.mp/#/)
- [whyframe](https://whyframe.dev/) gives iframes superpowers, making it easy to render anything in isolation
- [@svelte-put/modal](https://github.com/vnphanquang/svelte-put/tree/main/packages/misc/modal) is a solution to async, declarative, type-safe modals in Svelte
- [Kitty](https://github.com/grottopress/kitty) is a collection of libraries and handlers for developing secure frontend apps
- [svelte-turnstile](https://github.com/ghostdevv/svelte-turnstile) is a component for Cloudflare Turnstile, the privacy focused CAPTCHA replacement 

_UI Kits and Starters_
- [QWER](https://github.com/kwchang0831/svelte-QWER) is a blog starter built with SvelteKit
- [SvelteKit Zero API](https://github.com/Refzlund/sveltekit-zero-api) provides type-safety between the frontend and backend - creating a structure for easy APIs
- [sveltekit-monorepo](https://github.com/sw-yx/sveltekit-monorepo) is monorepo starter with 2022 tech
- [svelte-component-test-recipes](https://github.com/davipon/svelte-component-test-recipes) uses `vitest`, `@testing-library/svelte`, and `svelte-htm` to test Svelte components that seemed to be hard to test

Whew! That's a lot of updates. Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.com/invite/yy75DKs)!

See ya next month 👋
