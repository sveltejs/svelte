---
title: What's new in Svelte: June 2021
description: Progress on SvelteKit V1 and tighter TypeScript/Svelte integrations in language tools
author: Daniel Sandoval
authorURL: https://desandoval.net
---

This month, we saw lots of contributions to SvelteKit and its docs. The language tools also got some new features alongside some hydration bug fixes in Svelte core. Let's jump into the updates...

## New in SvelteKit
- `svelte.config.js` config files can now be loaded in ESM format (`.js` instead of `.cjs` - either can be used). It is recommended to use the `.js` format going forward.
- AMP pages will now use the rendered CSS, rather than emitted CSS
- `trailingSlash: 'never' | 'always' | 'ignore'` is now available in the config. This should make it easier to build sites that work with static hosting providers that expect a trailing slash for `index.html` pages, and provides an escape hatch for anyone that needs more complex behaviour.
- The router will no longer intercept navigation for URLs that the app does not own. This fixes a crash for apps that have `<a>` elements on the page with the same origin but don't share a base path with the app.
- Hash only changes are now handled by the router - fixing the browser's "back" navigation between hash changes.
- Svelte Kit builds and dev versions should now work on Windows (`pnpm build` and `dev` commands were failing due to lack of an `rm` command)



## New in Svelte & Language Tools
- Svelte 3.38.1 and 3.38.2 fixed an issue with hydration that was causing duplicate elements. If you're seeing this in your project, be sure to update the latest version!
- You can now toggle the TypeScript plugin on and off in the Svelte extension (Extension version [**104.11.0**](https://github.com/sveltejs/language-tools/releases/tag/extensions-104.11.0))
- Language server users on newer versions of Svelte will now have their sourcemaps preprocessed by Svelte instead of the (now deprecated) logic in language tools. (Extension version [**104.12.2**](https://github.com/sveltejs/language-tools/releases/tag/extensions-104.12.2))

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
