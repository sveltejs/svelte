## async_in_sync

> Encountered asynchronous work while rendering synchronously.

You (or the framework you're using) used `render` with an async component. Either use `renderAsync` or wrap the async component in a `svelte:boundary` with a `pending` snippet.
