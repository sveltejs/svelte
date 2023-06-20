---
title: 'svelte.dev: A complete overhaul'
description: 'svelte.dev revamped, comes with accessibility fixes, new features and bottom navbar'
author: Puru Vijay
authorURL: https://puruvj.dev
---

It is June 2023, 4 years after svelte v3 was released. The then-practical-now-notorious single-pager website that folks are familiar with also came out then, and has stayed the same until now. Svelte's API surface has been increasing steadily and the single pager got bigger and bigger, to the point where it was becoming difficult to find things. The community has been asking for a revamp for a while now, and it's here now!

Meet the new svelte.dev, a complete overhaul of the old website.

## Multi-page docs

The huge single-pager was a huge nuisance, in terms of finding stuff(Hullo there Ctrl+F), as well as just having low performance due to the sheer size of the page.

We heard you! The docs are all split up into multiple pages now. And all pages are split into their sections in the sidebar. Wanna know how to use the `class:` directive, or wanna look up the syntax for `{#await}`? All these are just one click away under the `Template Syntax` heading in the sidebar.

All modules exposed by svelte are also listed in the sidebar, under the `Runtime` section.

- [svelte](/docs/svelte)
- [svelte/store](/docs/svelte/store)
- [svelte/motion](/docs/svelte/motion)
- [svelte/transition](/docs/svelte/transition)
- [svelte/animate](/docs/svelte/animate)
- [svelte/easing](/docs/svelte/easing)
- [svelte/action](/docs/svelte/action)

And worry not, all the links from the older website will be redirected to the correct page.

## Search

One thing that the previous single pager website was good at was finding things without any JS. It's just a single html page, just hit <kbr>Ctrl+F</kbr> and search what you're looking for! But now that the site uses different pages, that is not an option anymore

And for that, the new website comes with a search bar, which searches through the docs and the API surface. Hit Ctrl+K(or CMD+F for Mac users) and start searching!

## Lights, TypeScript, Action!

The new website comes with a JavaScript/TypeScript toggle, so you can view the docs in your preferred language. For every module, it's exported types are listed at the bottom of the page for easy reference. The types are automatically generated from Svelte's source code, so they're always up to date.

All the JavaScript and TypeScript code snippet have type hints available right there. Just hover over the variable to see it's type. This allows the docs to be type checked at build time, which makes sure we're never out of date.

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

After many years of users asking for dark mode on the website so they can read the docs for their night-time coding sessions, we finally added it! The website now has a dark mode toggle, which is also synced with your OS's dark mode settings. It can be toggled from the top navbar(bottom navbar on mobile).

## Updated REPL

The REPL has been rewritten from scratch to be fully typesafe, and comes with features like Dark mode, and Codemirror 6 (Which comes with many accesssibility improvements, multi-select mode, performance improvments, tree-shakability and many more features).

## Redesigned homepage

Is it a website redesign if the homepage doesn't get the same amount of love? 🙃

Homepage has also been redesigned to resemble [kit.svelte.dev](https://kit.svelte.dev) a bit more, and features the beautiful Svelte Machine by Vedam.

## Bottom navigation!

We sent out a [tweet](https://twitter.com/Rich_Harris/status/1664712880791404546) about experimenting with bottom navigation bar on mobile rather than the conventional top navbar, and the response was overwhelmingly positive. So we went ahead and added it to the website! This makes it easier to navigate the website on mobile with just one hand, and also makes it easier to reach the dark mode toggle. It also shows the contents of whatever section of the site you are. For example, if you are on one of the docs page, the navbar will open by default to the docs contents. This allows for much quicker navigation between pages.

If you're on mobile, you can already see it at the bottom. If you're on desktop, you can see it by resizing your browser window to a smaller size.

## Unification of Svelte websites

svelte.dev, kit.svelte.dev and learn.svelte.dev all use the same design system, and are now more consistent with each other. This makes it easier to navigate between the websites, and also makes it easier to maintain them. We have an internal package called `@sveltejs/site-kit`. It went through rigorous changes over last 4 months, and we have been moving all the common stuff between the sites to this package.

This is the reason why learn.svelte.dev and kit.svelte.dev got the dark mode toggle before this site. We added it to site-kit for this site, and simply updated the package on those websites, getting the dark mode toggle automatically.

## What's next

We have many more things planned to do post-launch. Some of them are:

- Redesign blog page
- Webcontainer based REPL
- Deprecate old svelte tutorial to rely on learn.svelte.dev
- Merge REPL and Examples page
- Fix all the bugs
