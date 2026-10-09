## async_local_storage_unavailable

> The node API `AsyncLocalStorage` is not available, but is required to use async server rendering.

Some platforms require configuration flags to enable this API. Consult your platform's documentation.

## await_invalid

> Encountered asynchronous work while rendering synchronously.

You (or the framework you're using) called [`render(...)`](svelte-server#render) with a component containing an `await` expression. Either `await` the result of `render` or wrap the `await` (or the component containing it) in a [`<svelte:boundary>`](svelte-boundary) with a `pending` snippet.

## dynamic_element_invalid_tag

> `<svelte:element this="%tag%">` is not a valid element name — the element will not be rendered

The value passed to the `this` prop of `<svelte:element>` must be a valid HTML element, SVG element, MathML element, or custom element name. A value containing invalid characters (such as whitespace or special characters) was provided, which could be a security risk. Ensure only valid tag names are passed.

## html_deprecated

> The `html` property of server render results has been deprecated. Use `body` instead.

## hydratable_clobbering

> Attempted to set `hydratable` with key `%key%` twice with different values.
>
> %stack%

This error occurs when using `hydratable` multiple times with the same key. To avoid this, you can:
- Ensure all invocations with the same key result in the same value
- Update the keys to make both instances unique

```svelte
<script>
  import { hydratable } from 'svelte';

  // which one should "win" and be serialized in the rendered response?
  const one = hydratable('not-unique', () => 1);
  const two = hydratable('not-unique', () => 2);
</script>
```

## invalid_csp

> `csp.nonce` was set while `csp.hash` was `true`. These options cannot be used simultaneously.

## invalid_id_prefix

> The `idPrefix` option cannot include `--`.

## lifecycle_function_unavailable

> `%name%(...)` is not available on the server

Certain methods such as `mount` cannot be invoked while running in a server context. Avoid calling them eagerly, i.e. not during render.

## server_context_required

> Could not resolve `render` context.

Certain functions such as `Warp` methods cannot be invoked outside of a `render(...)` or `withWarp(...)` call, such as at the top level of a module.

## warp_context_already_rendered

> `render(...)` was called more than once inside the same `withWarp(...)` call

Each `withWarp` call can only contain one `render`, since all the values added to `Warp` instances inside it are serialized into that render's output. If you need to render more than once, use a separate `withWarp` call for each render.

## warp_context_nested

> `withWarp(...)` cannot be called inside another `withWarp(...)` or `render(...)` call

## warp_method_unsupported

> `warp.%method%(...)` is not supported on the server

Values added to a `Warp` on the server may already be in use (or on their way to the client), so they cannot be removed.

## warp_serialization_failed

> Failed to serialize data added to a `Warp`.
>
> `Warp` can serialize anything [`uneval` from `devalue`](https://npmjs.com/package/devalue) can, including promises. To serialize other values, pass a `replacer` to `render` or `withWarp`.
>
> Cause:
> %stack%

## warp_set_after_render

> Cannot set key `%key%` in `Warp` `%id%` after its values have been serialized

Values can be added to a `Warp` until the rendered HTML has been generated, after which they can no longer be sent to the client.
