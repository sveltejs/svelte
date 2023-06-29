---
title: 'svelte.dev: A complete overhaul'
description: 'svelte.dev revamped, comes with accessibility fixes, new features and bottom navbar'
author: Puru Vijay
authorURL: https://puruvj.dev
---

When the initial version of Svelte v3 was released four years ago, it included the single-page documentation that folks are familiar with. That documentation structure has stayed the same as Svelte's API surface has been increasing steadily. As a result, the single page got larger and larger to the point where it was becoming difficult to find things. The community has been asking for a revamp, and now it's here!

Meet the new svelte.dev — a complete overhaul of the old website.

## Multi-page docs

The table of contents had grown to be quite large and you had to scroll across half a dozen screens to see the whole thing.

We heard you! The docs are all split up into multiple pages now and all pages list their sections in the righthand sidebar.

All modules exposed by Svelte are also listed in the sidebar under the `Runtime` section:

- [svelte](/docs/svelte)
- [svelte/store](/docs/svelte-store)
- [svelte/motion](/docs/svelte-motion)
- [svelte/transition](/docs/svelte-transition)
- [svelte/animate](/docs/svelte-animate)
- [svelte/easing](/docs/svelte-easing)
- [svelte/action](/docs/svelte-action)

> [svelte/compiler](/docs/svelte-compiler) is under **Compiler and API** section

And worry not, all the links from the older website will be redirected to the correct page.

## Search

The lack of search functionality could make finding stuff a nuisance as <kbr>Ctrl+F</kbr> only returns results in order of occurrence and not order of importance. While <kbr>Ctrl+F</kbr> did have its benefits such as working without JS, now that the site has multiple pages, it's not an option anymore.

And for that, the new website comes with a search bar, which searches through the docs and the API surface. Hit <kbr>Ctrl+K</kbr> (or <kbr>CMD+F</kbr> for Mac users) and start searching!

## Lights, TypeScript, Action!

The new website comes with a JavaScript / TypeScript toggle, so you can view the docs in your preferred flavour. Every module's exported types are listed at the bottom of the page for easy reference. The types are automatically generated from Svelte's source code, so they're always up to date.

All the JavaScript and TypeScript code snippets have type hints available right there. Just hover over the variable to see its type. This allows the docs to be type checked at build time, which ensures they're never out of date.

We also (finally!) added documentation for [Actions](/docs/svelte-action). Svelte Actions are a way to interact with the DOM, and are a great way to add interactivity to your app. The docs for Actions are also available in TypeScript.

```svelte
<script lang="ts">
	import type { Action } from 'svelte/action';

	const foo: Action = (node) => {
		// the node has been mounted in the DOM

		return {
			destroy() {
				// the node has been removed from the DOM
			}
		};
	};
</script>

<div use:foo />
```

## Dark mode

After many years of users asking for dark mode on the website so they can read the docs for their night-time coding sessions, we finally added it! The website now has a dark mode toggle, which is also synced with your OS's dark mode settings. It can be toggled from the top navbar (bottom navbar on mobile).

## Updated REPL

The REPL has been rewritten from scratch to be fully typesafe and comes with features like dark mode. It was reimplemented to upgrade to CodeMirror 6 (which comes with many accessibility improvements, multi-select mode, performance improvements, tree-shaking, and many more features).

## Redesigned homepage

Is it a website redesign if the homepage doesn't get the same amount of love? 🙃

The homepage has also been updated to align with [kit.svelte.dev](https://kit.svelte.dev) and features the beautiful Svelte Machine by [@vedam](https://github.com/vedam).

## Bottom navigation!

We sent out a [tweet](https://twitter.com/Rich_Harris/status/1664712880791404546) about experimenting with bottom navigation bar on mobile rather than the conventional top navbar. The response was overwhelmingly positive, so we went ahead and added it to the website! This makes it easier to navigate the website on mobile with just one hand, and also makes it easier to reach the dark mode toggle. Additionally, it shows the contents of whatever section of the site you are on. For example, if you are on one of the docs pages, the navbar will open by default to the docs contents. This allows for much quicker navigation between pages.

If you're on mobile, you can already see it at the bottom. If you're on desktop, you can see it by resizing your browser window to a smaller size.

## Unification of Svelte websites

Now svelte.dev, kit.svelte.dev, and learn.svelte.dev all use the same design system and are more consistent with each other. This makes it easier to navigate between the websites and also makes it easier to maintain them. We have a package shared across the sites called `@sveltejs/site-kit`, which went through rigorous changes over last 4 months as we have been moving all of the common stuff to this package.

For example, we implemented the dark mode toggle in `@sveltejs/site-kit`. We then simply updated the package on [learn.svelte.dev](https://learn.svelte.dev) and [kit.svelte.dev](https://kit.svelte.dev) and those sites got the dark mode toggle automatically. This is the reason why those sites got the dark mode toggle before the [svelte.dev](https://svelte.dev) relaunch.

## What's next

We have many more things planned to do post-launch. Some of them are:

- Redesigned blog page
- Improved search
- Playground: Merge REPL and Examples page
- Unify infrastructure of svelte REPL and learn.svelte.dev(A webcontainer-based REPL with rollup as fallback)
- Address any feedback
