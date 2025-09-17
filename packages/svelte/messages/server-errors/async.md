## await_invalid

> Encountered asynchronous work while rendering synchronously.

You (or the framework you're using) called [`render(...)`](svelte-server#render) with a component containing an `await` expression. Either `await` the result of `render` or wrap the `await` (or the component containing it) in a [`<svelte:boundary>`](svelte-boundary) with a `pending` snippet.
