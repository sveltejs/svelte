---
title: "What's new in Svelte: March 2024"
description: 'Nested CSS support and a much cleaner client-side API for Svelte 5'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

This month, the Svelte maintainers made a ton of progress on Svelte 5 and Rich Harris talked to Prismic about how the team is working on making the framework even better.

Lots to showcase too... so let's dive in!


## What's new in Svelte

As you may already have heard, [Svelte 5 is in preview](https://svelte-5-preview.vercel.app/docs/introduction). In the meantime, Svelte 4 (`@latest`) has had [one bugfix](https://github.com/sveltejs/svelte/blob/svelte-4/packages/svelte/CHANGELOG.md). The Svelte 5 changelog has quite a few updates, though:

- breaking: `$derived.call` is now `$derived.by` (**5.0.0-next.54**, [Docs](https://svelte-5-preview.vercel.app/docs/runes#$derived-by), [#10445](https://github.com/sveltejs/svelte/pull/10445))
- Destructuring derived object properties will now keep fine-grain reactivity (**5.0.0-next.55**, [Docs](https://svelte-5-preview.vercel.app/docs/runes#derived), [#10488](https://github.com/sveltejs/svelte/pull/10488))
- The new `hydrate` method makes hydration-related code treeshakeable (**5.0.0-next.56**, [Docs](https://svelte-5-preview.vercel.app/docs/functions#hydrate), [#10497](https://github.com/sveltejs/svelte/pull/10497))
- Nested CSS is now supported, along with better support for `:is(...)` and `:where(...)` (**5.0.0-next.57**, [#10490](https://github.com/sveltejs/svelte/pull/10490))
- breaking: The client-side API has been simplified by removing `createRoot`, adjusting the `mount`/`hydrate` APIs and introducing `unmount` (**5.0.0-next.58**, [Issue#9827](https://github.com/sveltejs/svelte/issues/9827), [#10516](https://github.com/sveltejs/svelte/pull/10497))

For all the bug fixes, chores and underlying work required to get Svelte 5 to release-ready, check out [the CHANGELOG on main](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md).


## What's new in SvelteKit

Mostly bug fixes, this month. Most notably is a fix to prevent stale values after navigation (**2.5.1**, [#11870](https://github.com/sveltejs/kit/pull/11870)).

Adapters can also now use an `emulate` function to provide dev and preview functionality (**2.5.0**, [Docs](https://kit.svelte.dev/docs/writing-adapters), [#11730](https://github.com/sveltejs/kit/pull/11730)). This will allow for an improved experience developing for Cloudflare in the near future ([11732](https://github.com/sveltejs/kit/pull/11732)).

For all the changes in SvelteKit, check out the [CHANGELOG](https://github.com/sveltejs/kit/blob/main/packages/kit/CHANGELOG.md).


---

## Community Showcase

**Apps & Sites built with Svelte**

- [Wishgram](https://www.wishgram.xyz/) is a tool to generate handwritten wishing cards
- [rfidify](https://github.com/jonathanjameswilliams26/rfidify) is a Raspberry PI RFID reader that plays things on Spotify
- [listn.fyi](https://listn.fyi/) is a fun and easy way to share what music you're currently into
- [Meowrite](https://www.meowrite.com/) is an AI writing tool for cover letters, essays and more
- [Photo Multitool](https://www.photomultitool.com/) is a free set of online tools for manipulating photos
- [sveltekit-weather-app](https://github.com/maxjerry0107/sveltekit-weather-app) is a gorgeous weather app made with SvelteKit

**Learning Resources**

_Featuring Svelte Contributors and Ambassadors_
- [How to make a great framework better? - Svelte 5 with Rich Harris](https://www.youtube.com/watch?v=z7n17ajJpCo) by Prismic
- [Svelte 5 is a beast, but is it worth switching?](https://www.youtube.com/watch?v=KB6zkvYJqoE&lc=UgxFIaNKUG5as18CSzp4AaABAg) by Syntax.FM
- This Week in Svelte:
  - 

_To Read/Watch_

- [Upgrading to Svelte 5](https://gitcontext.com/blog/svelte-5-upgrade) by Mike Stachowiak
- [Building with GPT4 and Svelte](https://kvak.io/meoweler) by Lev Miseri
- [Mini site for recommending songs using Svelte & Deno](https://blog.bryce.io/mini-site-for-recommending-songs-using-svelte-deno) by Bryce Dorn
- [Effortlessly Sync Your SvelteKit Frontend with Backend Using OpenAPI: A Step-by-Step Guide to Generating SDKs](https://www.launchnow.pro/blog/sveltekit-openapi-sdk-generation) by Launchnow
- [How to build an editable website in 15 minutes in 2024](https://www.svelteheadless.com/how-to-build-an-editable-website-in-15-minutes-in-2024) by Svelte Headless
- [Local-First LiveView Svelte ToDo App](https://liveview-svelte-pwa.fly.dev/) by Tony Dang


**Libraries, Tools & Components**

- [PaneForge](https://github.com/svecosystem/paneforge) provides components that make it easy to create resizable panes in your Svelte apps
- [Svelte UX](https://svelte-ux.techniq.dev/) and [LayerChart](https://www.layerchart.com/) now include theme support via semantic and state classes
- [Huly Platform](https://github.com/hcengineering/platform) is a robust framework designed to accelerate the development of business applications, such as CRM systems
- [svelte-marquee](https://github.com/selemondev/svelte-marquee) is a beautiful marquee component for Svelte
- [Just Ship](https://github.com/ocluf/justship) is a SvelteKit auth boilerplate for Svelte 5
- [cells](https://github.com/okcontract/cells) is a functional & reactive library for Svelte
- [Svelte Headless](https://github.com/webuildsociety/svelte-headless) is an example site showing how to create a simple blog site that plugs into a headless CMS
- [Sugar.css](https://sugar-css.com/) is a semantic, accessible, lightweight CSS framework
- [apple-svelte](https://github.com/Carza-104/apple-svelte) is a component library for Svelte based on Apple's Human Interface design language
- [SvelteKit SSE](https://github.com/tncrazvan/sveltekit-sse) provides an easy way to produce and consume server sent events.
- [Formsnap](https://github.com/huntabyte/formsnap), an accessible wrapper for sveltekit-superforms, got a major rewrite and has improved [its docs](https://formsnap.dev)


That's it for this month! Feel free to let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next month 👋
