---
title: Warp
---

In Svelte, when you want to render asynchronous content data on the server, you can simply `await` it. This is great! However, it comes with a pitfall: when hydrating that content on the client, Svelte has to redo the asynchronous work, which blocks hydration for however long it takes:

```svelte
<script>
  import { getUser } from 'my-database-library';

  // This will get the user on the server, render the user's name into the h1,
  // and then, during hydration on the client, it will get the user _again_,
  // blocking hydration until it's done.
  const user = await getUser();
</script>

<h1>{user.name}</h1>
```

That's silly, though. If we've already done the hard work of getting the data on the server, we don't want to get it again during hydration on the client. `Warp` is a low-level API built to solve this problem. You probably won't need this very often — it will be used behind the scenes by whatever datafetching library you use. For example, it powers [remote functions in SvelteKit](/docs/kit/remote-functions).

A `Warp` is a [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) whose contents are sent from the server to the client. Anything you add to it while rendering on the server is serialized into the `head` returned from `render`, and is available in the `Warp` with the same id on the client. To fix the example above:

```svelte
<script>
  import { Warp } from 'svelte';
  import { getUser } from 'my-database-library';

  const warp = new Warp('my-app');

  // On the server, this calls `getUser` and stores the result. On the client,
  // the result from the server is already there, so `getUser` isn't called.
  const user = await warp.getOrInsertComputed('user', () => getUser());
</script>

<h1>{user.name}</h1>
```

This API can also be used to provide access to random or time-based values that are stable between server rendering and hydration. For example, to get a random number that doesn't update on hydration:

```ts
import { Warp } from 'svelte';

const warp = new Warp<string, number>('my-app');
const rand = warp.getOrInsertComputed('random', () => Math.random());
```

On the client, a `Warp` behaves like any other `Map` — values you add to it stay there until you remove them with `delete` or `clear`. On the server, each key can only be set once, and values can't be removed, since they may already be in use or on their way to the client. For the same reason, treat values as immutable once they've been added to a `Warp`.

Keys can be strings, numbers, booleans or bigints. If you're a library author, use your package name as the `Warp`'s id, so that it doesn't conflict with other libraries:

```js
import { Warp } from 'svelte';

const warp = new Warp('my-datafetching-library');
```

## Serialization

All data added to a `Warp` must be serializable. But this doesn't mean you're limited to JSON — Svelte uses [`devalue`](https://npmjs.com/package/devalue), which can serialize all sorts of things including `Map`, `Set`, `URL`, and `BigInt`. Check the documentation page for a full list. You can also fearlessly use promises:

```svelte
<script>
  import { Warp } from 'svelte';

  const warp = new Warp('my-app');

  const promises = warp.getOrInsertComputed('random', () => {
    return {
      one: Promise.resolve(1),
      two: Promise.resolve(2)
    }
  });
</script>

{await promises.one}
{await promises.two}
```

If a promise rejects, the promise on the client will reject too. The rejection reason is passed through the [`transformError`](svelte-server#render) option of `render` first, so that sensitive information doesn't leak to the client — if you don't provide `transformError`, the client receives a generic error instead.

To serialize other kinds of values, pass a `replacer` to `render`. It works like the replacer for devalue's [`uneval`](https://github.com/sveltejs/devalue#custom-types), receiving each value and a `js` tag that you can use to return the JavaScript that recreates it on the client:

```js
/// file: server.js
// @noErrors
import { render } from 'svelte/server';
import App from './App.svelte';
import { Vector } from './vector.js';
// ---cut---
const { head, body } = await render(App, {
	replacer: (value, js) => {
		if (value instanceof Vector) {
			return js`new Vector(${value.x}, ${value.y})`;
		}
	}
});
```

## Using `Warp` outside components

`Warp` can only be used on the server while rendering. If you need to add values before the render starts — for example, while loading data for a page — wrap the work in `withWarp`. A `render` inside `withWarp` will serialize everything added to `Warp` instances inside it:

```js
/// file: server.js
// @noErrors
import { render, withWarp } from 'svelte/server';
import { Warp } from 'svelte';
import App from './App.svelte';
import { getUser } from 'my-database-library';
// ---cut---
const warp = new Warp('my-app');

const { head, body } = await withWarp(async () => {
	const user = await warp.getOrInsertComputed('user', () => getUser());

	return render(App, { props: { user } });
});
```

`withWarp` also accepts a `replacer`, which is used for any values the `replacer` passed to `render` doesn't handle. Each `withWarp` can only contain one `render`.

## CSP

`Warp` adds an inline `<script>` block to the `head` returned from `render`. If you're using [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) (CSP), this script will likely fail to run. You can provide a `nonce` to `render`:

```js
/// file: server.js
import { render } from 'svelte/server';
import App from './App.svelte';
// ---cut---
const nonce = crypto.randomUUID();

const { head, body } = await render(App, {
	csp: { nonce }
});
```

This will add the `nonce` to the script block, on the assumption that you will later add the same nonce to the CSP header of the document that contains it:

```js
/// file: server.js
let response = new Response();
let nonce = 'xyz123';
// ---cut---
response.headers.set(
  'Content-Security-Policy',
  `script-src 'nonce-${nonce}'`
 );
```

It's essential that a `nonce` — which, British slang definition aside, means 'number used once' — is only used when dynamically server rendering an individual response.

If instead you are generating static HTML ahead of time, you must use hashes instead:

```js
/// file: server.js
import { render } from 'svelte/server';
import App from './App.svelte';
// ---cut---
const { head, body, hashes } = await render(App, {
	csp: { hash: true }
});
```

`hashes.script` will be an array of strings like `["sha256-abcd123"]`. As with `nonce`, the hashes should be used in your CSP header:

```js
/// file: server.js
let response = new Response();
let hashes = { script: ['sha256-xyz123'] };
// ---cut---
response.headers.set(
  'Content-Security-Policy',
  `script-src ${hashes.script.map((hash) => `'${hash}'`).join(' ')}`
 );
```

We recommend using `nonce` over hash if you can, as `hash` will interfere with streaming SSR in the future.

## `hydratable`

`hydratable` is the predecessor of `Warp`, and is deprecated. `hydratable(key, fn)` behaves like `warp.getOrInsertComputed(key, fn)`, except that on the client, it only uses the value from the server during hydration:

```js
// @noErrors
import { hydratable, Warp } from 'svelte';

// before
const user = await hydratable('user', () => getUser());

// after
const warp = new Warp('my-app');
const user = await warp.getOrInsertComputed('user', () => getUser());
```
