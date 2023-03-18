---
title: "What's new in Svelte: January 2023"
description: 'SvelteKit 1.0, learn.svelte.dev, and type definitions for Svelte elements.'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

It's been just two weeks since the release of [SvelteKit 1.0](https://svelte.dev/blog/announcing-sveltekit-1.0)! If you haven't yet, check out the [livestream](https://www.youtube.com/watch?v=N4BRVkQVoMc), [new website](https://kit.svelte.dev/) and [learn.svelte.dev](https://learn.svelte.dev/) to learn all the features of SvelteKit step-by-step.

Let's dive into the details...

## What's new in SvelteKit

- `@sveltejs/kit` 1.0 is out! All future releases will follow semver and changes will be listed as major/minor/patch in the [CHANGELOG](https://github.com/sveltejs/kit/blob/master/packages/kit/CHANGELOG.md#100).
- Improved support for Storybook and Histoire ([#7990](https://github.com/sveltejs/kit/pull/7990)). Work is ongoing to fully support those tools ([storybook#20239](https://github.com/storybookjs/storybook/pull/20239)).
- `vitePreprocess` is now the default preprocessor. Please see [the docs](https://kit.svelte.dev/docs/integrations#preprocessors) for differences between `vitePreprocess` and `svelte-preprocess` ([#8036](https://github.com/sveltejs/kit/pull/8036)).

**Breaking changes:**

- Unknown exports (except when starting with an underscore) are no longer allowed from `+(layout|page)(.server)?.js` and `+server.js` files ([#7878](https://github.com/sveltejs/kit/pull/7878))
- `__data.json` is now stripped from URL ([#7979](https://github.com/sveltejs/kit/pull/7979))
- `sveltekit()` will now return a promise for an array of Vite plugins ([#7994](https://github.com/sveltejs/kit/pull/7994))
- A new `embedded` option, turned off by default, helps with link clicks when embedding SvelteKit ([docs](https://kit.svelte.dev/docs/configuration), [#7969](https://github.com/sveltejs/kit/pull/7969))
- Automatic fallback generation has been replaced with `builder.generateFallback(fallback)` ([#8013](https://github.com/sveltejs/kit/pull/8013))
- `invalid()` is now `fail()` and `ValidationError` is now `ActionFailure` ([#8012](https://github.com/sveltejs/kit/pull/8012))
- SvelteKit will now throw an error on invalid load response ([#8003](https://github.com/sveltejs/kit/pull/8003))
- SvelteKit is now using Vite 4 and requires a Svelte `peerDependency` of `^3.54.0` ([#7543](https://github.com/sveltejs/kit/pull/7543))
- Shells are now prerendered when `ssr` is false and `prerender` is not false - ensure prerender is false when ssr is also false ([#8131](https://github.com/sveltejs/kit/pull/8131))
- Warnings and errors about removed/changed APIs have been removed ([#8019](https://github.com/sveltejs/kit/pull/8019))

## What's new in Svelte

- The `options.direction` argument can now be passed to custom transition functions (**3.54.0**, [#3918](https://github.com/sveltejs/svelte/issues/3918))
- Variables can now be updated from a `@const` declared function (**3.54.0**, [#7843](https://github.com/sveltejs/svelte/issues/7843))
- `svelte/elements` has been added for Svelte/HTML type definitions (**3.55.0**, [#7649](https://github.com/sveltejs/svelte/pull/7649))

## What's new in Language Tools

The Svelte extension and language tools now have a few new minimum version requirements:

- Node version is now 16
- TypeScript version is now 4.9
- Svelte version is now 3.55

The following features have also been released:

- missing handler quick fix ([#1731](https://github.com/sveltejs/language-tools/pull/1731))
- add Svelte anchor missing attribute code action ([#1730](https://github.com/sveltejs/language-tools/pull/1730))
- better commit characters handling ([#1742](https://github.com/sveltejs/language-tools/pull/1742))
- add `--preserveWatchOutput` option ([#1715](https://github.com/sveltejs/language-tools/pull/1715))
- enhance Quickfixes to include Svelte Stores ([#1789](https://github.com/sveltejs/language-tools/pull/1789))
- only show SvelteKit files context menu in SvelteKit projects ([#1771](https://github.com/sveltejs/language-tools/pull/1771))
- use the `satisfies` operator if possible ([#1770](https://github.com/sveltejs/language-tools/pull/1770))

For all the changes to the Svelte compiler, including unreleased changes, check out the [CHANGELOG](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md).

---

## Community Showcase

**Apps & Sites built with Svelte**

- [Svelte Recipes 🧑‍🍳](https://svelte.recipes/) provides code snippets for common data visualization problems
- [Everything Svelte](https://www.everythingsvelte.com/) is a new course teaching everything you need to know to build a modern web application
- [CSS Timeline](https://css-timeline.vercel.app/) is a Timeline of the history and evolution of CSS
- [GitBar](https://github.com/mikaelkristiansson/gitbar) is a system tray app for showing your pull requested reviews
- [Texture Lab](https://www.texturelab.xyz/) generates instant textures for games from any text
- [Totems](https://totems-soclage.com/) is a studio creating custom-made stands and supports
- [PeopletoNotion](https://www.peopletonotion.com/) is a Chrome Extension that adds LinkedIn profiles to Notion in one click
- [DeckDev](https://deckdev.com/) is a deck builder for Magic: The Gathering
- [Default Shortcuts](https://www.defaultshortcuts.com/) is a tool for searching keyboard shortcuts across browsers.

**Learning Resources**

_From Svelte Society_

- [Svelte Society - London December 2022](https://www.youtube.com/watch?v=2ijSarsHfN0) featuring two talks by Antony and Rich, respectively. Rich's talk, "Mistakes were made" is a SvelteKit 1.0 retrospective.
- [SvelteKit with Netlify Edge Functions](https://twitter.com/BrittneyPostma/status/1603402599742537729?s=20&t=Lw08QNMpdEP1JZzMQGXLDA) by Brittney Postma
- [Sirens Stream: Skeleton - A fully featured UI Toolkit](https://www.youtube.com/watch?v=2OnJYCXJPK4) with Chris Simmons and Brittney Postma
- [Sirens: SvelteKit for Enterprise](https://www.youtube.com/watch?v=_0ijqV0DmNQ) - Lacey Pevey joins the Sirens to talk through using SvelteKit at the Enterprise level
- [Sirens: Form Actions](https://www.youtube.com/watch?v=2OISk5-EHek) - Kev joins the Sirens again to chat about Form actions in SvelteKit and create a new form for speaker submissions on SvelteSirens.dev

_To Watch_

- [SvelteKit is my mistress](https://www.youtube.com/watch?v=uEJ-Rnm2yOE) by Fireship
- [Sveltekit 1.0 in under 3 minutes](https://www.youtube.com/watch?v=3KGKDgwIrkE) by Gui Bibeau
- [What Svelte UI Library Should You Use?](https://www.youtube.com/watch?v=O0mNU0maItY) and [The Best Icon Library For Svelte (Iconify)](https://www.youtube.com/watch?v=iGVhzsTZSa8) by Joy of Code

_To Read_

- [Rendering emails with Svelte](https://escape.tech/blog/sveltemails/) by Gautier Ben Aïm
- [Now That React is Dead, What’s the Next Big Thing?](https://javascript.plainenglish.io/now-that-react-js-is-dead-whats-the-next-big-thing-7fa72a36a69b) by Somnath Singh
- [What is SvelteKit? And Why Should You Care?](https://blog.tiia.rocks/what-is-sveltekit-and-why-should-you-care) by Tila
- [Sveltekit API endpoints](https://www.jefmeijvis.com/post/006-sveltekit-api-endpoints) by Jef Meijvis
- [Chart.js 4.0](https://github.com/chartjs/Chart.js/discussions/10977) has been released, with updated Svelte support
- [Creating A Custom Svelte Media Query Store](https://pqina.nl/blog/svelte-media-query-store/) by Rik Schennink

**Libraries, Tools & Components**

- [Konsta UI](https://konstaui.com/) is a library of pixel perfect mobile UI components built with Tailwind CSS for React, Vue & Svelte
- [probablykasper/modal-svelte](https://github.com/probablykasper/modal-svelte) is a modal component for Svelte
- [deepcrayon/scrolltron](https://spacecruft.org/deepcrayon/scrolltron) is a news ticker overlay for OBS Studio
- [JetBrains WebStorm 2022.3](https://www.jetbrains.com/webstorm/whatsnew/#:~:text=Update%20about%20Svelte%20support) now has built-in support for Svelte
- [NextAuth.js](https://vercel.com/blog/announcing-sveltekit-auth) is now available for SvelteKit
- [SvelteKit CAS authentication](https://www.npmjs.com/package/@macfja/sveltekit-cas) is a set of functions to ease usage of a CAS/SSO in SvelteKit
- [@macfja/sveltekit-session](https://www.npmjs.com/package/@macfja/sveltekit-session) is an easy way to do session management for SvelteKit
- [@svelte-plugins/tooltips](https://svelte-plugins.github.io/tooltips/) is a basic tooltip component written in Svelte
- [tRPC-SvelteKit](https://github.com/icflorescu/trpc-sveltekit) provides end-to-end typesafe APIs for your SvelteKit applications
- [SvelteKit Tailwind Blog Starter](https://github.com/akiarostami/sveltekit-tailwind-blog-starter) is an easily configurable and customizable blog starter for SvelteKit + Tailwind CSS
- [Free Svelte Accelerators](https://sveltekitstarter.com/) is a list of Svelte and Sveltekit open source code to jump start your project

Happy new year 🎆 Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte)
