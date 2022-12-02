---
title: "What's new in Svelte: December 2022"
description: "Rounding the corner to SvelteKit 1.0"
author: Daniel Sandoval
authorURL: https://desandoval.net
---

SvelteKit 1.0 is just around the corner! With [99% of the milestone issues completed](https://github.com/sveltejs/kit/milestone/2), there's a lot of new changes from the last month to cover...

Let's get to it!

## What's new in SvelteKit
- Use the `willUnload` property to find out if the navigation will result the app being unloaded (full page reload/closing/leaving to another page). ([#6813](https://github.com/sveltejs/kit/pull/6813))
- `__data.json` requests now allows for caching while ensuring we cache matching responses for all invalidation scenarios ([#7532](https://github.com/sveltejs/kit/pull/7532))
- Linking to `<a name="hash">` tags is now supported ([#7596](https://github.com/sveltejs/kit/pull/7596))
- Throwing redirects in the `handle` hook is now supported ([#7612](https://github.com/sveltejs/kit/pull/7612))
- A fallback component will now be added automatically for layouts without one ([#7619](https://github.com/sveltejs/kit/pull/7619))
- The new `preload` function within the `resolve` hook determines what files should be added to the <head> tag to preload it ([Docs](https://kit.svelte.dev/docs/hooks#server-hooks-handle), [#4963](https://github.com/sveltejs/kit/pull/4963), [#7704](https://github.com/sveltejs/kit/pull/7704))
- `version` is now available via `$app/environment` ([#7689](https://github.com/sveltejs/kit/pull/7689), [#7694](https://github.com/sveltejs/kit/pull/7694))
- `handleError` can now return a promise ([#7780](https://github.com/sveltejs/kit/pull/7780))


**Breaking changes:**
- `routeId` is now `route.id` ([#7450](https://github.com/sveltejs/kit/pull/7450))
- 'load' has been renamed to 'enter' and 'unload' to 'leave' in the `beforeNavigate` and `afterNavigate` methods. `beforeNavigate` is now called once with type 'unload' on external navigation and will no longer run during redirects ([#7502](https://github.com/sveltejs/kit/pull/7502), [#7529](https://github.com/sveltejs/kit/pull/7529), [#7588](https://github.com/sveltejs/kit/pull/7588))
- The `redirect` helper will now only allow status codes between 300-308 for redirects and only `error` status codes between 400-599 are allowed ([#7767](https://github.com/sveltejs/kit/pull/7767)) ([#7615](https://github.com/sveltejs/kit/pull/7615), [#7767](https://github.com/sveltejs/kit/pull/7767))
- Special characters will now be encoded with hex/unicode escape sequences in route directory names ([#7644](https://github.com/sveltejs/kit/pull/7644))
- devalue is now used to (de)serialize action data - this is only a breaking change for everyone who fetches the actions directly and doesn't go through `use:enhance` ([#7494](https://github.com/sveltejs/kit/pull/7494))
- `trailingSlash` is now a page option, rather than configuration ([#7719](https://github.com/sveltejs/kit/pull/7719))
- The client-side router now ignores links outside `%sveltekit.body%` ([#7766](https://github.com/sveltejs/kit/pull/7766))
- `prerendering` is now named `building`, and `config.kit.prerender.enabled` has been removed ([#7762](https://github.com/sveltejs/kit/pull/7762))
- `getStaticDirectory()` has been removed from the builder API ([#7809](https://github.com/sveltejs/kit/pull/7809))
- The `format` option has been removed from `generateManifest(...)` ([#7820](https://github.com/sveltejs/kit/pull/7820))
- `data-sveltekit-prefetch` has been replaced with `-preload-code` and `-preload-data`, `prefetch` is now `preloadData` and `prefetchRoutes` is now `preloadCode` ([#7776](https://github.com/sveltejs/kit/pull/7776), [#7776](https://github.com/sveltejs/kit/pull/7776))
- `SubmitFunction` has been moved from `$app/forms` into `@sveltejs/kit` ([#7003](https://github.com/sveltejs/kit/pull/7003))

## New in Svelte
- The css compiler options of `css: false` and `css: true` have been replaced with `'external' | 'injected' | 'none'` settings to speed up compilation for `ssr` builds and improve clarity (**3.53.0**)

For all the changes to the Svelte compiler, including unreleased changes, check out the [CHANGELOG](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md).

---

## Community Showcase

**Apps & Sites built with Svelte**
- [Appwrite's new console](https://github.com/appwrite/console) makes its secure backend server for web, mobile & Flutter developers avaiable in the browser
- [RepoMagic](https://www.repomagic.com/) is a search and analytics tool for GitHub
- [Podman Desktop](https://github.com/containers/podman-desktop) is a graphical tool for developing on containers and Kubernetes
- [Ballerine](https://github.com/ballerine-io/ballerine) is a Know Your Customer (KYC) UX for any vertical or geography using modular building blocks, components, and 3rd party integrations
- [Budget Pen](https://github.com/Nico-Mayer/budget_pen) is a Codepen-like browser code editor with Tailwind included
- [doTogether](https://github.com/SarcevicAntonio/doTogether) helps you keep track of stuff you have get done via a List of recurring Tasks
- [Webscraped College Results](https://www.redditcollegeresults.com/) is a collection of visualizations for data from r/collegeresults
- [Let's premortem](https://letspremortem.com/) helps avoid lengthy, frustrating post-mortems after a project fails
- [BLKMARKET.COM](https://beta.blkmarket.com/) is an illustration library for commercial and personal use
- [Sigil](https://sigilspace.com/) is a canvas for anything with spaces organized by the most-voted content
- [corpus-activity-streams](https://github.com/ryanatkn/corpus-activity-streams) is an unofficial ActivityStreams 2.0 vocabulary data set and alternative docs 
- [nodeMyAdmin](https://github.com/Andrea055/nodeMyAdmin) is an alternative to phpMyAdmin written with SvelteKit
- [Image to Pattern Conversion](https://www.thread-bare.com/convert) is a cross-stitch pattern conversion tool with [a list of pre-made patterns](https://www.thread-bare.com/store) to start with
- [Verbums](https://verbums.vdoc.dev/) is an English vocabulary trainer to improve language comprehension
- [SVGPS](https://svgps.app/) removes the burden of working with a cluster of SVG files by converting your icons into a single JSON file
- [This 3D retro-themed asteroid shooter](https://photon-alexwarnes.vercel.app/showcase/asteroids) was made with threlte


**Learning Resources**

_To Hear_
- [Catching up after Svelte Summit](https://www.svelteradio.com/episodes/catching-up) and [3D, WebGL and AI](https://www.svelteradio.com/episodes/3d-webgl-and-ai) by Svelte Radio

_To Watch_
- [Domenik Reitzner - The easy way, an introduction to Sveltekit](https://www.youtube.com/watch?v=t-LKRrNedps) from Svelte Society Vienna
- [Sirens: Form Actions](https://www.youtube.com/watch?v=2OISk5-EHek) - Kev joins the Sirens again to chat about Form actions in SvelteKit and create a new form for speaker submissions on SvelteSirens.dev
- [Introduction To 3D With Svelte (Threlte)](https://www.youtube.com/watch?v=89LYeHOncVk), [How To Use Global Styles In SvelteKit](https://www.youtube.com/watch?v=jHSwChkx3TQ) and [Progressive Form Enhancement With SvelteKit](https://www.youtube.com/watch?v=6pv70d7i-3Q) by Joy of Code

_To Read_
- [Building tic-tac-toe with Svelte](https://geoffrich.net/posts/tic-tac-toe/) by Geoff Rich
- [Speed up SvelteKit Pages With a Redis Cache](https://www.captaincodeman.com/speed-up-sveltekit-pages-with-a-redis-cache) by Captain Codeman
- [Understanding environment variables in SvelteKit](https://www.okupter.com/blog/environment-variables-in-sveltekit), [Form validation with SvelteKit and Zod](https://www.okupter.com/blog/sveltekit-form-validation-with-zod) and [Build a SvelteKit application with Docker](https://www.okupter.com/blog/build-a-sveltekit-application-with-docker) by Justin Ahinon
- [Why I failed to create the "Solid.js's store" for Svelte, and announcing svelte-store-tree v0.3.1](https://dev.to/igrep/why-i-failed-to-create-the-solidjss-store-for-svelte-and-announcing-svelte-store-tree-v031-1am2) by YAMAMOTO Yuji
- [Create an offline-first and installable PWA with SvelteKit and workbox-precaching](https://www.sarcevic.dev/offline-first-installable-pwa-sveltekit-workbox-precaching) by Antonio Sarcevic



**Libraries, Tools & Components**
- [Skeleton](https://www.skeleton.dev/) is a UI toolkit to build fast and reactive web interfaces using Svelte + Tailwind CSS
- [svelte-svg-spinners](https://github.com/luluvia/svelte-svg-spinners) is a collection of SVG Spinners components
- [Svelte Floating UI](https://github.com/fedorovvvv/svelte-floating-ui) enables floating UIs with actions - no wrapper components or component bindings required
- [at-html](https://github.com/micha-lmxt/at-html) lets you use `{@html }` tags with slots in Svelte apps
- [html-svelte-parser](https://github.com/PatrickG/html-svelte-parser) is a HTML to Svelte parser that works on both the server (Node.js) and the client (browser)
- [svelte-switcher](https://github.com/rohitpotato/svelte-switcher) is a fully customisable, touch-friendly, accessible and tiny toggle component
- [sveltkit-hook-html-minifier](https://www.npmjs.com/package/@svackages/sveltkit-hook-html-minifier) is a hook that wrapps `html-minifier`
- [sveltekit-hook-redirect](https://www.npmjs.com/package/@svackages/sveltekit-hook-redirect) is a hook that makes redirects easy
- [sveltekit-video-meet](https://github.com/harshmangalam/sveltekit-video-meet) is a video calling web app built with SvelteKit and SocketIO
- [svelte-colourpicker](https://www.npmjs.com/package/svelte-colourpicker) is a lightweight opinionated colour picker component for Svelte
- [Svelte-HeadlessUI](https://captaincodeman.github.io/svelte-headlessui/) is an unofficial implementation of Tailwind HeadlessUI for Svelte
- [svelte-lazyimage-cache](https://github.com/binsarjr/svelte-lazyimage-cache) is a Lazy Image component with IntersectionObserver and cache action
- [threlte v5.0](https://www.reddit.com/r/sveltejs/comments/ywit18/threlte_v50_is_here_a_completely_new_developer/) is a completely new developer experience that is faster, more powerful, and incredibly flexible


That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte)

See ya next near 🎆
