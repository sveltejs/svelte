## binding_property_non_reactive

> `%binding%` is binding to a non-reactive property

> `%binding%` (%location%) is binding to a non-reactive property

## event_handler_invalid

> %handler% should be a function. Did you mean to %suggestion%?

## hydration_attribute_changed

> The `%attribute%` attribute on `%html%` changed its value between server and client renders. The client value, `%value%`, will be ignored in favour of the server value

## hydration_html_changed

> The value of an `{@html ...}` block changed between server and client renders. The client value will be ignored in favour of the server value

> The value of an `{@html ...}` block %location% changed between server and client renders. The client value will be ignored in favour of the server value

## hydration_mismatch

> Hydration failed because the initial UI does not match what was rendered on the server

> Hydration failed because the initial UI does not match what was rendered on the server. The error occurred near %location%

## invalid_raw_snippet_render

> The `render` function passed to `createRawSnippet` should return HTML for a single element

## lifecycle_double_unmount

> Tried to unmount a component that was not mounted

## ownership_invalid_binding

> %parent% passed a value to %child% with `bind:`, but the value is owned by %owner%. Consider creating a binding between %owner% and %parent%

## ownership_invalid_mutation

> Mutating a value outside the component that created it is strongly discouraged. Consider passing values to child components with `bind:`, or use a callback instead

> %component% mutated a value owned by %owner%. This is strongly discouraged. Consider passing values to child components with `bind:`, or use a callback instead

## state_proxy_equality_mismatch

> Reactive `$state(...)` proxies and the values they proxy have different identities. Because of this, comparisons with `%operator%` will produce unexpected results

`$state(...)` creates a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) of the value it is passed. The proxy and the value have different identities, meaning equality checks will always return `false`:

```svelte
<script>
	let value = { foo: 'bar' };
	let proxy = $state(value);

	value === proxy; // always false
</script>
```

To resolve this, ensure you're comparing values where both values were created with `$state(...)`, or neither were. Note that `$state.raw(...)` will _not_ create a state proxy.
