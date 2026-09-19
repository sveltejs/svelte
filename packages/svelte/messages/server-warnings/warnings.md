## derived_reassignment

> Assignment to derived state on the server is permanent and will not be recalculated when its dependencies change, unlike on the client where it is temporary

This warning is emitted when you reassign a value created with `$derived` or `$derived.by` while compiling with `generate: 'server'`. There is no reactivity on the server — derived values do not recompute when dependencies change, including overridden values. On the client, overrides are temporary and discarded when dependencies change.

## unresolved_hydratable

> A `hydratable` value with key `%key%` was created, but at least part of it was not used during the render.
>
> The `hydratable` was initialized in:
> %stack%

The most likely cause of this is creating a `hydratable` in the `script` block of your component and then `await`ing
the result inside a `svelte:boundary` with a `pending` snippet:

```svelte
<script>
  import { hydratable } from 'svelte';
	import { getUser } from '$lib/get-user.js';

	const user = hydratable('user', getUser);
</script>

<svelte:boundary>
	<h1>{(await user).name}</h1>

	{#snippet pending()}
		<div>Loading...</div>
	{/snippet}
</svelte:boundary>
```

Consider inlining the `hydratable` call inside the boundary so that it's not called on the server.

Note that this can also happen when a `hydratable` contains multiple promises and some but not all of them have been used.
