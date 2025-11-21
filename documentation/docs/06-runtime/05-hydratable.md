---
title: Hydratable data
---

In Svelte, when you want to render asynchonous content data on the server, you can simply `await` it. This is great! However, it comes with a pitall: when hydrating that content on the client, Svelte has to redo the asynchronous work, which blocks hydration for however long it takes:

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

That's silly, though. If we've already done the hard work of getting the data on the server, we don't want to get it again during hydration on the client. `hydratable` is a low-level API built to solve this problem. You probably won't need this very often -- it will be used behind the scenes by whatever datafetching library you use. For example, it powers [remote functions in SvelteKit](/docs/kit/remote-functions).

To fix the example above:

```svelte
<script>
  import { hydratable } from 'svelte';
  import { getUser } from 'my-database-library';

  // During server rendering, this will serialize and stash the result of `getUser`, associating
  // it with the provided key and baking it into the `head` content. During hydration, it will
  // look for the serialized version, returning it instead of running `getUser`. After hydration
  // is done, if it's called again, it'll simply invoke `getUser`.
  const user = await hydratable('user', getUser);
</script>

<h1>{user.name}</h1>
```

This API can also be used to provide access to random or time-based values that are stable between server rendering and hydration. For example, to get a random number that doesn't update on hydration:

```ts
import { hydratable } from 'svelte';
const rand = hydratable('random', () => Math.random());
```

If you're a library author, be sure to prefix the keys of your `hydratable` values with the name of your library so that your keys don't conflict with other libraries.

## Serialization

All data returned from a `hydratable` function must be serializable. Not to fear, though -- this doesn't mean you're limited to JSON! Svelte uses [`devalue`](https://npmjs.com/package/devalue) for serialization, which means it can serialize all sorts of things, including `Map`, `Set`, `URL`, and `BigInt`. Check the documentation page for a full list. In addition to these, thanks to some Svelte magic, you can also fearlessly use promises:

```svelte
<script>
  import { hydratable } from 'svelte';
  const promises = hydratable('random', () => {
    return {
      one: Promise.resolve(1),
      two: Promise.resolve(2)
    }
  });
</script>

{await promises.one}
{await promises.two}
```
