## hydration_attribute_changed

> The `%attribute%` attribute on `%html%` changed its value between server and client renders. The client value, `%value%`, will be ignored in favour of the server value

## hydration_html_changed

> The value of an `{@html ...}` block changed between server and client renders. The client value will be ignored in favour of the server value

> The value of an `{@html ...}` block %location% changed between server and client renders. The client value will be ignored in favour of the server value

## hydration_mismatch

> Hydration failed because the initial UI does not match what was rendered on the server

> Hydration failed because the initial UI does not match what was rendered on the server. The error occurred near %location%

## lifecycle_double_unmount

> Tried to unmount a component that was not mounted

## ownership_invalid_binding

> %parent% passed a value to %child% with `bind:`, but the value is owned by %owner%. Consider creating a binding between %owner% and %parent%

## ownership_invalid_mutation

> Mutating a value outside the component that created it is strongly discouraged. Consider passing values to child components with `bind:`, or use a callback instead

> %component% mutated a value owned by %owner%. This is strongly discouraged. Consider passing values to child components with `bind:`, or use a callback instead

## state_proxy_equality_mismatch

> Reactive `$state(...)` proxies and the values they proxy have different identities. Because of this, comparisons with `%operator%` will produce unexpected results. Consider using `$state.is(a, b)` instead
