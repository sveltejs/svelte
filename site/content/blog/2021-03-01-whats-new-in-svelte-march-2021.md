---
title: What's new in Svelte: March 2021
description: TBD
author: Daniel Sandoval
authorURL: https://desandoval.net
---

Some intro

## What's new in `sveltejs/svelte`
* SSR store handling has been reworked to subscribe and unsubscribe as in DOM mode. SSR stores should work much more consistently now (**3.31.2**, see [custom stores](https://svelte.dev/examples#custom-stores) and [Server-side component API ](https://svelte.dev/docs#Server-side_component_API))
* Multiple instances of the same action are now allowed on an element (**3.32.0**, [xample](https://svelte.dev/repl/01a14375951749dab9579cb6860eccde?version=3.32.0))
* The new `foreign` namespace should make it easier for alternative compile targets (like Svelte Native and SvelteGUI) by disabling certain HTML5-specific behaviour and checks (**3.32.0**, [more info](https://github.com/sveltejs/svelte/pull/5652))
* Support for inline comment sourcemaps in code from preprocessors (**3.32.0**)
* Destructured defaults are now allowed to refer to other variables (**3.33.0**, [example](https://svelte.dev/repl/0ee7227e1b45465b9b47d7a5ae2d1252?version=3.33.0))
* Custom elements will now call `onMount` functions when connecting and clean up when disconnecting (**3.33.0**, checkout [this PR](https://github.com/sveltejs/svelte/pull/4522) for an interesting conversation on how folks are using Svelte with Web Components)
* A `cssHash` option has been added to the compiler options to control the classname used for CSS scoping (**3.34.0**, [docs](https://svelte.dev/docs#svelte_compile))
* Continued improvement to Typescript definitions

For a complete list of changes, including bug fixes and links to PRs, check out [the CHANGELOG](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md)


## New from `sveltejs/language-tools`

- TypeScript's control flow pattern now works (as of TS 4.2) as of VS Code Svelte extension version 104.4.4 and `svelte-check` version 1.1.36.
- For language server clients tha don't support `digChangeWatchedFiles`, a fallback file watcher will beu sed instead
- svelte-check 1.1.33 / extension version 104.4.0 introduced new highlighting rules for reactive statements, store accessors and element directives (likme `bind:` and `class:`)
- HTML tags can now be renamed at the same time
- Mustache tags parsing is now more robust and won't throw as many errors

Haven't tried the language-tools yet? Check out [Svelte Extension for VSCode](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) or find a plugin for your favorite IDE!

## Other changes from `sveltejs/*`

- [eslint-plugin-svelte3](https://github.com/sveltejs/eslint-plugin-svelte3) now supports TypeScript as of 3.1.0
- [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte/) released a number of minor versions to address whitespace and comment trimming issues.
- [svelte-preprocess](https://github.com/sveltejs/svelte-preprocess/) bug fixes this month include fixes to postcss transformations and support for both v2 and v3 of `postcss-load-config`
- [sapper](https://github.com/sveltejs/sapper/)'s 0.29.1 release fixes some bad imports in type definitions, updates typings to be compatible with express/polka, and restores hashing of all CSS file names.

---

## Community Showcase

**Apps & Sites**

- 


**Demos, Libraries & Components**

- 


**New Integrations & Starters**
- 

**Have your own Svelte Componentto share?** Check out the [Components](https://sveltesociety.dev/components) page on the Svelte Society site. You can contribute by making [a PR to this file](https://github.com/svelte-society/sveltesociety.dev/blob/master/src/pages/components/components.json).

**Learning Resources**

- 

## See you next month!

Got something to add? Join us on [Svelte Society](https://sveltesociety.dev/), [Reddit](https://www.reddit.com/r/sveltejs/) and [Discord](https://discord.com/invite/yy75DKs)!
