---
title: Zero-effort type safety
description: More convenience and correctness, less boilerplate
author: Simon Holthausen
authorURL: https://twitter.com/dummdidumm_
---

By sprinkling type annotations into your SvelteKit apps, you can get full type safety across the network — the `data` in your page has a type that's inferred from the return values of the `load` functions that generated that data, without you having to explicitly declare anything. It's one of those things that you come to wonder how you ever lived without.

But what if we didn't even need the annotations? Since `load` and `data` are part of the framework, can't the framework type them for us? This is, after all, what computers are for — doing the boring bits so we can focus on the creative stuff.

As of today, yes: it can.

<video src="https://sveltejs.github.io/assets/video/zero-config-types.mp4" controls muted playsinline></video>

If you're using VS Code, just upgrade the Svelte extension to the latest version, and you'll never have to annotate your `load` functions or `data` props again. Extensions for other editors can also use this feature, as long as they support the Language Server Protocol and TypeScript plugins. It even works with the latest version of our CLI diagnostics tool `svelte-check`!

Before we dive in, let's recap how type safety works in SvelteKit.

## Generated types

In SvelteKit, you get the data for a page in a `load` function. You _could_ type the event by using `ServerLoadEvent` from `@sveltejs/kit`:

```ts
const database = {
	getPost(slug: string | undefined): Promise<string> {
		return Promise.resolve('hello world');
	}
};
// ---cut---
// src/routes/blog/[slug]/+page.server.ts
import type { ServerLoadEvent } from '@sveltejs/kit';

export async function load(event: ServerLoadEvent) {
	return {
		post: await database.getPost(event.params.post)
	};
}
```

This works, but we can do better. Notice that we accidentally wrote `event.params.post`, even though the parameter is called `slug` (because of the `[slug]` in the filename) rather than `post`. You could type `params` yourself by adding a generic argument to `ServerLoadEvent`, but that's brittle.

This is where our automatic type generation comes in. Every route directory has a hidden `$types.d.ts` file with route-specific types:

```diff
// src/routes/blog/[slug]/+page.server.ts
-import type { ServerLoadEvent } from '@sveltejs/kit';
+import type { PageServerLoadEvent } from './$types';

export async function load(event: PageServerLoadEvent) {
    return {
-        post: await database.getPost(event.params.post)
+        post: await database.getPost(event.params.slug)
    };
}
```

This reveals our typo, as it now errors on the `params.post` property access. Besides narrowing the parameter types, it also narrows the types for `await event.parent()` and the `data` passed from a server `load` function to a universal `load` function. Notice that we’re now using `PageServerLoadEvent`, to distinguish it from `LayoutServerLoadEvent`.

After we have loaded our data, we want to display it in our `+page.svelte`. The same type generation mechanism ensures that the type of `data` is correct:

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>{data.post.title}</h1>

<div>{@html data.post.content}</div>
```

## Virtual files

When running the dev server or the build, types are auto-generated. Thanks to the file-system based routing, SvelteKit is able to infer things like the correct parameters or parent data by traversing the route tree. The result is outputted into one `$types.d.ts` file for each route, which looks roughly like this:

```ts
// @errors: 2344 2694 2307
// $types.d.ts
import type * as Kit from '@sveltejs/kit';

// types inferred from the routing tree
type RouteParams = { slug: string };
type RouteId = '/blog/[slug]';
type PageParentData = {};

// PageServerLoad type extends the generic Load type and fills its generics with the info we have
export type PageServerLoad = Kit.ServerLoad<RouteParams, PageParentData, RouteId>;

// The input parameter type of the load function
export type PageServerLoadEvent = Parameters<PageServerLoad>[0];

// The return type of the load function
export type PageData = Kit.ReturnType<
	typeof import('../src/routes/blog/[slug]/+page.server.js').load
>;
```

We don't actually write `$types.d.ts` into your `src` directory — that would be messy, and no-one likes messy code. Instead, we use a TypeScript feature called [`rootDirs`](https://www.typescriptlang.org/tsconfig#rootDirs), which lets us map ‘virtual’ directories to real ones. By setting `rootDirs` to the project root (the default) and additionally to `.svelte-kit/types` (the output folder of all the generated types) and then mirroring the route structure inside it we get the desired behavior:

```
// on disk:
.svelte-kit/
├ types/
│ ├ src/
│ │ ├ routes/
│ │ │ ├ blog/
│ │ │ │ ├ [slug]/
│ │ │ │ │ └ $types.d.ts
src/
├ routes/
│ ├ blog/
│ │ ├ [slug]/
│ │ │ ├ +page.server.ts
│ │ │ └ +page.svelte


// what TypeScript sees:
src/
├ routes/
│ ├ blog/
│ │ ├ [slug]/
│ │ │ ├ $types.d.ts
│ │ │ ├ +page.server.ts
│ │ │ └ +page.svelte
```

## Type safety without types

Thanks to the automatic type generation we get advanced type safety. Wouldn't it be great though if we could just omit writing the types at all? As of today you can do exactly that:

```diff
// src/routes/blog/[slug]/+page.server.ts
-import type { PageServerLoadEvent } from './$types';

-export async function load(event: PageServerLoadEvent) {
+export async function load(event) {
    return {
        post: await database.getPost(event.params.post)
    };
}
```

```diff
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
-    import type { PageData } from './$types';
-    export let data: PageData;
+    export let data;
</script>
```

While this is super convenient, this isn't just about that. It's also about _correctness_: When copying and pasting code it's easy to accidentally get `PageServerLoadEvent` mixed up with `LayoutServerLoadEvent` or `PageLoadEvent`, for example — similar types with subtle differences. Svelte's major insight was that by writing code in a declarative way we can get the machine to do the bulk of the work for us, correctly and efficiently. This is no different — by leveraging strong framework conventions like `+page` files, we can make it easier to do the right thing than to do the wrong thing.

This works for all exports from SvelteKit files (`+page`, `+layout`, `+server`, `hooks`, `params` and so on) and for `data`, `form` and `snapshot` properties in `+page/layout.svelte` files.

To use this feature with VS Code install the latest version of the Svelte for VS Code extension. For other IDEs, use the latest versions of the Svelte language server and the Svelte TypeScript plugin. Beyond the editor, our command line tool `svelte-check` also knows how to add these annotations since version 3.1.1.

## How does it work?

Getting this to work required changes to both the language server (which powers the IntelliSense in Svelte files) and the TypeScript plugin (which makes TypeScript understand Svelte files from within `.ts/js` files). In both we auto-insert the correct types at the correct positions and tell TypeScript to use our virtual augmented file instead of the original untyped file. That in combination with mapping the generated and original positions back and forth gives the desired result. Since `svelte-check` reuses parts of the language server under the hood, it gets that feature for free without further adjustments.

We'd like to thank the Next.js team for [inspiring](https://twitter.com/shuding_/status/1625263297573400578) this feature.

## What's next

For the future we want to look into making even more areas of SvelteKit type-safe — links for example, be it in your HTML or through programmatically calling `goto`.

TypeScript is eating the JavaScript world — and we're here for it! We care deeply about first class type safety in SvelteKit, and we provide you the tools to make the experience as smooth as possible — one that also scales beautifully to larger Svelte code bases — regardless of whether you use TypeScript or typed JavaScript through JSDoc.
