---
title: "What's new in Svelte: November 2022"
description: 'Better forms, routes and inline styles across SvelteKit and Svelte'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

It's been a busy October for the Svelte community. `use:enhance` and Advanced Routes got some great improvements in SvelteKit while the Svelte compiler released a minor version to improve the day-to-day dev experience.

There's also a _huge_ showcase to cover... so let's jump in!

## What's new in SvelteKit

- The new `update` method for `use:enhance` lets you easily get back the default form behavior while augmenting it with your own logic ([docs](https://kit.svelte.dev/docs/form-actions#progressive-enhancement-use-enhance), [#7083](https://github.com/sveltejs/kit/pull/7083) and [#7326](https://github.com/sveltejs/kit/pull/7326))
- `[[optional]]` parameters are now available for routing ([docs](https://kit.svelte.dev/docs/advanced-routing#optional-parameters), [#7051](https://github.com/sveltejs/kit/pull/7051))
- `goto` now has `invalidateAll` to (re-)run all `load` functions belonging to the new active page ([docs](https://kit.svelte.dev/docs/modules#$app-navigation-goto), [#7407](https://github.com/sveltejs/kit/pull/7407))
- `config.kit.paths.base` is now used in adapters looking for static assets - fixing 404 issues across `adapter-netlify`, `adapter-vercel`, `adapter-cloudflare`, and `adapter-cloudflare-workers` ([#4448](https://github.com/sveltejs/kit/pull/4448))

**Breaking changes:**

- Errors will now be thrown when routes conflict ([#7051](https://github.com/sveltejs/kit/pull/7051))
- The global `fetch` override has been removed when prerendering ([#7318](https://github.com/sveltejs/kit/pull/7318))
- Route IDs have been prefixed with `/` ([#7338](https://github.com/sveltejs/kit/pull/7338))

## Svelte changes

- New accessibility warnings, `a11y-click-events-have-key-events` and `a11y-no-noninteractive-tabindex`, will now warn when your components lack required key events or tabindex. While `a11y-role-has-required-aria-props` will no longer warn when elements match their semantic role (**3.51.0**)
- `--style-props` are now supported on `<svelte:component>` and `<svg>` (**3.51.0**, Component Example: [Before](https://svelte.dev/repl/48984f20503f4959b70f24f4130d164b?version=3.47.0) and [After](https://svelte.dev/repl/48984f20503f4959b70f24f4130d164b?version=3.51.0), SVG Example: [Before](https://svelte.dev/repl/b7a3f94255914044b35462234ccaea43?version=3.50.0) and [After](https://svelte.dev/repl/b7a3f94255914044b35462234ccaea43?version=3.51.0))
- "nullish" values for component event handlers are now supported (**3.51.0**, [Example](https://svelte.dev/repl/9228022922af4c76af68ce42349ccbf9?version=3.51.0))
- Scoped styles can now be applied to `<svelte:element>` (**3.51.0**, [Example](https://svelte.dev/repl/23d982fc6f4f4f06a6aa227860fa2d84?version=3.51.0))
- You can now use `important` in inline style tags: `style:foo|important` (**3.52.0**, [#7365](https://github.com/sveltejs/svelte/issues/7365))
- A warning will now be thrown when using `<a target="_blank">` without `rel="noreferrer"` (**3.52.0**, [#6188](https://github.com/sveltejs/svelte/issues/6188))

Tom Smykowski also released a great summary of [all the changes in 3.52.0](https://tomaszs2.medium.com/svelte-3-52-0-improves-dev-experience-45f8c460bb96)! For all the changes to the Svelte compiler, including upcoming changes, check out the [CHANGELOG](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md).

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
