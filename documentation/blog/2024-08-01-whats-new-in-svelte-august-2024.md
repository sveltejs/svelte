---
title: "What's new in Svelte: August 2024"
description: 'Significant hydration improvements, customizable warnings, and a new API: `createRawSnippet`'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

The ramp up to the Svelte 5 release has led to a bunch of huge improvements to both performance and customizability. Also in this month's round-up: some minor SvelteKit updates and a return of the Svelte Dev Vlog.

Let's dive in!

## What's new in Svelte
Below, you'll find the highlights from the Svelte 5 release notes (currently in [Release Candidate](https://www.npmjs.com/package/svelte?activeTab=versions)):

- Breaking: The names of the `svelte/reactivity` helpers have been updated to include `Svelte` prefix (**5.0.0-next.169**, [Docs](https://svelte-5-preview.vercel.app/docs/imports#svelte-reactivity) [#12248](https://github.com/sveltejs/svelte/pull/12248))
- Branch effects now have better DOM boundaries - reducing bugs in `{#each}` blocks and during DOM manipulation (**5.0.0-next.171** and **5.0.0-next.182**, [#12215](https://github.com/sveltejs/svelte/pull/12215), [#12258](https://github.com/sveltejs/svelte/pull/12258), [#12383](https://github.com/sveltejs/svelte/pull/12383))
- Single-pass hydration has reduced DOM size and significantly improved hydration speed (**5.0.0-next.179**, [#12335](https://github.com/sveltejs/svelte/pull/12335), [#12339](https://github.com/sveltejs/svelte/pull/12339))
- Breaking: Transitions now play on mount by default (**5.0.0-next.177**, [#12351](https://github.com/sveltejs/svelte/pull/12351))
- CSS can now be included in the `<head>` when the `css: 'injected'` compiler option is enabled. This makes it trivial to include styles when rendering things like emails and OG cards, as well as massively simplifying toy setups where you can't be bothered to figure out how to get CSS from the compiler into your server-rendered HTML (**5.0.0-next.180**, [Docs](https://svelte-5-preview.vercel.app/docs/imports#svelte-server-render), [#12374](https://github.com/sveltejs/svelte/pull/12374))
- Svelte will now warn in dev on `{@html ...}` block hydration mismatch (**5.0.0-next.182**, [#12396](https://github.com/sveltejs/svelte/pull/12396))
- The new `warningFilter` compiler option lets you disable certain warnings for the whole application without having to add `svelte-ignore` comments everywhere (**5.0.0-next.186**, [#12296](https://github.com/sveltejs/svelte/pull/12296))
- The new `createRawSnippet` API, allows low-level creation of programmatic snippets outside of Svelte templates (**5.0.0-next.189**, [Docs](https://svelte-5-preview.vercel.app/docs/imports#svelte-createrawsnippet), [#12425](https://github.com/sveltejs/svelte/pull/12425))

## What's new in SvelteKit and beyond
- The HTML attributes `enctype` and `formenctype` are now respected for forms with `use:enhance` (plus, some other bug fixes in the [CHANGELOG](https://github.com/sveltejs/kit/blob/main/packages/kit/CHANGELOG.md))
- The cloudflare, cloudflare-workers, netlify and vercel adapters have all been updated to copy `.eot`, `.otf`, .`ttf`, `.woff`, and `.woff2` font files when bundling ([CHANGELOGs](https://github.com/sveltejs/kit/tree/main/packages))
- `svelte-preprocess`, the tool used in nearly every Svelte project, is now dependency free! The team has gradually reduced it from 44 dependencies in 5.0.0 down to zero in the latest release ([Tweet](https://x.com/BenjaminMcCann/status/1810698991820321028))
- prerendered redirects will now be appended to the `_redirects` file in the Cloudflare Pages adapter (**adapter-cloudflare@4.7.0**, [#12199](https://github.com/sveltejs/kit/pull/12199))

---

## Community Showcase

**Apps & Sites built with Svelte**

- [The StackOverflow 2024 Developer Survey](https://stackoverflow.blog/2024/07/24/developers-want-more-more-more-the-2024-results-from-stack-overflow-s-annual-developer-survey/) results site was built using Svelte. Even better, the results show that 73% of developers that used it want to keep working with Svelte (More info in this [tweet](https://x.com/SvelteSociety/status/1816497535839858792))
- [azigy](https://azigy.com/) is a live, multiplayer quiz and trivia application
- [on-device-transcription](https://github.com/Hugo-Dz/on-device-transcription) is a ready-to-use, minimal app that converts any speech into text
- [Whispering](https://github.com/braden-w/whispering) is an open-source transcription application that provides global speech-to-text functionality
- [Frogment](https://www.frogment.app/) is an OpenAPI specification editor
- [SticAI Glance](https://glance.sticai.com/) summarizes reddit post to actionable insights
- [Over Rice](https://www.overrice.nyc/) tracks the best halal carts around New York City
- [earbetter](https://github.com/ryanatkn/earbetter) is an ear trainer and tools for playing and programming music and audio
- [Moonglow](https://moonglow.app/) is a deep planetary simulation using GPGPU
- [opml-editor](https://github.com/imdj/opml-editor/) is an online OPML editor tailored for managing subscription lists more easily
- [Praxis](https://praxis.trade/) is an AI-powered trading journal that analyzes your trades and uncovers patterns
- [Lokal](https://lokal.so/) lets you share your localhost with Public and https .local Address
- [formcrafts](https://formcrafts.com/) lets you create incredible forms like application forms, lead generation forms, surveys, payment forms, and more 
- [Shootmail](https://shootmail.app/) is a template-first mail platform with scheduling and analytics
- [Supersaw](https://github.com/HelgeSverre/supersaw) is Open Source Web Based Digital Audio Workstation (DAW)


**Learning Resources**

_Featuring Svelte Contributors and Ambassadors_
- [Svelte Dev Vlog (with Rich) — June 2024](https://www.youtube.com/watch?v=4TGwlWFoGvM) on Svelte Society YouTube
- [Svelte London — July 2024](https://www.youtube.com/watch?v=gujnZDyLDwU)
- [Svelte Meets Vite: A Deep Dive with Matias Capeletto (patakdev)](https://www.svelteradio.com/episodes/svelte-meets-vite-a-deep-dive-with-matias-capeletto-patakdev) by Svelte Radio
- [Unleashing the Power of Claude Artifacts with Svelte and Sonnet 3.5](https://www.youtube.com/watch?v=Q7q77c5j7bQ) and [Perfect AI development setup for any programming language with Sonnet 3.5 and Claude Projects](https://www.youtube.com/watch?v=zNkw5K2W8AQ) by Stanislav Khromov
- [Local First from Scratch - How to make a web app with local data](https://www.youtube.com/watch?v=Qoqh9Mdmk80) by Syntax.
- This Week in Svelte:
  - [Ep. 67](https://www.youtube.com/watch?v=9yy1s7TAvXE) — Changelog, Popover API, starting-style, resetting file inputs
  - [Ep. 68](https://www.youtube.com/watch?v=G6Z0l2plyIk) — Changelog, EATView, Capacitor
  - [Ep. 69](https://www.youtube.com/watch?v=sVp0RukyfYk) — Changelog, socket activation, open source support
  - [Ep. 70](https://www.youtube.com/watch?v=Da-xOep6hcs) — Changelog, Taiwind CSS and Svelte Motion, when tu use $derived


_To Read_

- [From React To Svelte - Our Experience as a Dev Shop](https://www.reddit.com/r/sveltejs/comments/1e5522o/from_react_to_svelte_our_experience_as_a_dev_shop/) by gimp3695
- [Authentication in SvelteKit using SvelteKitAuth](https://blog.aakashgoplani.in/series/sveltekitauth-sveltekit) by Aakash Goplani
- [SvelteKit (Svelte 5) and Supabase](https://www.thespatula.io/svelte/sveltekit_supabase/) by the spatula
- [Firebase signInWithRedirect, localhost, and SvelteKit](https://captaincodeman.com/firebase-signinwithredirect-localhost-and-sveltekit), [Dealing with Dialogs in Svelte](https://www.captaincodeman.com/dealing-with-dialogs-in-svelte) and [Build a Docker Container from a pnpm monorepo](https://www.captaincodeman.com/build-a-docker-container-from-a-pnpm-monorepo) by Captain Codeman
- [Introducing Svelte 5](https://frontendmasters.com/blog/introducing-svelte-5/) by Frontend Masters


_To Watch_

- [Introduction to Sveltekit (#1) Parahack's Let learn Sveltekit](https://www.youtube.com/watch?v=c2QqPuG6mw0&t=683s), [image optimization in sveltekit](https://www.youtube.com/watch?v=pUlWbIqdkYE) and [Deploy your sveltekit app to cloudflare pages](https://www.youtube.com/watch?v=pGS_07zP-no) by Lawal Adebola
- [How Svelte runes syntax is better than plain JavaScript with signals](https://www.youtube.com/watch?v=IsJtmbvW2SI) by webdevladder


**Libraries, Tools & Components**

- [Sveaflet](https://sveaflet.vercel.app/) is an open-source Map component library
- [Svelte Magic UI](https://animation-svelte.vercel.app/) are componetns built using Tailwind CSS, Tweened, Spring and Svelte Motion
- [Figblocks](https://figblocks.mohanvadivel.com/) is an open-source UI component library for building Figma plugins with Svelte
- [VS Code Supports Custom Tab Labels](https://www.reddit.com/r/sveltejs/comments/1e26pfc/vs_code_supports_custom_tab_labels/) (a good reminder for folks who haven't sent it up yet)
- Storybook did a prerelease of `@storybook/addon-svelte-csf` with support for Svelte v5. If you're using it, share your feedback on their RFC: [storybookjs/addon-svelte-csf#191](https://github.com/storybookjs/addon-svelte-csf/discussions/191)


That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next month 👋
