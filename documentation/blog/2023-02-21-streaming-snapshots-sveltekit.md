---
title: Streaming, snapshots, and other new features since SvelteKit 1.0
description: Exciting improvements in the latest version of SvelteKit
author: Geoff Rich
authorURL: https://geoffrich.net
---

The Svelte team has been hard at work since the release of SvelteKit 1.0. Let’s talk about some of the major new features that have shipped since launch: [streaming non-essential data](https://kit.svelte.dev/docs/load#streaming-with-promises), [snapshots](https://kit.svelte.dev/docs/snapshots), and [route-level config](https://kit.svelte.dev/docs/page-options#config).

## Stream non-essential data in load functions

SvelteKit uses [load functions](https://kit.svelte.dev/docs/load) to retrieve data for a given route. When navigating between pages, it first fetches the data, and then renders the page with the result. This could be a problem if some of the data for the page takes longer to load than others, especially if the data isn’t essential – the user won’t see any part of the new page until all the data is ready.

There were ways to work around this. In particular, you could fetch the slow data in the component itself, so it first renders with the data from `load` and then starts fetching the slow data. But this was not ideal: the data is even more delayed since you don’t start fetching until the client renders, and you’re also having to break SvelteKit’s `load` convention.

Now, in SvelteKit 1.8, we have a new solution: you can return a nested promise from a server load function, and SvelteKit will start rendering the page before it resolves. Once it completes, the result will be [streamed](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) to the page.

For example, consider the following `load` function:

```ts
// @errors: 2304
export const load: PageServerLoad = () => {
	return {
		post: fetchPost(),
		streamed: {
			comments: fetchComments()
		}
	};
};
```

SvelteKit will automatically await the `fetchPost` call before it starts rendering the page, since it’s at the top level. However, it won’t wait for the nested `fetchComments` call to complete – the page will render and `data.streamed.comments` will be a promise that will resolve as the request completes. We can show a loading state in the corresponding `+page.svelte` using Svelte’s [await block](https://svelte.dev/docs#template-syntax-await):

```svelte
<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<article>
	{data.post}
</article>

{#await data.streamed.comments}
	Loading...
{:then value}
	<ol>
		{#each value as comment}
			<li>{comment}</li>
		{/each}
	</ol>
{/await}
```

There is nothing unique about the property `streamed` here – all that is needed to trigger the behavior is a promise outside the top level of the returned object.

SvelteKit will only be able to stream responses if your app’s hosting platform supports it. In general, any platform built around AWS Lambda (e.g. serverless functions) will not support streaming, but any traditional Node.js server or edge-based runtime will. Check your provider’s documentation for confirmation.

If your platform does not support streaming, the data will still be available, but the response will be buffered and the page won’t start rendering until all data has been fetched.

## How does it work?

In order for data from a server `load` function to get to the browser, we have to _serialize_ it. SvelteKit uses a library called [devalue](https://github.com/Rich-Harris/devalue), which is like `JSON.stringify` but better — it can handle values that JSON can't (like dates and regular expressions), it can serialize objects that contain themselves (or that exist multiple times in the data) without breaking identity, and it protects you against [XSS vulnerabilities](https://github.com/rich-harris/devalue#xss-mitigation).

When we server-render a page, we tell devalue to serialize promises as function calls that create a _deferred_. This is a simplified version of the code SvelteKit adds to the page:

```js
// @errors: 2339 7006
const deferreds = new Map();

window.defer = (id) => {
	return new Promise((fulfil, reject) => {
		deferreds.set(id, { fulfil, reject });
	});
};

window.resolve = (id, data, error) => {
	const deferred = deferreds.get(id);
	deferreds.delete(id);

	if (error) {
		deferred.reject(error);
	} else {
		deferred.fulfil(data);
	}
};

// devalue converts your data into a JavaScript expression
const data = {
	post: {
		title: 'My cool blog post',
		content: '...'
	},
	streamed: {
		comments: window.defer(1)
	}
};
```

This code, along with the rest of the server-rendered HTML, is sent to the browser immediately, but the connection is kept open. Later, when the promise resolves, SvelteKit pushes an additional chunk of HTML to the browser:

```html
<script>
	window.resolve(1, {
		data: [{ comment: 'First!' }]
	});
</script>
```

For client-side navigation, we use a slightly different mechanism. Data from the server is serialized as [newline delimited JSON](https://dataprotocols.org/ndjson/), and SvelteKit reconstructs the values — using a similar deferred mechanism — with `devalue.parse`:

```json
// this is generated immediately — note the ["Promise",1]...
[{"post":1,"streamed":4},{"title":2,"content":3},"My cool blog post","...",{"comments":5},["Promise",6],1]

// ...then this chunk is sent to the browser once the promise resolves
[{"id":1,"data":2},1,[3],{"comment":4},"First!"]
```

Because promises are natively supported in this way, you can put them anywhere in the data returned from `load` (except at the top level, since we automatically await those for you), and they can resolve with any type of data that devalue supports — including more promises!

One caveat: this feature needs JavaScript. Because of this, we recommend that you only stream in non-essential data so that the core of the experience is available to all users.

For more on this feature, see [the documentation](https://kit.svelte.dev/docs/load#streaming-with-promises). You can see a demo at [sveltekit-on-the-edge.vercel.app](https://sveltekit-on-the-edge.vercel.app/edge) (the location data is artificially delayed and streamed in) or [deploy your own on Vercel](https://vercel.com/templates/svelte/sveltekit-edge-functions), where streaming is supported in both Edge Functions and Serverless Functions.

We're grateful for the inspiration from prior implementations of this idea including Qwik, Remix, Solid, Marko, React and many others.

## Snapshots

Previously in a SvelteKit app, if you navigated away after starting to fill out a form, going back wouldn’t restore your form state – the form would be recreated with its default values. Depending on the context, this can be frustrating for users. Since SvelteKit 1.5, we have a built-in way to address this: snapshots.

Now, you can export a `snapshot` object from a `+page.svelte` or `+layout.svelte`. This object has two methods: `capture` and `restore`. The `capture` function defines what state you want to store when the user leaves the page. SvelteKit will then associate that state with the current history entry. If the user navigates back to the page, the `restore` function will be called with the state you previously had set.

For example, here is how you would capture and restore the value of a textarea:

```svelte
<script lang="ts">
	import type { Snapshot } from './$types';

	let comment = '';

	export const snapshot: Snapshot = {
		capture: () => comment,
		restore: (value) => (comment = value)
	};
</script>

<form method="POST">
	<label for="comment">Comment</label>
	<textarea id="comment" bind:value={comment} />
	<button>Post comment</button>
</form>
```

While things like form input values and scroll positions are common examples, you can store any JSON-serializable data you like in a snapshot. The snapshot data is stored in [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage), so it will persist even when the page is reloaded, or if the user navigates to a different site entirely. Because it’s in `sessionStorage`, you won’t be able to access it during server-side rendering.

For more, see [the documentation](https://kit.svelte.dev/docs/snapshots).

## Route-level deployment configuration

SvelteKit uses platform-specific [adapters](https://kit.svelte.dev/docs/adapters) to transform your app code for deployment to production. Until now, you had to configure your deployment on an app-wide level. For instance, you could either deploy your app as an edge function or a serverless function, but not both. This made it impossible to take advantage of the edge for parts of your app – if any route needed Node APIs, then you couldn’t deploy any of it to the edge. The same is true for other aspects of deployment configuration, such as regions and allocated memory: you had to choose one value that applied to every route in your entire app.

Now, you can export a `config` object in your `+server.js`, `+page(.server).js` and `+layout(.server).js` files to control how those routes are deployed. Doing so in a `+layout.js` will apply the configuration to all child pages. The type of `config` is unique to each adapter, since it depends on the environment you’re deploying to.

```ts
// @errors: 2307
import type { Config } from 'some-adapter';

export const config: Config = {
	runtime: 'edge'
};
```

Configs are merged at the top level, so you can override values set in a layout for pages further down the tree. For more details, see [the documentation](https://kit.svelte.dev/docs/page-options#config).

If you deploy to Vercel, you can take advantage of this feature by installing the latest versions of SvelteKit and your adapter. This will require a major upgrade to your adapter version, since adapters supporting route-level config require SvelteKit 1.5 or later.

```bash
npm i @sveltejs/kit@latest
npm i @sveltejs/adapter-auto@latest # or @sveltejs/adapter-vercel@latest
```

For now, only the [Vercel adapter](https://kit.svelte.dev/docs/adapter-vercel#deployment-configuration) implements route-specific config, but the building blocks are there to implement this for other platforms. If you’re an adapter author, see the changes in [the PR](https://github.com/sveltejs/kit/pull/8740) to see what is required.

## Incremental static regeneration on Vercel

Route-level config also unlocked another much-requested feature – you can now use [incremental static regeneration](https://kit.svelte.dev/docs/adapter-vercel#incremental-static-regeneration) (ISR) with SvelteKit apps deployed to Vercel. ISR provides the performance and cost advantages of prerendered content with the flexibility of dynamically rendered content.

To add ISR to a route, include the `isr` property in your `config` object:

```ts
export const config = {
	isr: {
		// see Vercel adapter docs for the required options
	}
};
```

## And much more...

- The [OPTIONS method](https://kit.svelte.dev/docs/routing#server) is now supported in `+server.js` files
- Better error messages when you [export something that belongs in a different file](https://github.com/sveltejs/kit/pull/9055) or [forget to put a slot](https://github.com/sveltejs/kit/pull/8475) in your +layout.svelte.
- You can now [access public environment variables in app.html](https://kit.svelte.dev/docs/project-structure#project-files-src)
- A new [text helper](https://kit.svelte.dev/docs/modules#sveltejs-kit-text) for creating responses
- And a ton of bug fixes – see [the changelog](https://github.com/sveltejs/kit/blob/master/packages/kit/CHANGELOG.md) for the full release notes.

Thank you to everyone who has contributed and uses SvelteKit in their projects. We’ve said it before, but Svelte is a community project, and it wouldn’t be possible without your feedback and contributions.
