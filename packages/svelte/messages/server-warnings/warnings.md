## unused_hydratable

> A `hydratable` value with key `%key%` was created, but not used during the render.
>
> Stack:
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
