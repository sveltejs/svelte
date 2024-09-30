---
title: "What's new in Svelte: October 2024"
description: 'Better each blocks and a callstack for infinite loops'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Thanks to the number of folks who have been trying the Svelte 5 release candidates, the maintainers have been hard at work in addressing bugs and implementing performance improvements for the upcoming release. This month, we'll cover the most notable changes along with the many apps, resources and libraries that the community has created over the last few weeks.

## What's new in Svelte

- Legacy components can now be manually instantiated asynchronously with the `sync` option (**5.0.0-next.237**, [#12970](https://github.com/sveltejs/svelte/pull/12970))
- The `each` block is now much better in SSR mode - removing an unnecessary declaration and caching the length of the array before iterating over it (**5.0.0-next.242**, [#13060](https://github.com/sveltejs/svelte/pull/13060))
- A callstack will now appear if an infinite loop is detected - with the last ten effects printed out - in development mode (5.0.0-next.246, [#13231](https://github.com/sveltejs/svelte/pull/13231))
- There are now a11y warnings for `<button>`/`<a>` elements that are missing an aria-label and content (**5.0.0-next.250**, [#13130](https://github.com/sveltejs/svelte/pull/13130))
- Animations now take into account `zoom` when calculating transforms (**5.0.0-next.254**, [#13317](https://github.com/sveltejs/svelte/pull/13317))
- `<svelte:self>` is now deprecated in runes mode. It's not necessary since components can now import themselves (**5.0.0-next.256**, [#13333](https://github.com/sveltejs/svelte/pull/13333))

Curious to see all that the maintainers have been up to in getting Svelte 5 production ready? Check out the [CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md) to see all the fixes - big and small!


## What's new in SvelteKit and Language Tools
- SvelteKit now suports typed arrays in `load` functions. It's "not something to over-use, since it uses base64 encoding which is 33% larger than the raw data, but useful when you need it"(**2.6.0**, [#12716](https://github.com/sveltejs/kit/pull/12716))
- Components typed through Svelte 5's `Component` interface get proper intellisense (**extensions-109.0.1**)


---

## Community Showcase

**Apps & Sites built with Svelte**

- [svelte0.dev](https://svelte0.dev/) lets you generate Svelte UIs using `shadcn/ui` via a text prompt
- [Mini Spreadsheet Component](https://www.reddit.com/r/sveltejs/comments/1fc2zy4/mini_spreadsheet_component_with_svelte_5/) is a great introduction to how reactivity works in Svelte
- [Poof](https://poofnote.com/) is a self-destructing notes app that includes features like an optional to do list, email alerts and deleting after a specific date
- [kunft](https://kunft.cloud/) is a cloud platform for deploying docker containers and apps directly from GitHub
- [quickprompt](https://quickprompt.app/) is a browser extension to make saving and retrieving ChatGPT prompts easy
- [Dither](https://github.com/fauntleroy/dither) is a lo-fi GIF chat app inspired by Return of the Obra Dinn and Meatspac.es
- [cobalt](https://github.com/imputnet/cobalt) helps you save anything from your favorite websites: video, audio, photos or gifs
- [YouTube Looper](https://chromewebstore.google.com/detail/youtube-looper/bidjeabmcpopfddfcnpniceojmkklcje) is a custom loops extension for Youtube videos
- [LeetLink](https://leetlnk.com/) is a linktree-a-like with customizable themes
- [WhatChord](https://whatchord.org/) is a chord finder for piano
- [AIUI](https://github.com/jxqu3/aiui) is a web UI for OAI-Compatible APIs

**Learning Resources**

_Featuring Svelte Contributors and Ambassadors_

- [Dockerizing Your SvelteKit Applications: A Practical Guide](https://khromov.se/dockerizing-your-sveltekit-applications-a-practical-guide/) by Stanislav Khromov
- [Is Local First the future of web development?](https://www.youtube.com/watch?v=GJ3tObziewU), [The hidden benefit of upgrading to Svelte 5 - smaller bundle sizes](https://www.youtube.com/watch?v=5Sm6Igq0PQM) and [SvelteKit Streaming Explained: When and How to Use It](https://www.youtube.com/watch?v=39sIJgr7B2Y) - Videos by Stanislav Khromov
- [Svelte 5 - everything about the new APIs](https://www.youtube.com/watch?v=OETs1LKhW0A) with Simon Holthausen at CITYJS CONFERENCE
- [Learn How To Use Svelte 5 Snippets](https://www.youtube.com/watch?v=OlWWIbRz438) by Joy of Code
- [Svelte London - September 2024](https://www.youtube.com/watch?v=BWh-jVB3Hk8) feat. maya with "The Joy of Side Projects ✨"


_This Week in Svelte_

  - [Ep. 74](https://www.youtube.com/watch?v=nMs4X8-L_yo) — Changelog, race and maybeStream, svelte:component obsolete
  - [Ep. 75](https://www.youtube.com/watch?v=bFodoz9Mlbw) — Changelog, $props, $state
  - [Ep. 76](https://www.youtube.com/watch?v=UeVKFYNXCrE) — Changelog, svelte-fsm, script module, trailing slash
  - [Ep. 77](https://www.youtube.com/watch?v=9hUAhxWwgyg) — Changelog, Context API, JSX and Single FIle Components
  - [Ep. 78](https://www.youtube.com/watch?v=wb53pDClQm0) — Changelog, Indeterminate checkbox, classes and actions


_Svienna 09/2024_

  - [How to embrace Zod in your SvelteKit](https://www.youtube.com/watch?v=j51whPgjhns) by Sasan Jaghori
  - [Dates an intersection of a romantic story and Dates in JS](https://www.youtube.com/watch?v=9HBVmUv7gpU) by Domenik Reitzner
  - [Svelte 5: Why the hell did you do that](https://www.youtube.com/watch?v=iMUEZWaSzG8) by Simon Holthausen

_To Read_

- [My thoughts on upgrading a ~15,000 LOC project to Svelte 5](https://www.reddit.com/r/sveltejs/comments/1frg58w/my_thoughts_on_upgrading_a_15000_loc_project_to/) by /u/practisingdeeplurk
- [How to Publish an Unbundled Svelte Package to npm](https://matthewdavis.io/how-to-publish-an-unbundled-svelte-package-to-npm/) by Matthew Davis
- [Migrating YouTube Looper to Svelte 5](https://medium.com/@wilkerlucio/migrating-youtube-looper-to-svelte-5-1a8b9b759582) by Wilker Lucio
- [Breaking out of Svelte's reactive statements](https://zellwk.com/blog/svelte-reactive-statements-breakout/) by Zell Liew
- [Data Visualizations using Svelte and D3](https://datavisualizationwithsvelte.com/) by DataVizSvelte


_To Watch_

- [Sveltekit Data Fetching in 2024 Explained](https://www.youtube.com/watch?v=j9Wf_nyKin4) by Ben Davis
- [DB or not DB?](https://www.youtube.com/watch?v=IFoqCz4ujls) and [Github issues as CMS?](https://www.youtube.com/watch?v=UML33lIcEOc) by With Svelte
- [Crash course on Sveltekit Superforms](https://www.youtube.com/watch?v=H_bT84X1hKc) and [Build a Full-stack Ecommerce Platform with Sveltekit, Vendure, Houdinigql, Shadcn-svelte](https://www.youtube.com/watch?v=kbL2gu6wVmM) by Lawal Adebola


**Libraries, Tools & Components**

- [Tzezar's Datagrid](https://tzezars-datagrid.vercel.app/) is an easy to use and easy to customize datagrid component
- [SparklePost](https://github.com/khromov/sparklepost) is a demo application that implements interface patterns commonly found in native iOS and Android apps, using modern and performant web development techniques
- [tipex](https://github.com/friendofsvelte/tipex) is a customizable rich text editor for SvelteKit; based on TipTap

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋
