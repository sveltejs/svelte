## await_invalid

> Encountered asynchronous work while rendering synchronously.

You (or the framework you're using) called [`render(...)`](svelte-server#render) with a component containing an `await` expression. Either `await` the result of `render` or wrap the `await` (or the component containing it) in a [`<svelte:boundary>`](svelte-boundary) with a `pending` snippet.

## html_deprecated

> The `html` property of server render results has been deprecated. Use `body` instead.

## hydratable_clobbering

> Attempted to set hydratable with key `%key%` twice with different values.
>
> First instance occurred at:
> %stack%
>
> Second instance occurred at:
> %stack2%

This error occurs when using `hydratable` multiple times with the same key. To avoid this, you can:
- Ensure all invocations with the same key result in the same value
- Update the keys to make both instances unique

```svelte
<script>
  import { hydratable } from 'svelte';
  await Promise.all([
    // which one should "win" and be serialized in the rendered response?
    hydratable('hello', () => 'world'),
    hydratable('hello', () => 'dad')
  ])
</script>
```

## lifecycle_function_unavailable

> `%name%(...)` is not available on the server

Certain methods such as `mount` cannot be invoked while running in a server context. Avoid calling them eagerly, i.e. not during render.

## render_context_unavailable

> Failed to retrieve `render` context. %addendum%
If `AsyncLocalStorage` is available, you're likely calling a function that needs access to the `render` context (`hydratable`, `cache`, or something that depends on these) from outside of `render`. If `AsyncLocalStorage` is not available, these functions must also be called synchronously from within `render` -- i.e. not after any `await`s.
