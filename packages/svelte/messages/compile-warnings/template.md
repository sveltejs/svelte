## attribute_avoid_is

> The "is" attribute is not supported cross-browser and should be avoided

## attribute_global_event_reference

> You are referencing `globalThis.%name%`. Did you forget to declare a variable with that name?

## attribute_illegal_colon

> Attributes should not contain ':' characters to prevent ambiguity with Svelte directives

## attribute_invalid_property_name

> '%wrong%' is not a valid HTML attribute. Did you mean '%right%'?

## attribute_quoted

> Quoted attributes on components and custom elements will be stringified in a future version of Svelte. If this isn't what you want, remove the quotes

## bind_invalid_each_rest

> The rest operator (...) will create a new object and binding '%name%' with the original object will not work

## block_empty

> Empty block

## component_name_lowercase

> `<%name%>` will be treated as an HTML element unless it begins with a capital letter

## element_invalid_self_closing_tag

> Self-closing HTML tags for non-void elements are ambiguous — use `<%name% ...></%name%>` rather than `<%name% ... />`

## event_directive_deprecated

> Using `on:%name%` to listen to the %name% event is deprecated. Use the event attribute `on%name%` instead

## node_invalid_placement_ssr

> %thing% is invalid inside `<%parent%>`. When rendering this component on the server, the resulting HTML will be modified by the browser, likely resulting in a `hydration_mismatch` warning

HTML restricts where certain elements can appear. In case of a violation the browser will 'repair' the HTML in a way that breaks Svelte's assumptions about the structure of your components. Some examples:

- `<p>hello <div>world</div></p>` will result in `<p>hello </p><div>world</div><p></p>` for example (the `<div>` autoclosed the `<p>` because `<p>` cannot contain block-level elements)
- `<option><div>option a</div></option>` will result in `<option>option a</option>` (the `<div>` is removed)
- `<table><tr><td>cell</td></tr></table>` will result in `<table><tbody><tr><td>cell</td></tr></tbody></table>` (a `<tbody>` is auto-inserted)

This code will work when the component is rendered on the client (which is why this is a warning rather than an error), but if you use server rendering it will cause hydration to fail.

## slot_element_deprecated

> Using `<slot>` to render parent content is deprecated. Use `{@render ...}` tags instead

## svelte_component_deprecated

> `<svelte:component>` is deprecated in runes mode — components are dynamic by default

In previous versions of Svelte, the component constructor was fixed when the component was rendered. In other words, if you wanted `<X>` to re-render when `X` changed, you would either have to use `<svelte:component this={X}>` or put the component inside a `{#key X}...{/key}` block.

In Svelte 5 this is no longer true — if `X` changes, `<X>` re-renders. For more complex expressions like `condition ? Y : Z` you can use a derived value instead.

## svelte_element_invalid_this

> `this` should be an `{expression}`. Using a string attribute value will cause an error in future versions of Svelte
