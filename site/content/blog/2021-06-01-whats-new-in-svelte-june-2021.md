---
title: What's new in Svelte: June 2021
description: TBD
author: Daniel Sandoval
authorURL: https://desandoval.net
---

Intro

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

- 


**Demos, Libraries, Tools & Components**

- 

**Want to contribute your own component?** Submit a [Component](https://sveltesociety.dev/components) to the Svelte Society site by making [a PR to this file](https://github.com/svelte-society/sveltesociety.dev/blob/master/src/pages/components/components.json).


**Starters**
- 

**Looking for a starter or integration?** Check out [svelte-adders](https://github.com/svelte-add/svelte-adders) and a number of other integration examples at [sveltejs/integrations](https://github.com/sveltejs/integrations)


**Learning Resources**
- 



## See you next month!

Got something to add? Join us on [Svelte Society](https://sveltesociety.dev/), [Reddit](https://www.reddit.com/r/sveltejs/) and [Discord](https://discord.com/invite/yy75DKs)!
