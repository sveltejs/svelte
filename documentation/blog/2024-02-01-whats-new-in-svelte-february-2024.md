---
title: "What's new in Svelte: February 2024"
description: 'New in Kit: `reroute`, `emulate` and more!'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Since SvelteKit 2.0 released late last year, there's been a bunch of new features to make the Kit dev experience even better! Meanwhile the Svelte team has been hard at work making Svelte 5 a reality.

In case you missed it, Rich also posted [Tenets](https://github.com/sveltejs/svelte/discussions/10085#discussion-6029409), "an attempt to articulate the Svelte philosophy — our bedrock principles, that guide our design decisions."

So let's dive in to check out what's new and see what the rest of the community has been up to...

## What's new in SvelteKit

- The client router is now tree shakeable (**2.1.0**, [#11340](https://github.com/sveltejs/kit/pull/11340))
- `$env/static/public` is now exposed in service workers (**2.2.0**, [Docs](https://kit.svelte.dev/docs/modules#env-static-public), [#10994](https://github.com/sveltejs/kit/pull/10994))
- `style-src-elem` is now supported in environments with a Content Security Policy (**2.2.1**, [Docs](https://kit.svelte.dev/docs/types#private-types-cspdirectives), [#11562](https://github.com/sveltejs/kit/pull/11562))
- The new `reroute` hook allows you to change how URLs are translated into routes (**2.3.0**, [Docs](https://kit.svelte.dev/docs/hooks#universal-hooks-reroute), [#11537](https://github.com/sveltejs/kit/pull/11537))
- The `read` function is now available in the `$app/server` module - allowing you to read assets from the filesystem (**2.4.0**, [Docs](https://kit.svelte.dev/docs/modules#app-server-read), [#11649](https://github.com/sveltejs/kit/pull/11649))
- Adapters can now `emulate` the prod environment for dev and preview servers by implementing the corresponding functions. This is useful for providing access to e.g. KV namespaces in development (**2.5.0**, [Docs](https://kit.svelte.dev/docs/writing-adapters), [#11730](https://github.com/sveltejs/kit/pull/11730))


## What's new in Svelte

In case you missed it, [Svelte 5 is in preview](https://svelte-5-preview.vercel.app/docs/introduction). In the meantime, Svelte 4 (`@latest`) has had one bugfix release. There's just one new feature to highlight from the Svelte 5 changelog:

- Snippets can now take multiple arguments (**5.0.0-next.42**, [Docs](https://svelte-5-preview.vercel.app/docs/snippets), [#9988](https://github.com/sveltejs/svelte/pull/9988))

For all the bug fixes, chores and underlying work required to get Svelte 5 to release-ready, check out [the CHANGELOG on main](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md).


---

## Community Showcase

**Apps & Sites built with Svelte**

- [Sprite Fusion](https://www.spritefusion.com/) is a free level design tool to craft beautiful 2D tilemaps right in your browser using any tileset
- [TypeMeUp](https://github.com/bskdany/typemeup) a typing website that teaches you how to type faster
- [Pathfinding Algorithm Visualizer](https://github.com/baterson/pathfinding-visualizer) is an interactive pathfinding algorithm visualizer with player functionality
- [Roch Dog](https://rochdog.com/en) ranks businesses and hotels based on how dog-friendly they are
- [highlight.cool](https://highlight.cool/) is a free, customizable, and real-time highlighting tool for your blog
- [Nola Devs](https://www.noladevs.org/) is a vibrant and inclusive software developers group nestled in the heart of New Orleans. This site aggregates all their events across groups
- [Startup Funding Simulator](https://www.fundingsimulator.com/) is a tool to help founders understand how modern fundraising (with safes) works, and how much dilution you can expect when raising money.

**Learning Resources**

_Featuring Svelte Contributors and Ambassadors_
- [New SvelteKit feature: `import { read } from '$app/server'`](https://www.youtube.com/watch?v=m4G-6dyF1MU) by Rich Harris
- [Reading assets on the server in SvelteKit](https://geoffrich.net/posts/sveltekit-read/) by Geoff Rich
- [Tan Li Hau's new book](https://packt.link/Z4hXD), _Real-World Svelte_ is out now
- [Svelte Society San Diego - January 2024](https://www.youtube.com/watch?v=oH7XFAKh6W8): Attila covers the latest updates on Svelte 5 and also SvelteKit.
- [Svelte London - January 2024](https://www.youtube.com/watch?v=eswNQiq4T2w): featuring talks from both Rich Harris and pngwn
- [Svelte 5: Speed, Simplicity & Size](https://syntax.fm/show/723/svelte-5-speed-simplicity-and-size) by Syntax.FM
- This Week in Svelte:
  - [12 Jan 2024](https://www.youtube.com/watch?v=86NNiIG_ncU): A deep dive into the SvelteKit Changelog
  - [19 Jan 2024](https://www.youtube.com/watch?v=AWL_xCPT-5Q): Showcasing a new library from Paolo Ricciuti
  - [26 Jan 2024](https://www.youtube.com/watch?v=_SraKYKkQAc): Featuring "Cells" - a functional and reactive programming library

_To Read_

- [Customise font in TailwindCSS with SvelteKit](https://www.launchnow.pro/blog/customise-font-tailwindcss-sveltekit) by Launchnow
- [Svelte from the perspective of an Angular developer (for Svelte devs)](https://kylenazario.com/blog/svelte-from-angular-perspective-for-svelte) and [How to create a sitemap for your SvelteKit blog](https://kylenazario.com/blog/sveltekit-blog-sitemap) by Kyle Nazario
- [Get Up and Running with Svelte on the Internet Computer](https://blog.icacademy.at/blog/svelte-ic-starter) by Roland BOLE
- [SvelteKit + Socket.io server deployed on deno](https://devr.me/socket-io-deno) by Devr


**Libraries, Tools & Components**

- [Lucia](https://github.com/lucia-auth/lucia/discussions/1361) - an auth library written in TypeScript that abstracts away the complexity of handling sessions - has just released its 3.0 version
- [Paraglide JS Adapter SvelteKit](https://inlang.com/m/dxnzrydw/library-inlang-paraglideJsAdapterSvelteKit) is a SvelteKit integration for ParaglideJS - a tool for i18n routing


That's it for this month! Feel free to let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

See ya next month!
