---
title: What's new in Svelte: May 2021
description: Working toward SvelteKit 1.0 and a showcase full of SvelteKit sites!
author: Daniel Sandoval
authorURL: https://desandoval.net
---

Last week, Svelte Summit blew us away with a mountain of content! [Check out the full recording](https://www.youtube.com/watch?v=fnr9XWvjJHw) or an audio-only (p)review [on Svelte Radio](https://www.svelteradio.com/episodes/svelte-summit-party-episode). Now let's get into this month's news...

## New features in the Svelte Compiler
- `:global()` is now supported as part of compound CSS selectors (**3.38.0**, [Example](https://svelte.dev/repl/54148fd2af484f2c84977c94e523c7c5?version=3.38.0))
- CSS custom properties can now be passed to components for use cases such as theming (**3.38.0**, [Docs coming soon](https://github.com/sveltejs/svelte/issues/6268))

## New in SvelteKit
- [kit.svelte.dev](https://kit.svelte.dev/) has a fresh new look and the [SvelteKit Demo Site](https://netlify.demo.svelte.dev/) got a fresh set of paint. Check it out by running `npm init svelte@next`
- You can now use `@sveltejs/adapter-static` to create a single-page app or SPA by specifying a fallback page ([PR](https://github.com/sveltejs/kit/pull/1181), [Docs](https://github.com/sveltejs/kit/tree/master/packages/adapter-static))
- Disable Server-side Rendering (SSR) app-wide or on a page-by-page basis ([PR](https://github.com/sveltejs/kit/pull/713), [Docs](https://kit.svelte.dev/docs#ssr-and-javascript-ssr))
- Error messages thrown during pre-rendering are now much more informative and readable ([PR](https://github.com/sveltejs/kit/pull/1062), [Docs](https://kit.svelte.dev/docs#layouts-error-pages))
- Layouts can now be reset to prevent pages from inheriting the root layout. This is useful if you have a specific layout for a page or i18n variation ([PR](https://github.com/sveltejs/kit/pull/1061), [Docs](https://kit.svelte.dev/docs#layouts-resets))
- `fetch` in SvelteKit code will now use the environment-provided implementation, whenever possible. If `fetch` is unavailable, it will be polyfilled by adapters ([PR](https://github.com/sveltejs/kit/pull/1066), [Docs](https://kit.svelte.dev/docs#loading-input-fetch))

## New in Svelte & Language Tools
- `svelte-preprocess` now supports the "extends" field of the tsconfig.json (4.7.2)
- HTML `style` attributes now have hover & auto-complete. Foreign namespaces and ESM configs are now supported in the Svelte language server & extensions
- The Svelte language tools can now infer slot/event types from their props if a generic relationship between them was defined

---

## Community Showcase

**Apps & Sites**

- [gitpod.io](https://github.com/gitpod-io/website) recently rewrote its site with SvelteKit
- [highlight eel](https://highlighteel.com/) is a web-based editor to mark your favorite parts of any YouTube video to clip and share with anyone
- [The Far Star Mission](https://thefarstar.apotheus.net/) is an interactive audiobook companion to the album, The Far Star by Apotheus
- [JavaScript quiz](https://github.com/nclskfm/javascript-quiz) is a small quiz application that saves your answers locally
- [ExtensionPay](https://extensionpay.com/) lets developers accept secure payments in browser extensions with no backend server code.
- [mk48.io](https://mk48.io/) is a naval warship game made with SvelteKit
- [Frog Safety](https://frog-safety.vercel.app/) is a guide for African Dwarf Frogs and the API freshwater master kit
- [Stardew Valley Character Preview](https://github.com/overscore-media/stardew-valley-character-preview) loads your character's attributes from your Stardew Valley savefile and lets you play around with different outfits, colours, and accessories.


**Demos, Libraries, Tools & Components**

- [svelte-parallax](https://github.com/kindoflew/svelte-parallax) is a spring-based parallax component for Svelte
- [@svelte-plugins/viewable](https://github.com/svelte-plugins/viewable) is a simple rule-based approach to tracking element viewability.
- [Sveltekit-JUI](https://github.com/Wolfr/sveltekit-jui) is a kit of UI components to be used in conjunction with Svelte and Svelte Kit.
- [EZGesture](https://github.com/mhmd-22/ezgesture#integrating-with-other-frameworks) makes it easy to add gestures functionality with simple native DOM events 

**Want to contribute your own component?** Submit a [Component](https://sveltesociety.dev/components) to the Svelte Society site by making [a PR to this file](https://github.com/svelte-society/sveltesociety.dev/blob/master/src/pages/components/components.json).


**Starters**
- [How to use Vercel Analytics with SvelteKit](https://ivoberger.com/posts/using-vercel-analytics-with-svelte-kit) teaches how to track Web Vitals across your users' devices
- [Asp.NETCore + Svelte + Vite](https://github.com/Kiho/aspcore-spa-cli/tree/master/samples/SviteSample) connects the three frameworks with SpaCliMiddleware (VS2019)
- [Add CoffeeScript to Svelte](https://github.com/Leftium/coffeescript-adder) is an experimental command to run to add CoffeeScript to your SvelteKit project or Vite-powered Svelte app
- [Adds Supabase to Svelte](https://github.com/joshnuss/svelte-supabase) is an experimental command to run to add Supabase to your SvelteKit project
- [svelte-babylon](https://github.com/SectorXUSA/svelte-babylon) lets you use BabylonJS like A-Frame through reactive Svelte Components

**Looking for a starter or integration?** Check out [svelte-adders](https://github.com/svelte-add/svelte-adders) and a number of other integration examples at [sveltejs/integrations](https://github.com/sveltejs/integrations)


**Learning Resources**
- [Amazing macOS Dock animation in Svelte](https://dev.to/puruvj/amazing-macos-dock-animation-in-svelte-5hfb) demonstrates how nice Svelte and popmotion look together
- [Solving the Tower of Hanoi with recursive Svelte templates](https://geoffrich.net/posts/svelte-tower-of-hanoi/) incorporates the `<svelte:self>` element into a common computer science problem
- [DIY SvelteKit CDK adapter](https://dev.to/juranki/diy-sveltekit-cdk-adapter-3enp) puts together SvelteKit and AWS CDK
- Fireship's [Svelte in 100 Seconds](https://www.youtube.com/watch?v=rv3Yq-B8qp4) is a quick and easy introduction to Svelte's core concepts
- [Tech Downtime](https://www.youtube.com/watch?v=tsePBA2JC7o&list=PLualcIC6WNK1LHIYx2Tg9AQfTQDv4zNPu) has been diving into SvelteKit in this playlist - from getting up and running to debugging.
- lihautan's latest video updates in the [Svelte 101](https://www.youtube.com/watch?v=rwYgOU0WmVk&list=PLoKaNN3BjQX3mxDEVG3oGJx2ByXnue_gR&index=59) and [Svelte Store](https://www.youtube.com/watch?v=p4GmT0trCPE&list=PLoKaNN3BjQX3fG-XOSwsPHtnV8FUY6lgK&index=19) playlists cover slots, stores and context - and when to use which
- [DavidParkerW](https://www.youtube.com/c/DavidParkerW/playlists) has been exploring Svelte, Sapper and SvelteKit in some real-world scenarios, like [displaying a blog post list from an API](https://www.youtube.com/watch?v=kAPVFgFnxaM&list=PLPqKsyEGhUna6cvm6d4vZNI6gbt_0S4Xx&index=15)



## See you next month!

Got something to add? Join us on [Svelte Society](https://sveltesociety.dev/), [Reddit](https://www.reddit.com/r/sveltejs/) and [Discord](https://discord.com/invite/yy75DKs)!
