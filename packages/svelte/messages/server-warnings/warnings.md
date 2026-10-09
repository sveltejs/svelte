## unresolved_warp

> The value with key `%key%` in `Warp` `%id%` was created, but at least part of it was not used during the render.
>
> The value was set in:
> %stack%

The server has to wait for this value to resolve before it can send the rendered HTML, which delays the response even though the value was not needed for the render.

The most likely cause of this is creating a value in the `script` block of your component and then `await`ing
the result inside a `svelte:boundary` with a `pending` snippet:

```svelte
<script>
	import { Warp } from 'svelte';
	import { getUser } from '$lib/get-user.js';

	const warp = new Warp('my-app');
	const user = warp.getOrInsertComputed('user', getUser);
</script>

<svelte:boundary>
	<h1>{(await user).name}</h1>

	{#snippet pending()}
		<div>Loading...</div>
	{/snippet}
</svelte:boundary>
```

Consider moving the `getOrInsertComputed` call inside the boundary so that it's not called on the server.

Note that this can also happen when a value contains multiple promises and some but not all of them have been used.
