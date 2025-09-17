## await_invalid

> Encountered asynchronous work while rendering synchronously.

You (or the framework you're using) called [`render(...)`](svelte-server#render) with a component containing an `await` expression. Either use `renderAsync(...)` or wrap the `await` (or the component containing it) in a [`<svelte:boundary>`](svelte-boundary) with a `pending` snippet.

## experimental_async_ssr

> Attempted to use `renderAsync` without `experimental.async` enabled

Set `experimental.async: true` in your compiler options (usually in `svelte.config.js`) to use async server rendering.
