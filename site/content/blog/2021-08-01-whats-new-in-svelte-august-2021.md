---
title: "What's new in Svelte: August 2021"
description: Shadow DOM, export and await - oh my!
author: Daniel Sandoval
authorURL: https://desandoval.net
---

From The Changelog ([JS Party Ep. 182](https://changelog.com/jsparty/182)) to Svelte Radio (Episodes [29](https://share.transistor.fm/s/adc23e84) and [30](https://share.transistor.fm/s/6316622d)), it seems that folks couldn't help but talk about Svelte, this month! Also, shadow DOM support and new export and await functionality are new in Svelte.

## New in Svelte

July was the most active month for the Svelte core repo since late 2019 as we really worked to reduce the number of outstanding PRs and saw the release of Svelte 3.39.0, 3.40.0, and 3.41.0. Tons of bug fixes were added as well as the following new features:

- The `|trusted` event modifier allows you to check if an event is trusted before it's called ([#6137](https://github.com/sveltejs/svelte/issues/6137))
- The new `svelte/ssr` package to support work on improving SvelteKit SSR ([#6416](https://github.com/sveltejs/svelte/pull/6416))
- A new `errorMode` compiler option to support improved preprocessing of TypeScript files ([#6194](https://github.com/sveltejs/svelte/pull/6194))
- You can now specify a `ShadowRoot` as the `target` when creating a component - making it possible to render Svelte components inside the shadow DOM ([#5869](https://github.com/sveltejs/svelte/issues/5869))
- The `export { ... } from` ([#2214](https://github.com/sveltejs/svelte/issues/2214)), `export let { ... } =` ([#5612](https://github.com/sveltejs/svelte/issues/5612)) and `{#await ... then/catch}` ([#6270](https://github.com/sveltejs/svelte/issues/6270)) syntaxes are all now supported in Svelte components

For a full list of features and bug fixes, check out the [Svelte changelog](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md).

## SvelteKit Updates
- `prerender.force` is now `prerender.onError` which lets you fine-tune which errors fail the build and which do not ([#2007](https://github.com/sveltejs/kit/pull/2007))
- esbuild's configuration is now exposed for use with SvelteKit adapters ([#1914](https://github.com/sveltejs/kit/pull/1914))
- Error messages are friendlier now for common config errors ([#1910](https://github.com/sveltejs/kit/pull/1910)) and compiler errors ([#1827](https://github.com/sveltejs/kit/pull/1827))
- Cookies will only be passed through if the target host is the same as the SvelteKit application or a more specific subdomain of it ([#1847](https://github.com/sveltejs/kit/pull/1847))
- index.js exports will now be changed to directory exports when packaging - making for nicer imports ([#1905](https://github.com/sveltejs/kit/pull/1905))
- Vite.js's `mode` is now exposed from `$app/env` ([#1789](https://github.com/sveltejs/kit/pull/1789))
- Better types across the board ([#1778](https://github.com/sveltejs/kit/pull/1778), [#1791](https://github.com/sveltejs/kit/pull/1791), [#1646](https://github.com/sveltejs/kit/pull/1646))

To see all updates to SvelteKit, check out the [SvelteKit changelog](https://github.com/sveltejs/kit/blob/master/packages/kit/CHANGELOG.md).

## Features & bug fixes from around svelte/*
- Language Tools now better support the "Workplace Trust" functionality (used in VS Code)
- In svelte2tsx, ambient type declarations are now renamed to avoid conflicting declarations in the future. Users are now expected to provide the ambient type definitions themselves - fixing JS output
- Sapper released v0.29.2 which fixes regex routes, status codes when requesting a directory, and exports when a user has not provided a `base` tag ([changelog](https://github.com/sveltejs/sapper/blob/master/CHANGELOG.md))

---

## Community Showcase

**Apps & Sites**
- [Parsnip](https://www.parsnip.ai/) is a mobile-first, progressive-web-app that helps you to learn to cook at home. Check out the [conversation on Reddit](https://www.reddit.com/r/sveltejs/comments/oearb9/learning_to_cook_at_home_with_parsnip_built/) for all the geeky details.
- [Central Bank Digital Currency (CBDC) tracker](https://www.atlanticcouncil.org/cbdctracker/) is a site that keeps track of how countries around the world are adopting digital currencies.
- [Svelte Commerce](https://github.com/itswadesh/svelte-commerce) is an advanced frontend platform for eCommerce based on Sveltekit.
- [neovimcraft](https://neovimcraft.com/) is a SvelteKit site dedicated to neovim plugins

**Looking for a Svelte project to work on? Interested in helping make Svelte's presence on the web better?** Check out [the list of open issues](https://github.com/svelte-society/sveltesociety-2021/issues) if you'd like to contribute to the Svelte Society rewrite in SvelteKit.

**Educational Content**
- [How I Built a Cross-Platform Desktop Application with Svelte, Redis, and Rust](https://css-tricks.com/how-i-built-a-cross-platform-desktop-application-with-svelte-redis-and-rust/) is a blog post by Luke Edwards, Svelte maintainer and Developer Advocate from Cloudflare.
- [How to Create a Blog with SvelteKit and Strapi](https://strapi.io/blog/how-to-create-a-blog-with-svelte-kit-strapi) is a step-by-step tutorial by Aarnav Pai from Strapi
- [Sveltekit Markdown Blog](https://www.youtube.com/watch?v=sKKgT0SEioI&list=PLm_Qt4aKpfKgonq1zwaCS6kOD-nbOKx7V) is a YouTube tutorial series by WebJeda.
- [Using Custom Elements in Svelte](https://css-tricks.com/using-custom-elements-in-svelte/) is a deep dive into custom elements by Geoff Rich.
- [learn / graphql / svelte](https://hasura.io/learn/graphql/svelte-apollo/introduction/) is a free 2-hour GraphQL course course from Hasura.
- [How to add Magic Link to a SvelteKit application](https://magic.link/posts/magic-svelte) is a guide to the popular password-less login pattern.

**Libraries, Tools & Components**
- [Svelte-Capacitor](https://github.com/drannex42/svelte-capacitor/) just released v2.0.0 - making it even easier to build hybrid mobile apps for iOS and Android using Svelte and Capacitor with near native performance.
- [svelte-remixicon](https://github.com/ABarnob/svelte-remixicon) is an icon library for Svelte based on Remix Icon, consisting of more than 2000 icons.
- [SveltePress](https://github.com/GeopJr/SveltePress) is a documentation tool built on top of SvelteKit.
- [Svelte Starter Kit](https://github.com/one-aalam/svelte-starter-kit/tree/auth-supabase) is a boilerplate to quickly get up and running with Svelte, with Auth and User Profiles powered by Supabase.
- [Kahi UI](https://github.com/novacbn/kahi-ui) is a Svelte-first UI kit with Dark Mode built-in.
- [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n) is an opinionated, fully type-safe, lightweight localization library for TypeScript and JavaScript projects with no external dependencies.

Check out the community site [sveltesociety.dev](https://sveltesociety.dev/templates/) for more templates, adders and adapters from across the Svelte ecosystem.


## See you next month!

Want more updates? Join us on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.com/invite/yy75DKs)!
