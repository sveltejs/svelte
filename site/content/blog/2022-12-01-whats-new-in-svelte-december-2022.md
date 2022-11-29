---
title: "What's new in Svelte: December 2022"
description: "TBD"
author: Daniel Sandoval
authorURL: https://desandoval.net
---

TBD

## What's new in SvelteKit
- Use the `willUnload` property to find out if the navigation will result the app being unloaded (full page reload/closing/leaving to another page). ([#6813](https://github.com/sveltejs/kit/pull/6813))
- `__data.json` requests now use the Vary header, which allows one cached response for each variation of the x-sveltekit-invalidated header, ensuring we cache matching responses for all invalidation scenarios ([#7532](https://github.com/sveltejs/kit/pull/7532))
- Linking to `<a name="hash">` tags is now supported ([#7596](https://github.com/sveltejs/kit/pull/7596))
- Throwing redirects in a handled error is now supported ([#7612](https://github.com/sveltejs/kit/pull/7612))
- A fallback component will now be added automatically for layouts without one ([#7619](https://github.com/sveltejs/kit/pull/7619))
- Fonts are now preloaded automatically and preloading can be customized with the `resolve` hook ([Docs](https://kit.svelte.dev/docs/hooks#server-hooks-handle), [#4963](https://github.com/sveltejs/kit/pull/4963))
- `version` is now available via `$app/environment` ([#7689](https://github.com/sveltejs/kit/pull/7689), [#7694](https://github.com/sveltejs/kit/pull/7694))
- `handleError` can now return a promise ([#7780](https://github.com/sveltejs/kit/pull/7780))


**Breaking changes:**
- `routeId` is now `route.id` ([#7450](https://github.com/sveltejs/kit/pull/7450))
- 'load' has been renamed to 'enter' and 'unload' to 'leave' in the `beforeNavigate` and `afterNavigate` methods. `beforeNavigate` is now called once with type 'unload' on external navigation and will no longer run during redirects ([#7502](https://github.com/sveltejs/kit/pull/7502), [#7529](https://github.com/sveltejs/kit/pull/7529), [#7588](https://github.com/sveltejs/kit/pull/7588))
- The `redirect` helper will now only allow status codes between 300-308 for redirects and only `error` status codes between 400-599 are allowed ([#7767](https://github.com/sveltejs/kit/pull/7767)) ([#7615](https://github.com/sveltejs/kit/pull/7615), [#7767](https://github.com/sveltejs/kit/pull/7767))
- Special characters will now be encoded with hex/unicode escape sequences in route directory names ([#7644](https://github.com/sveltejs/kit/pull/7644))
- devalue is now used to (de)serialize action data - this is only a breaking change for everyone who fetches the actions directly and doesn't go through `use:enhance` ([#7494](https://github.com/sveltejs/kit/pull/7494))
- `trailingSlash` is now a page option, rather than configuration ([#7719](https://github.com/sveltejs/kit/pull/7719))
- The client-side router now ignores links outside `%sveltekit.body%` ([#7766](https://github.com/sveltejs/kit/pull/7766))
- `prerendering` is now named `building`, and `config.kit.prerender.enabled` has been removed ([#7762](https://github.com/sveltejs/kit/pull/7762))
- `getStaticDirectory()` has been removed from the builder API ([#7809](https://github.com/sveltejs/kit/pull/7809))
- The `format` option has been removed from `generateManifest(...)` ([#7820](https://github.com/sveltejs/kit/pull/7820))
- `data-sveltekit-prefetch` has been replaced with `-preload-code` and `-preload-data`, `prefetch` is now `preloadData` and `prefetchRoutes` is now `preloadCode` ([#7776](https://github.com/sveltejs/kit/pull/7776), [#7776](https://github.com/sveltejs/kit/pull/7776))
- `SubmitFunction` has been moved from `$app/forms` into `@sveltejs/kit` ([#7003](https://github.com/sveltejs/kit/pull/7003))

## New in Svelte
- The css compiler options of `css: false` and `css: true` have been replaced with `'external' | 'injected' | 'none'` settings to speed up compilation for `ssr` builds and improve clarity (**3.53.0**)

For all the changes to the Svelte compiler, including unreleased changes, check out the [CHANGELOG](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md).

---

## Community Showcase

**Apps & Sites built with Svelte**
- TBD


**Learning Resources**

_To Watch_
- TBD

_To Read_
- TBD



**Libraries, Tools & Components**
- TBD


That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte)

See ya next month 👋
