---
title: "`hydratable`"
---

In Svelte, when you want to render asynchonous content data on the server, you can simply `await` it. This is great! However, it comes with a major pitall: when hydrating that content on the client, Svelte has to redo the asynchronous work, which blocks hydration for however long it takes:

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

That's silly, though. If we've already done the hard work of getting the data on the server, we don't want to get it again during hydration on the client. `hydratable` is a low-level API build to solve this problem. You probably won't need this very often -- it will probably be used behind the scenes by whatever datafetching library you use. For example, it powers [remote functions in SvelteKit](/docs/kit/remote-functions).

To fix the example above:

```svelte
<script>
  import { hydratable } from 'svelte';
  import { getUser } from 'my-database-library';

  // During server rendering, this will serialize and stash the result of `getUser`, associating
  // it with the provided key and baking it into the `head` content. During hydration, it will 
  // look for the serialized version, returning it instead of running `getUser`. After hydration
  // is done, if it's called again, it'll simply invoke `getUser`.
  const user = await hydratable('user', getUser());
</script>

<h1>{user.name}</h1>
```

This API can also be used to provide access to random or time-based values that are stable between server rendering and hydration. For example, to get a random number that doesn't update on hydration:

```ts
import { hydratable } from 'svelte';
const rand = hydratable('random', () => Math.random());
```

If you're a library author, be sure to prefix the keys of your `hydratable` values with the name of your library so that your keys don't conflict with other libraries.

## Imperative API

If you're writing a library with separate server and client exports, it may be more convenient to use the imperative API:

```ts
import { hydratable } from 'svelte';

const value = hydratable.get('foo'); // only works on the client
const hasValue = hydratable.has('foo');
hydratable.set('foo', 'whatever value you want'); // only works on the server
```

## Custom serialization

By default, Svelte uses [`devalue`](https://npmjs.com/package/devalue) to serialize your data on the server so that decoding it on the client requires no dependencies. If you need to serialize additional things not covered by `devalue`, you can provide your own transport mechanisms by writing custom `encode` and `decode` methods.

### `encode`

Encode receives a value and outputs _the JavaScript code necessary to create that value on the client_. For example, Svelte's built-in encoder looks like this:

```ts
const encode = (value) => devalue.uneval(value);
encode(['hello', 'world']); // outputs `['hello', 'world']`
```

### `decode`

`decode` accepts whatever the JavaScript that `encode` outputs resolves to, and returns whatever the final value from `hydratable` should be.

### Usage

When using the isomorphic API, you must provide either `encode` or `decode`, depending on the environment. This enables your bundler to treeshake the unneeded code during your build:

```svelte
<script>
  import { hydratable } from 'svelte';
  import { BROWSER } from 'esm-env';
  import { encode, decode } from '$lib/encoders';

  const random = hydratable('random', () => Math.random(), { transport: BROWSER ? { decode } : { encode }});
</script>
```

For the imperative API, you just provide `encode` or `decode` depending on which method you're using:

```ts
import { hydratable } from 'svelte';
import { encode, decode } from '$lib/encoders';

const random = hydratable.get('random', { decode });
hydratable.set('random', Math.random(), { encode });
```
