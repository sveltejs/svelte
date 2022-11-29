---
title: "What's new in Svelte: December 2022"
description: "TBD"
author: Daniel Sandoval
authorURL: https://desandoval.net
---

TBD

## What's new in SvelteKit
- Use the `willUnload` property to find out if the navigation will result the app being unloaded (full page reload/closing/leaving to another page). ([#6813](https://github.com/sveltejs/kit/pull/6813))
- `__data.json` requests now use the Vary header, which allows one cached response for each variation of the x-sveltekit-invalidated header, ensuring we cache matching responses for all invalidation scenarios ([#7532](https://github.com/sveltejs/kit/pull/7532))
- Linking to `<a name="hash">` tags is now supported ([#7596](https://github.com/sveltejs/kit/pull/7596))
- Throwing redirects in a handled error is now supported ([#7612](https://github.com/sveltejs/kit/pull/7612))
- A fallback component will now be added automatically for layouts without one ([#7619](https://github.com/sveltejs/kit/pull/7619))
- Fonts are now preloaded automatically and preloading can be customized with the `resolve` hook ([Docs](https://kit.svelte.dev/docs/hooks#server-hooks-handle), [#4963](https://github.com/sveltejs/kit/pull/4963))
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
- [AttendZen](https://www.attendzen.io/) is an event management and marketing platform for in-person, virtual or hybrid events
- [Gram Jam](https://gramjam.app/) is a challenging daily word game using SvelteKit
- [Collabwriting](https://collabwriting.com/) is an actionable knowledge base for your team
- [Dazzle](https://dazzlega.me/) is a Puzzle Game made with Svelte & DallE
- [Figma Autoname plugin](https://github.com/Hugo-Dz/figma_autoname_client_app) automatically names your Figma layers in one click
- [DECK](https://github.com/sfx101/deck) is powerful and high performant local web development studio for MacOS, Ubuntu and Windows
- [Asm editor](https://github.com/Specy/asm-editor) is a webapp to write and run m68k assembly code
- [Nucleus](https://github.com/mellobacon/Nucleus) is a text editor featuring a clean and easy to use user interface inspired by Visual Studio Code, Atom, Fleet, and others
- [Observer](https://github.com/diamonc/observer) is a frontend for Arth Panel, an open-source & self-hosted minecraft server panel
- [.PLAN](https://plan.lodzero.com/) is a cloud-based notetaking app with markdown and section support
- [Stablecog](https://github.com/yekta/stablecog) is a simple, free & open source AI image generator
- [FreeSpeech AAC](https://github.com/merkie/freespeech) is a free and open-source assistive communication app written in TypeScript
- [sqrdoff](https://sqrdoff.cubieverse.co/) is a dots and boxes to enjoy playing with friends
- [itty](https://launch.itty-sh.pages.dev/) is a fresh take on the traditional link-shortener
- [splits](https://splits.best/) lets you track your splits, calculate your race pace, become a better athlete
- [Weaver](https://jrende.xyz/weaver/) is an application for creating [weave drafts](https://www.gistyarn.com/blogs/how-to-weave/how-to-read-a-weaving-draft)


**Learning Resources**

_To Watch_
- [Starting With Svelte - Brittney Postma](https://www.youtube.com/watch?v=pdKJzrPA0DY) by fitcevents
- [Learn Svelte from scratch with Geoff Rich: A Svelte tutorial](https://www.youtube.com/watch?v=QoR0AZ-Rov8) by Kelvin Omereshone
- [How To Connect to MongoDB in Svelte Kit](https://www.youtube.com/watch?v=gwktlvFHLMA) by LevelUpTuts
- [SvelteKit Authentication Using Cookies](https://www.youtube.com/watch?v=E3VG-dLCRUk), [Make A Typing Game With Svelte](https://www.youtube.com/watch?v=kMz_Ba_OF2w) and [SvelteKit Tailwind CSS Setup With Automatic Class Sorting](https://www.youtube.com/watch?v=J_G_xP0chog) by Joy of Code
- [Authentication with SvelteKit & PocketBase](https://www.youtube.com/watch?v=doDKaKDvB30) and [Form Actions in SvelteKit (+page)](https://www.youtube.com/watch?v=52nXUwQWeKI) by Huntabyte
- [Sybil - Episode 1 - Rust knowledge management with SurrealDB](https://www.youtube.com/watch?v=eC7IePI5rIk) by Raphael Darley

_To Read_
- [4 things I miss from Svelte after working in React](https://geoffrich.net/posts/4-things-i-miss-svelte/) and [Create dynamic social card images with Svelte components](https://geoffrich.net/posts/svelte-social-image/) by Geoff Rich
- [First-class Vite support in Storybook 7.0](https://storybook.js.org/blog/first-class-vite-support-in-storybook/) (Svelte and SvelteKit included) by Ian VanSchooten
- [Better Svelte support is coming to WebStorm](https://blog.jetbrains.com/webstorm/2022/09/webstorm-2022-3-eap1/#information_regarding_svelte_support) from JetBrains
- [Dark Mode](https://pyronaur.com/dark-mode/) Toggle by pyronaur
- [HeadlessUI Components with Svelte](https://www.captaincodeman.com/headlessui-components-with-svelte) by Captain Codeman
- [Using Sequelize with SvelteKit](https://cherrific.io/0xedB00816FB204b4CD9bCb45FF2EF693E99723484/story/23) by MetaZebre
- [Implementing Maintenance mode on a SvelteKit site](https://blog.encodeart.dev/implementing-maintenance-mode-on-a-sveltekit-site) by Andreas Söderlund
- [ActionStore: Real-time Svelte stores for Rails](https://dev.to/buhrmi/actionstore-real-time-svelte-stores-for-rails-4jhg) by Stefan Buhrmester
- [Svelte CSS Image Slider: with Bouncy Overscroll](https://rodneylab.com/svelte-css-image-slider/) and [SvelteKit Local Edge Functions: Edge on Localhost](https://rodneylab.com/sveltekit-local-edge-functions/) by Rodney Lab
- [Creating a Svelte Tabs component with Slot props](https://blog.openreplay.com/creating-a-svelte-tabs-component-with-slot-props/) by Shinichi Okada
- [Sky Cart: An Open Source, cloud-agnostic shopping cart using Stripe Checkout](https://dev.to/stripe/sky-cart-an-open-source-cloud-agnostic-shopping-cart-using-stripe-checkout-o5k) by Mike Bifulco for Stripe



**Libraries, Tools & Components**
- [Threlte](https://threlte.xyz/) is a component library for Svelte to build and render three.js scenes declaratively and state-driven in Svelte apps. It's being featured again to highlight the new "Playground" button in its examples
- [Svelte Turnstile](https://github.com/ghostdevv/svelte-turnstile) is a library to integrate Cloudflare's Turnstile (a new CAPTCHA alternative) into a Svelte app
- [ActionStore](https://github.com/buhrmi/actionstore) allows you to push data directly into Svelte stores via ActionCable
- [SvelteKit + `<is-land>`](https://sveltekit-is-land.vercel.app/) is an experiment with partial hydration in SvelteKit using `@11ty/is-land`
- [Svelte Color Select](https://github.com/CaptainCodeman/svelte-color-select) is an Okhsv Color Selection component for Svelte using OKLab perceptual colorspace
- [svelte-awesome-color-picker](https://github.com/Ennoriel/svelte-awesome-color-picker) is a highly customizable color picker component library
- [rx-svelte-forms](https://www.npmjs.com/package/rx-svelte-forms) creates reactive Svelte forms inspired by Angular reactive forms
- [svelte-wc-bind](https://www.npmjs.com/package/svelte-wc-bind) enables two way data binding in Svelte web components
- [svelte-preprocess-style-child-component](https://github.com/valterkraemer/svelte-preprocess-style-child-component) allows you to style elements inside a child component using similar syntax as CSS Shadow Parts
- [unplugin-svelte-components](https://www.npmjs.com/package/unplugin-svelte-components) allows for on-demand components auto importing for Svelte
- [sveltekit-search-params](https://github.com/paoloricciuti/sveltekit-search-params) aims to be the fastest way to read AND WRITE from query search params in SvelteKit
- [svelte-crop-window](https://github.com/sabine/svelte-crop-window) is a crop window component for images and videos that supports touch gestures (pinch zoom, rotate, pan), as well as mousewheel zoom, mouse-dragging the image, and rotating on right mouse button
- [Open Graph Image Generation](https://github.com/etherCorps/sveltekit-og) lets you generate open graph images dynamically from HTML/CSS without a browser in SvelteKit
- [Svelte Tap Hold](https://github.com/binsarjr/svelte-taphold) is a minimalistic tap and hold component for Svelte/SvelteKit
- [svelte-copy](https://github.com/ghostdevv/svelte-copy)'s new version lets you customize the events that cause text to be copied to the clipboard

_UI Kits, Integrations and Starters_
- [SvelteKit Statiko](https://github.com/ivodolenc/sveltekit-statiko) is a multi-featured assistant for SvelteKit static projects
- [Svelte-TailwindCSS UI (STWUI)](https://github.com/N00nDay/stwui) is a Tailwind-based UI that is currently in pre-release beta
- [KitBase](https://github.com/kevmodrome/kitbase) is a starter template for SvelteKit and PocketBase
- [UnoCSS Vite Plugin (svelte-scoped)](https://github.com/unocss/unocss/tree/main/examples/sveltekit-scoped) is a scoped-CSS utility for Vite/SvelteKit
- [SvelteKit Auth App](https://github.com/fabiorodriguesroque/sveltekit_auth_app) is an example of how we can create an authentication system with SvelteKit using JsonWebToken and Prisma
- [SvelteKit Supabase Dashboard](https://github.com/xulioc/sveltekit-supabase-dashboard) is a simple dashboard inspired by Supabase UI made with SvelteKit as frontend and Supabase as backend
- [Supakit](https://github.com/j4w8n/supakit) is a Supabase auth helper for SvelteKit
- [@bun-community/sveltekit-adapter-bun](https://www.npmjs.com/package/@bun-community/sveltekit-adapter-bun) is an adapter for SvelteKit apps that generates a standalone Bun server
- [hooks-as-store](https://github.com/micha-lmxt/hooks-as-store) lets you use React custom hooks in Svelte Apps

_Fun ones_
- [svelte-typewriter-store](https://github.com/paoloricciuti/svelte-typewriter-store) is the simplest way to get a rotating typewriter effect in Svelte
- [Aksel](https://www.npmjs.com/package/aksel) is the seagull you needed on your site
- [Svelte-Dodge](https://github.com/WbaN314/svelte-dodge) makes components dodge the pointer

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte)

See ya next month 👋
