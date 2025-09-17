## await_invalid

> Encountered asynchronous work while rendering synchronously.

You (or the framework you're using) used `render` with an async component. Either use `renderAsync` or wrap the async component in a `svelte:boundary` with a `pending` snippet.

## experimental_async_ssr

> Attempted to use `renderAsync` without `experimental.async` enabled

Set `experimental.async: true` in your compiler options to use async server rendering.
