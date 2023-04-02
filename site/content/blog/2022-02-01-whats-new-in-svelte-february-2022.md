---
title: "What's new in Svelte: February 2022"
description: 'Rapid-fire releases across Svelte, SvelteKit and the community'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Happy February, everyone! Over the last month or so, we've seen Svelte and SvelteKit [develop at rapid speed](accelerating-sveltes-development), new community rules across the [Reddit](https://www.reddit.com/r/sveltejs/comments/s9n8ou/new_rules/), [GitHub](https://github.com/sveltejs/community/blob/main/CODE_OF_CONDUCT.md) and [Discord](https://discord.com/channels/457912077277855764/831611707667382303/935264550436102315), and quite a few amazing apps, tutorials and libraries.

Let's take a look...

## Highlights from the Svelte changelog

- **3.45.0** brought a [new a11y warning `a11y-no-redundant-roles`](https://svelte.dev/docs#accessibility-warnings-a11y-no-redundant-roles), destructuring and caching fixes
- **3.46.0** added the much requested [`{@const}` tag](https://svelte.dev/docs#template-syntax-const) and [`style:` directive](https://svelte.dev/docs#template-syntax-element-directives-style-property)
- Check out **3.46.1 - 3.46.3** for fixes to the `{@const}` tag and `style:` directive, along with a number of fixes to animations
- [AST output is now available in the Svelte REPL](https://svelte.dev/repl/hello-world)

## What's new in SvelteKit

- `inlineStyleThreshold` allows you to specify where inline stylesheets are inserted into the page ([Docs](https://kit.svelte.dev/docs/configuration#inlinestylethreshold), [#2620](https://github.com/sveltejs/kit/pull/2620))
- `beforeNavigate`/`afterNavigate` lifecycle functions lets you add functionality before or after a page navigation ([Docs](https://kit.svelte.dev/docs/modules#$app-navigation), [#3293](https://github.com/sveltejs/kit/pull/3293))
- Platform context can now be passed from adapters ([Docs](https://kit.svelte.dev/docs/adapters#supported-environments-platform-specific-context), [#3429](https://github.com/sveltejs/kit/pull/3429))
- Hooks now have an `ssr` parameter in `resolve` to make it easier to skip SSR, when needed ([Docs](https://kit.svelte.dev/docs/hooks#handle), [#2804](https://github.com/sveltejs/kit/pull/2804))
- `$page.stuff` provides a mechanism for pages to pass data 'upward' to layouts ([Docs](https://kit.svelte.dev/docs/loading#input-stuff), [#3252](https://github.com/sveltejs/kit/pull/3252))
- Fallthrough routes let you specify where to route when an route can't be loaded ([Docs](https://kit.svelte.dev/docs/routing#advanced-routing-fallthrough-routes), [#3217](https://github.com/sveltejs/kit/pull/3217))

**New configs**

- Content Security Policy (CSP) is now supported for increased security when using inline javascript or stylesheets ([Docs](https://kit.svelte.dev/docs/configuration#csp), [#3499](https://github.com/sveltejs/kit/pull/3499))
- `kit.routes` config allows you to customise public/private modules during build ([Docs](https://kit.svelte.dev/docs/configuration#routes), [#3576](https://github.com/sveltejs/kit/pull/3576))
- `prerender.createIndexFiles` config lets you prerender index.html files as their subfolder's name ([Docs](https://kit.svelte.dev/docs/configuration#prerender), [#2632](https://github.com/sveltejs/kit/pull/2632))
- HTTP methods can now be overridden using `kit.methodOverride` ([Docs](https://kit.svelte.dev/docs/routing#endpoints-http-method-overrides), [#2989](https://github.com/sveltejs/kit/pull/2989))

**Config changes**

- `config.kit.hydrate` and `config.kit.router` are now nested under `config.kit.browser` ([Docs](https://kit.svelte.dev/docs/configuration#browser), [3578](https://github.com/sveltejs/kit/pull/3578))

**Breaking change**

- use `Request` and `Response` objects in endpoints and hooks ([#3384](https://github.com/sveltejs/kit/pull/3384))

---

## Community Showcase

**Apps & Sites**

- [timb(re)](https://paullj.github.io/timb) is a live music programming environment
- [Music for Programming](https://musicforprogramming.net/latest/) is a series of mixes intended for listening while `${task}` to focus the brain and inspire the mind
- [Team Tale](https://teamtale.app/) allows two authors to write the same story in a tag-team sort of fashion
- [Puzzlez](https://www.puzzlez.io/) is an online place to play Sudoku and Wordle
- [Closed Caption Creator](https://www.closedcaptioncreator.com/) makes it easy to add subtitles to your video on Windows, Mac and Google Chrome
- [SC3Lab](https://sc3-lab.netlify.app/) is a code generator for experimenting with svelte-cubed and three.js
- [Donkeytype](https://github.com/0ql/Donkeytype) is a minimalistic and lightweight typingtest inspired by Monkeytype.
- [Above](https://above.silas.pro/) is a visual routine timer built for the ADHD/autistic mind
- [base.report](https://base.report/) is a modern research platform for serious investors
- [String](https://string.kampsy.xyz/) turns your Phone into a secure portable audio recorder, making it easy to capture and share personal notes, family moments, classroom lectures, and more
- [The Raytracer Challenge REPL](https://github.com/jakobwesthoff/the_raytracer_challenge_repl) provides a live editor interface to configure a raytraced scene and render it live in any modern browser
- [awesome-svelte-kit](https://github.com/janosh/awesome-svelte-kit) is a list of awesome examples of SvelteKit in the wild
- [Map Projection Explorer](https://www.geo-projections.com/) lets you explore different map projections and explains their differences
- [Rubiks](https://github.com/MeharGaur/rubiks) is a Rubik's Cube simulator
- [Pianisto](https://pianisto.net/) is a working piano made with SVG, ToneJS and a lot of patience

Want to work on a SvelteKit site with others, [try contributing to the Svelte Society site](https://github.com/svelte-society/sveltesociety-2021/issues)!

**Learning and Listening**

_To Read_

- [Accelerating Svelte's Development](https://svelte.dev/blog/accelerating-sveltes-development) by Ben McCann
- [Storybook for Vite](https://storybook.js.org/blog/storybook-for-vite/)
- [Let's learn SvelteKit by building a static Markdown blog from scratch](https://joshcollinsworth.com/blog/build-static-sveltekit-markdown-blog) by Josh Collinsworth
- [Building an iOS app with Svelte, Capacitor and Firebase](https://harryherskowitz.com/2022/01/05/tapedrop-app.html) by Harry Herskowitz
- [Mutating Query Params in SvelteKit Without Page Reloads or Navigations](https://dev.to/mohamadharith/mutating-query-params-in-sveltekit-without-page-reloads-or-navigations-2i2b) and [Workaround for Bubbling Custom Events in Svelte](https://dev.to/mohamadharith/workaround-for-bubbling-custom-events-in-svelte-3khk) by Mohamad Harith
- [How to build a full stack serverless application with Svelte and GraphQL](https://dev.to/shadid12/how-to-build-a-full-stack-serverless-application-with-svelte-graphql-and-fauna-5427) by Shadid Haque
- [How to Deploy SvelteKit Apps to GitHub Pages](https://sveltesaas.com/articles/sveltekit-github-pages-guide/)
- [Creating a dApp with SvelteKit](https://anthonyriley.org/2021/12/31/creating-a-dapp-with-sveltekit/) by Anthony Riley
- [Comparing Svelte Reactivity Options](https://opendirective.net/2022/01/06/comparing-svelte-reactivity-options/) by Steve Lee

_To Watch_

- [Integrating Storybook with SvelteKit](https://www.youtube.com/watch?v=Kc1ULlfyUcw) and [Integrating FaunaDB with Svelte](https://www.youtube.com/watch?v=zaoLZc76uZM) by the Svelte Sirens
- [SvelteKit Crash Course Tutorial](https://www.youtube.com/watch?v=9OlLxkaeVvw&list=PL4cUxeGkcC9hpM9ARM59Ve3jqcb54dqiP) by The Net Ninja
- [Svelte for Beginners](https://www.youtube.com/watch?v=BrkrOjknC_E&list=PLA9WiRZ-IS_ylnMYxIFCsZN6xVVSvLuHk) by Joy of Code
- [SvelteKit For Beginners | Movie App Tutorial](https://www.youtube.com/watch?v=ydR_M0fw9Xc) by Dev Ed
- [SvelteKit $app/stores](https://www.youtube.com/watch?v=gBPhr1xbgaQ) by lihautan
- [Sveltekit - Get All Routes/Pages](https://www.youtube.com/watch?v=Y_NE2R3HuOU) by WebJeda

_To Listen To_

- [New Year, New Svelte!?](https://share.transistor.fm/s/36212cdc) from Svelte Radio
- [So much Sveltey goodness (featuring Rich Harris)](https://changelog.com/jsparty/205) from JS Party
- [The Other Side of Tech: A Documentarian Perspective (with Stefan Kingham)](https://codingcat.dev/podcast/2-4-the-other-side-of-tech-a-documentarian-perspective) from Purrfect.dev

**Libraries, Tools & Components**

- [threlte](https://github.com/grischaerbe/threlte) is a three.js component library for Svelte
- [svelte-formify](https://github.com/nodify-at/svelte-formify) is a library to manage and validate forms that uses decorators to define validations
- [gQuery](https://github.com/leveluptuts/gQuery) is a GraphQL Fetcher & Cache for Svelte Kit
- [Unlock-protocol](https://github.com/novum-insights/sveltekit-unlock-firebase) is an integration to help login with MetaMask, Firebase, and paywall customers
- [AgnosticUI](https://github.com/AgnosticUI/agnosticui) is a set of UI primitives that start their lives in clean HTML and CSS
- [Vitebook](https://github.com/vitebook/vitebook) is a fast and lightweight alternative to Storybook that's powered by Vite
- [SwyxKit](https://swyxkit.netlify.app/) is an opinionated blog starter for SvelteKit + Tailwind + Netlify. Refreshed for 2022!
- [svelte-themes](https://github.com/beynar/svelte-themes) is an abstraction for themes in your SvelteKit app
- [svelte-transition](https://www.npmjs.com/package/svelte-transition) is a Svelte component to make using CSS class based transitions easier - ideally suited for use with TailwindCSS
- [Svelte Inview](https://www.npmjs.com/package/svelte-inview) is a Svelte action that monitors an element enters or leaves the viewport/parent element
- [svelte-inline-compile](https://github.com/DockYard/svelte-inline-compile) is a babel transform that allows for a much more pleasant experience when testing svelte components using Jest and `@testing-library/svelte`
- [@feltcoop/svelte-mutable-store](https://github.com/feltcoop/svelte-mutable-store) is a Svelte store for mutable values with an `immutable` compiler option
- [headless-svelte-ui](https://www.npmjs.com/package/@bojalelabs/headless-svelte-ui) is a group of headless components that can be used in building Svelte Apps.

Did we miss something? Need help bringing your next idea to life in Svelte? Join us on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.com/invite/yy75DKs).

See ya next month!
