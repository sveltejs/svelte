---
title: "What's new in Svelte: June 2023"
description: 'SvelteHack winners, lots of new bindings, Svelte 4.0.0-next.0, and a bunch of new features in SvelteKit'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Welcome to June everyone and [congrats to our SvelteHack winners](https://hack.sveltesociety.dev/winners), across all the categories! If you missed it, these winners were announced at Svelte Summit on May 6th 🎉

The entire playlist of the summit, including all the talks broken up in to separate videos, can be found [on the Svelte Society YouTube channel](https://www.youtube.com/playlist?list=PL8bMgX1kyZTiODueVnrK5GR42u3hgN13X). So check it out, if you haven't already.

Lots to cover in this month's newsletter, including a lot of improvements to both Svelte and Kit...

## What's new in Svelte

[Svelte 4.0.0-next.0](https://github.com/sveltejs/svelte/releases), the first pre-release version of Svelte 4.0 is out! An explanation of the changes, improvements and goals of this release can be found in [the Releases page on GitHub](https://github.com/sveltejs/svelte/releases/tag/svelte%404.0.0-next.0). Check it out to get an early sneak peek of the future of Svelte. It also includes a migration guide, for those interested in the minimal amount of breaking changes and deprecations.

Svelte 3.59.0 is also out, with a ton of new features:

- Restructuring arrays with the spread operator (`...`) is now handled correctly (**3.59.0**, [#8552](https://github.com/sveltejs/svelte/issues/8552), [#8554](https://github.com/sveltejs/svelte/issues/8554))
- The new `a11y-autocomplete-valid` warning will now warn if the autocomplete attribute isn't used according to the HTML specification (**3.59.0**, [Examples](https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/d32a27fb64f4127d31e4e76bd08e319cfaf0ba53/docs/rules/autocomplete-valid.md), [#8520](https://github.com/sveltejs/svelte/pull/8520))
- `fullscreenElement` and `visibilityState` bindings are now available for the `<svelte:document>` element (**3.59.0**, [#8507](https://github.com/sveltejs/svelte/pull/8507))
- The `devicePixelRatio` binding is now available for the `<svelte:window>` element (**3.59.0**, [#8285](https://github.com/sveltejs/svelte/issues/8285))
- The `ResizeObserver` bindings `contentRect`/`contentBoxSize`/`borderBoxSize`/`devicePixelContentBoxSize` are now usable with `bind:`(**3.59.0**, [#8022](https://github.com/sveltejs/svelte/pull/8022))

For all the changes to the Svelte compiler, including unreleased changes, check out the [CHANGELOG](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md).

## What's new in SvelteKit

- Route-level entry generators allow exporting an entries function from `+page`, `+page.server`, and `+server` files to supply possible values for params for prerendering (**1.16.0**, [Docs](https://kit.svelte.dev/docs/page-options#entries), [#9571](https://github.com/sveltejs/kit/pull/9571))
- URLs in `<meta>` tags are now crawled to make programmatic social-images much easier (**1.17.0**, [Docs](https://kit.svelte.dev/docs/seo#manual-setup-title-and-meta), [#9900](https://github.com/sveltejs/kit/pull/9900))
- `data` and `form` have been renamed to `formData` and `formElement` respectively in the `enhance` function. Using them through the old names will log a deprecation warning and they'll be removed in a future version. (**1.17.0**, [Docs](https://kit.svelte.dev/docs/form-actions#progressive-enhancement-use-enhance), [#9902](https://github.com/sveltejs/kit/pull/9902))
- Link options can now be set to `true` and `false` (**1.19.0**, [Docs](https://kit.svelte.dev/docs/link-options#disabling-options), [#10039](https://github.com/sveltejs/kit/pull/10039))
- The new `resolvePath` export can be used to build relative paths from route IDs and parameters (**1.19.0**, [Docs](https://kit.svelte.dev/docs/modules#sveltejs-kit-resolvepath), [#9949](https://github.com/sveltejs/kit/pull/9949))

---

## Community Showcase

**Apps & Sites built with Svelte**

- [a-maze](https://github.com/nedredmond/a-maze) is a simple maze generator (using DFS) with any dimensions between 5 cells and 75 cells
- [Windows 11 in Svelte](https://github.com/yashash-pugalia/win11-svelte) attempts to replicate the Windows 11 desktop experience on web
- [JsonCrunch](https://github.com/aghorui/jsoncrunch) is a JSON viewing, transformation and querying tool meant for quickly manipulating small to medium size pieces of JSON data
- [Typepost](https://dezain.io/typepost/) is a simple text post generator for social media
- [tall.ly](https://tall.ly/) is a website for sharing bookmarks ([example](https://tall.ly/zx/icons))
- [bbchallenge](https://github.com/bbchallenge/bbchallenge) is a collaborative environment to prove or disprove the Busy Beaver conjecture
- [Reddit Map](https://github.com/iDPI-Umass/reddit-map) is a project of computer, data, and social scientists to explore and visualize Reddit
- [WeWatch](https://github.com/orosmatthew/wewatch) allows watching videos together in sync
- [Wonderplan](https://wonderplan.ai/) is an AI-Powered Trip Planner tailored to your preferences and covering all aspects of your trip
- [CodingView.io](https://codingview.io/) is an online coding interview tool
- [MeatGPT](https://meat-gpt.sonnet.io/) is an art-site that promptly ignores your prompt
- [Vim Ninja](https://www.vimninja.com/) is an interactive Vim course in the browser
- [prcl](https://prcl.dev/) is a Pastebin-alternative focused on speed and simplicity
- [md](https://github.com/rossrobino/md) is a web based markdown editor

**Learning Resources**

_Featuring Svelte Contributors and Ambassadors_

- This Week in Svelte:
  - [2023 April 28](https://www.youtube.com/watch?v=LlONGghw_MA) - SK 1.15.9, colour contrast, SK reusable types, path aliases
  - [2023 May 5](https://www.youtube.com/watch?v=jo9osUzHnHY) - SvelteKit 1.16.0, reactive statement lifecycle, custom stores
  - [2023 May 12](https://www.youtube.com/watch?v=MBSYHW50xb8) - Svelte 4.0 preview, SvelteKit 1.16.3, Svelte 3.59.1
  - [2023 May 19](https://www.youtube.com/watch?v=CnvU6K12iK4) - SvelteKit 1.18.0, accessible HTML tables, CSS nesting
  - [2023 May 26](https://www.youtube.com/watch?v=oqroEq1DoKI) - SvelteKit 1.19.0, choosing a UI library, breakpoint debugging
- Svelte Radio
  - [Svelte Summit Hypisode](https://www.svelteradio.com/episodes/svelte-summit-hypisode) (May 4, 2023)
  - [A primer on AI for developers with Swyx from Latent Space](https://www.svelteradio.com/episodes/a-primer-on-ai-for-developers-with-swyx-from-latent-space) (May 11, 2023 | [Video Version](https://www.youtube.com/watch?v=PzImLLdU5Wk))

_To Watch_

- [Build a Blazing Fast SvelteKit Markdown Blog](https://www.youtube.com/watch?v=RhScu3uqGd0), [Page Versus Standalone Endpoints In SvelteKit](https://www.youtube.com/watch?v=8OmsVZuuQMc) and [Learn How Data Flows In Your SvelteKit App](https://www.youtube.com/watch?v=ampDDmT3TU0) by Joy of Code
- [Build a ChatGPT Plugin with SvelteKit](https://www.youtube.com/watch?v=P4wZ9JIxwjs) by SuperMilkDaddy
- [Svelte makes Drag And Drop API easy!](https://www.youtube.com/watch?v=lTDKhj83tec) and [Simple native-like App in SvelteKit!](https://www.youtube.com/watch?v=Enl4OPQ2OAM) by Antonio Sarcevic
- [Let's Learn Svelte.js in 60 Minutes (fun speed run).](https://www.youtube.com/watch?v=0FCbd1XVYWo) by developedbyed

_To Read_

- [Bridging Vue 2 and Svelte](https://workadventu.re/blog/post/bridging-vue2-and-svelte) by Alexis Faizeau
- [Write Once, Run Anywhere](https://blog.robino.dev/posts/drizzle-svelte) by Ross Robino
- [Reflections on Migrating my SaaS To SvelteKit](http://sveltekitsaas.com/articles/migrate-saas-to-sveltekit/) by SvelteKitSaaS
- [Authentication system using rust (actix-web) and SvelteKit](https://dev.to/sirneij/full-stack-authentication-system-using-rust-actix-web-and-sveltekit-1cc6) by John Owolabi Idogun
- [SvelteKit Forms: Grammar Check App](https://rodneylab.com/sveltekit-forms/), [SvelteKit Ably: Sqvuably Real‑Time Game](https://rodneylab.com/sveltekit-ably/) and [Svelte Login Form Example: Best Practices](https://rodneylab.com/svelte-login-form-example/) by Rodney Lab
- [The Correct Way to Use Stores in SvelteKit](https://dev.to/jdgamble555/the-correct-way-to-use-stores-in-sveltekit-3h6i) and [Rich Harris is NOT Getting Rid of TS Support in Svelte](https://dev.to/jdgamble555/rich-harris-is-not-getting-rid-of-ts-support-in-svelte-pp6) by Jonathan Gamble
- [How to add a basic SEO component to SvelteKit](https://maier.tech/posts/how-to-add-a-basic-seo-component-to-sveltekit) by Thilo Maier
- [SvelteKit Contact Form Example with Airtable](https://scottspence.com/posts/sveltekit-contact-form-example-with-airtable) by Scott Spence
- [Performant Reactivity with Svelte-Kit](https://itnext.io/performant-reactivity-with-svelte-kit-47d11769c5f) by Erxk
- [Svelte stores: the curious parts](https://blog.thoughtspile.tech/2023/04/22/svelte-stores/) by Valdimir Klepov

**Libraries, Tools & Components**

- [svelte-svg-transform](https://github.com/bartektelec/svelte-svg-transform) is a tiny library that makes it easier for you to add SVGs and transform them in your Svelte project
- [sirens](https://github.com/spiegelgraphics/sirens) is a visualization of active air raid sirens in Ukraine by DER SPIEGEL
- [Sveltronics](https://github.com/vasucp1207/sveltronics) is a collection of Svelte utility functions for your project
- [Prompta](https://github.com/iansinnott/prompta) is yet another interface for chatting with ChatGPT (or GPT-4)
- [Colibri](https://github.com/thetinkerinc/colibri) is a lightweight, customizable component library for Svelte apps
- [Svelte Smart Doc](https://www.sveltron.com/) is a natural language interface to search the Svelte Svelte documentation
- [Tailwind Elements](https://tailwind-elements.com/docs/standard/integrations/svelte-integration/) now has a Svelte Integration

Thanks for reading! As always, feel free to let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋
