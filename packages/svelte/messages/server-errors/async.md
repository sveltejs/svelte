## async_in_sync

> Encountered asynchronous work while rendering synchronously.

You (or the framework you're using) used `render` with an async component. Either use `renderAsync` or wrap the async component in a `svelte:boundary` with a `pending` snippet.

## missing_experimental_flag

> Attempted to use `renderAsync` without `experimental.async` enabled

Set `experimental.async: true` in your compiler options to use async server rendering.
