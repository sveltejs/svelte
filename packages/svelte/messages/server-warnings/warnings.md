## unresolved_warp

> Part of the data added to `Warp` instances was not used during the render, so the response was delayed until it resolved%details%

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

With `experimental.streaming`, values that are added inside a pending boundary are streamed to the client instead of delaying the response, so moving the call inside the boundary means its result is still sent to the client.

## warp_stream_serialization_failed

> Failed to serialize data added to a `Warp` after the rendered HTML was generated, so the client will need to load it itself.
>
> Cause:
> %stack%

With `experimental.streaming`, values added to a `Warp` inside a pending boundary are sent to the client after the rendered HTML. At that point it's too late to fail the render, so values that can't be serialized are skipped (or, if they're promises, rejected on the client) instead. To serialize other values, pass a `replacer` to `render` or `withWarp`.
