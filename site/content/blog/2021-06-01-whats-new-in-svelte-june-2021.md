---
title: "What's new in Svelte: June 2021"
description: Progress towards SvelteKit 1.0 and tighter TypeScript/Svelte integrations in language tools
author: Dani Sandoval
authorURL: https://dreamindani.com
---

This month, we saw lots of contributions to SvelteKit and its docs. The language tools also got some new features, most notably deeper integration with Svelte files within JavaScript or TypeScript files. Let's jump into the updates...

## New in SvelteKit

- `svelte.config.js` config files are now loaded in ESM format (`.js` instead of `.cjs`).
- AMP pages will now use the rendered CSS, rather than emitted CSS
- `svelte-check` has been added to the TypeScript template ([sveltejs/kit#1556](https://github.com/sveltejs/kit/pull/1556))
- Support for https keypair [sveltejs/kit#1456](https://github.com/sveltejs/kit/pull/1456)
- Now bundling Vite with SvelteKit and using an upgraded version. Remove Vite from your `package.json` if it's there
- Etags for binary responses [sveltejs/kit#1382](https://github.com/sveltejs/kit/pull/1382)
- Renamed `$layout` to `__layout` and `$error` to `__error`
- Removed `getContext` in favor of `request.locals`
- Renamed `.svelte` output directory to `.svelte-kit`. Update your `.gitignore` accordingly
- `trailingSlash: 'never' | 'always' | 'ignore'` is now available in the config. This should make it easier to build sites that work with static hosting providers that expect a trailing slash for `index.html` pages, and provides an escape hatch for anyone that needs more complex behaviour.

## Notable bug fixes in SvelteKit

- `adapter-netlify` got a fix [sveltejs/kit#1467](https://github.com/sveltejs/kit/pull/1467) and new documentation in the readme https://github.com/sveltejs/kit/tree/master/packages/adapter-netlify
- The router will no longer intercept navigation for URLs that the app does not own. This fixes a crash for apps that have `<a>` elements on the page with the same origin but don't share a base path with the app.
- Hash only changes are now handled by the router fixing the browser's "back" navigation between hash changes in some circumstances.

## New in Svelte & Language Tools

- Svelte 3.38.1 and 3.38.2 fixed an issue with hydration that was causing duplicate elements. If you're seeing this in your project, be sure to update the latest version!
- A new TypeScript plugin provides deeper integration with Svelte files within JavaScript or TypeScript files. This includes diagnostics, references and renaming of variables. It comes packaged with the VS Code extension but is turned off by default for now. You can enable it through [this setting](https://github.com/sveltejs/language-tools/tree/master/packages/svelte-vscode#svelteenable-ts-plugin). We encourage you to test it out and [provide feedback](https://github.com/sveltejs/language-tools/issues/580)
- In the latest version of `svelte-check` you can now provide the path to your `tsconfig.json` or `jsconfig.json`. Example: `svelte-check --tsconfig "./tsconfig.json"`. This ensures the diagnostics are only run on files that are referenced in that config. It also runs diagnostics on JavaScript and/or TypeScript files which removes the need to run another check (like `tsc --noEmit`) for non-Svelte files (`svelte-check` version [**1.6.0**](https://github.com/sveltejs/language-tools/releases/tag/svelte-check-1.6.0))
- The VS Code extension and `svelte-check` got a new major release. Previously, properties that had no initializer (`export let foo;`) were only required if the user was using both TypeScript and activated `strict` mode. This is changed now: People using TypeScript, and those using `checkJs` also in JavaScript files, will now always have these properties marked as required (`svelte-check` version [**2.0.0**](https://github.com/sveltejs/language-tools/releases/tag/svelte-check-2.0.0), extension version [**105.0.0**](https://github.com/sveltejs/language-tools/releases/tag/extensions-105.0.0))

---

## Community Showcase

**Apps & Sites**

- [vidu](https://github.com/pa-nic/vidu) is a minimal web analytics collector and dashboard
- [River Runner](https://river-runner.samlearner.com/) is a virtual way to follow rivers downstream - built with Mapbox and Svelte.
- [JSDoc Type Generator](https://rafistrauss.github.io/jsdoc-generator/) generates JSDoc types for valid JSON.
- [pagereview.io](https://pagereview.io/) is a website feedback tool that lets you leave comments directly on the site being reviewed.
- [gamesroom.io](https://gamesroom.io/) is an online board game platform with video chat built-in.
- [Greedy Goblin](https://greedygoblin-fe11c.web.app/) is a recipe app for old-school Runescape players.
- [hashbrown.geopjr.dev](https://hashbrown.geopjr.dev/) is a GNOME-shell inspired webpage to learn about, explore the source code and download the Hashbrown GTK app ([link to source](https://github.com/GeopJr/Hashbrown/tree/website)).

**Libraries, Tools & Components**

- [svelte-image-crop](https://novacbn.github.io/svelte-image-crop/) is a simple click'n'drag image cropping library using Web APIs.
- [svelte-datepicker](https://github.com/andrew-secret/svelte-datepicker) is a lightweight and inclusive date picker build with Svelte.
- [svelte-regex-router](https://www.npmjs.com/package/svelte-regex-router) is a simple, lightweight library for you to easily handle routes in your Svelte application.
- [Svelte Micro](https://www.npmjs.com/package/svelte-micro) is a light & reactive one-component router for Svelte.
- [svelte-entity-store](https://www.npmjs.com/package/svelte-entity-store) is to provide a simple, generic solution for storing collections of entity objects.
- [svelte-animation-store](https://github.com/joshnuss/svelte-animation-store) is a store that is based on Svelte's tweened store, that lets you pause, continue, reset, replay, reverse or adjust speed of a tween.

**Want to contribute a component?** Submit a [Component](https://sveltesociety.dev/components) to the Svelte Society site by making [a PR to this file](https://github.com/svelte-society/sveltesociety.dev/blob/master/src/pages/components/components.json).

## See you next month!

Did we miss something? Join us on [Svelte Society](https://sveltesociety.dev/), [Reddit](https://www.reddit.com/r/sveltejs/) and [Discord](https://discord.com/invite/yy75DKs)!
