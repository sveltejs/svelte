---
title: "What's new in Svelte: November 2021"
description: Over 5000 stars to light up the showcase
author: Daniel Sandoval
authorURL: https://desandoval.net
---

With SvelteKit crossing the [80% complete mark](https://github.com/sveltejs/kit/milestone/2), over [5000 stars](https://github.com/sveltejs/kit) on GitHub, and now having more usage than Sapper, there's never been a better time to try it out! Many in the community have, making for quite a large showcase this month...

Also, don't miss out on [Svelte Summit](https://sveltesummit.com/) on November 20th - featuring speakers from around the world. Keep an eye out for a watch party in your area 👀

Now onto what's new!

## New in Svelte and SvelteKit
- [svelte.dev](https://svelte.dev/) now runs on SvelteKit alongside [sveltesociety.dev](https://sveltesociety.dev). svelte.dev is a relatively complicated site with live code editing, authentication, and a markdown-based blog - making it a great way for us to really test out SvelteKit
- A new compiler option, `enableSourcemap`, provides more control over the compiler output for JS and CSS sourcemaps (**3.44.0**). With this new feature, SvelteKit and the Vite Svelte plugin can now properly handle environment variables in `.svelte` templates (See [sveltejs/kit#720](https://github.com/sveltejs/kit/issues/720) and [sveltejs/vite-plugin-svelte#201](https://github.com/sveltejs/vite-plugin-svelte/pull/201))
- The Svelte Language Tools now support reading the configuration of the VS Code CSS settings ([#1219](https://github.com/sveltejs/language-tools/issues/1219))
- `vite-plugin-svelte` added a new `experimental.prebundleSvelteLibraries` option that makes it much faster to load Svelte libraries with many components like icon libraries and UI frameworks. The option can be set in the root of `svelte.config.js`. Please test it out and give us feedback!
- SvelteKit will only route endpoints on the client, unless marked as `rel="external"` - reducing the size of the client JS and making it easier to refactor the router in the future ([2656](https://github.com/sveltejs/kit/pull/2656))
- SvelteKit no longer supports Node 12 ([2604](https://github.com/sveltejs/kit/pull/2604))
- SvelteKit was upgraded from Vite 2.6.0 to Vite 2.6.12 fixing an issue where Vite would corrupt the Svelte runtime (https://github.com/vitejs/vite/issues/4306). It also included two fixes from the SvelteKit team to avoid or make diagnosing Vite issues in SvelteKit templates easier (https://github.com/vitejs/vite/pull/5192 and https://github.com/vitejs/vite/pull/5193). Vite 2.7 is currently available in beta with additional fixes for SSR


To see all updates to Svelte and SvelteKit, check out the [Svelte](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md) and [SvelteKit changelog](https://github.com/sveltejs/kit/blob/master/packages/kit/CHANGELOG.md), respectively.


---

## Community Showcase

**Apps & Sites**
- [Tangent](http://tangentnotes.com/) is a clean and powerful notes app for Mac & Windows
- [The Pudding](https://pudding.cool/) is a digital publication that explains ideas debated in culture with visual essays - rebuilt in SvelteKit
- [Power Switcher](https://powerswitcher.axpo.com/) is an interactive overview of the development of the power supply in Switzerland, as energy sources migrate to cleaner sources
- [Sublive](https://sub.live/) is a new way of making music by connecting musicians all over the world with a low-latency and high-quality audio network
- [Vibify](https://www.vibify.me/) helps you find hidden playlists within your music using your Spotify listening history
- [Browse Marvel Unlimited by Year](https://marvel.geoffrich.net/) is a SvelteKit site to see what issues are available on Marvel Unlimited for a given year
- [Files](https://files.community/), a modern file explorer for Windows, has a new site rebuilt with SvelteKit
- [lil-hash](https://github.com/jackbow/lil-hash) is a simple URL shortener that produces easily rememberable and speakable shortened URLs
- [PWA Haven](https://github.com/ThaUnknown/pwa-haven) is a collection of small, fast, simple PWAs to replace native OS apps
- [DottoBit](https://dottobit.com/) is a multi-color 16-bit drawing program with URL sharing built-in
- [Former Fast Document for Print](https://github.com/zummon/former) is an invoice generator with beautiful designs, abilities for international languages and auto calculation
- [Helvetikon](https://github.com/noahsalvi/helvetikon) is a community maintained dictionary for the Swiss German language
- [Palitra App](https://palitra.app/) is a search-based color pallete generator

**Podcasts Featuring Svelte**
- [Svelte Radio](https://www.svelteradio.com/episodes/svelte-summit-is-coming-up-and-svelte-is-growing) dives into the tech behind the recently released Svelte Summit website and a bunch of other fun stuff!
- [PodRocket](https://podrocket.logrocket.com/rich-harris), LogRocket's podcast, talks Svelte with Rich Harris
- [PodRocket also dove deep](https://podrocket.logrocket.com/elderjs) into Elder.js with Nick Reese
- [Web Rush](https://webrush.io/episodes/episode-153-single-page-application-vs-multi-page-application-with-rich-harris) and Rich Harris talk about the differences between a SPA and MPA, what role the server rendering plays, what client side hydration is, and the state of modern tooling for developing an SPA or MPA
- [devtools.fm](https://devtools.fm/episode/15) talks with Rich Harris about developing engaging data visualizations and building the tools of tomorrow

**Educational Content**
- [Have Single-Page Apps Ruined the Web?](https://www.youtube.com/watch?v=860d8usGC0o) Rich Harris answers the controversial question at this year's Jamstack Conf
- [Svelte vs SvelteKit - What's The Difference?](https://www.youtube.com/watch?v=IKhtnhQKjxQ) LevelUpTuts provides a quick guide to explaining the relationship between the two projects. You can check out the rest of Scott Tolinski's guides to Svelte in his new series, ["Weekly Svelte"](https://www.youtube.com/playlist?list=PLLnpHn493BHF-Onm1MQgKC1psvW-rJuYi)
- [WebJeda's SvelteKit Hooks](https://www.youtube.com/watch?v=RarufLoEL08&list=PLm_Qt4aKpfKgzcTiMT2cgWGBDBIPK06DQ) series continues this month with Part 3 - Cookie Session Authentication
- [Writing Context Aware Styles in a Svelte App](https://www.ryanfiller.com/blog/tips/svelte-contex-aware-styles) is a guide to writing self-contained components that are able to dynamically adapt to their parents
- [A Beginner’s Guide to SvelteKit](https://www.sitepoint.com/a-beginners-guide-to-sveltekit/) takes a beginner-friendly look at both Svelte and SvelteKit and build out a simple web app showing profile pages of imaginary users
- [Svelte vs React: Ending the Debate](https://massivepixel.io/blog/svelte-vs-react/) is a historical take on the age-old argument
- [Svelte Snacks | Custom Events for Modal Actions](https://jeremydayslice.hashnode.dev/svelte-snacks-or-custom-events-for-modal-actions) walks through a solid implementation of Svelte's handy custom event system
- [What Svelte's accessibility warnings won't tell you](https://geoffrich.net/posts/svelte-a11y-limits/) explains how Svelte's a11y warnings work and why you shouldn't count on them to make your app accessible

**Libraries, Tools & Components**
- [svelte-adapter-azure-swa](https://github.com/geoffrich/svelte-adapter-azure-swa) is an adapter for Svelte apps that creates an Azure Static Web App, using an Azure function for dynamic server rendering
- [Inlang](https://docs.inlang.dev/getting-started/svelte-kit) is a localization and internationalization toolkit that now supports SvelteKit
- [svelte-translate-tools](https://github.com/noelmugnier/svelte-translate-tools) extract/generate/compile translation files for your Svelte App at build time
- [@egjs/svelte-infinitegrid](https://github.com/naver/egjs-infinitegrid/tree/master/packages/svelte-infinitegrid) lets you implement various grids composed of different card elements whose sizes vary
- [svelte-reactive-css-preprocess](https://github.com/srmullen/svelte-reactive-css-preprocess) makes it easier to update css variable values whenever your component state changes
- [Sveltegen](https://github.com/snuffyDev/sveltegen) is a CLI for simple and easy creation of actions, components, and routes
- [svelte-advanced-multistep-form](https://www.npmjs.com/package/svelte-advanced-multistep-form) helps to wrap form elements passing down styles to the component to be rendered, also it presents each form step in a ordered and stylish way
- [gQuery](https://github.com/leveluptuts/gQuery) is a GraphQL Fetcher & Cache for SvelteKit
- [date-picker-svelte](https://github.com/probablykasper/date-picker-svelte) is a date and time picker for Svelte
- [TwelveUI](https://twelveui.readme.io/reference/what-is-twelveui) is a Svelte component library with accessibility built-in
- [svelte-outclick](https://github.com/babakfp/svelte-outclick/) is a Svelte component that allows you to listen for clicks outside of an element, by providing you an outclick event
- [svelte-zero-api](https://github.com/ymzuiku/svelte-zero-api) lets you use SvelteKit APIs like client functions - with support for TypeScript
- [svelte-recaptcha-v2](https://github.com/basaran/svelte-recaptcha-v2) is a Google reCAPTCHA v2 implementation for Svelte SPA, SSR and sveltekit static sites.
- [Svelte Body](https://github.com/ghostdevv/svelte-body) lets you apply styles to the body in routes - designed to work with SvelteKit and Routify.
- [svelte-debug-console](https://github.com/basaran/svelte-debug-console) is a debug.js implementation for Svelte SPA, SSR and sveltekit static sites that lets you see your debug statements in the browser.
- [SVEO](https://github.com/didier/sveo) is a dependency-free approach to declare metadata on SvelteKit pages
- [@svelte-drama/suspense](https://www.npmjs.com/package/@svelte-drama/suspense) is a Svelte component that implements the core idea of React's `<Suspense>`. Also check out [SWR for Svelte](https://www.npmjs.com/package/@svelte-drama/swr) to make refetching even easier.
- [sveltekit-adapter-browser-extension](https://github.com/antony/sveltekit-adapter-browser-extension) is an adapter for SvelteKit which turns your app into a cross-platform browser extension

Check out the community site [sveltesociety.dev](https://sveltesociety.dev/templates/) for more tools, templates, adders and adapters from across the Svelte ecosystem.

Looking for more Svelte goodness? Join us on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.com/invite/yy75DKs)!
