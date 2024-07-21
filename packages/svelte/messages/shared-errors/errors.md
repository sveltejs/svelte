## invalid_default_snippet

> Cannot use `{@render children(...)}` if the parent component uses `let:` directives. Consider using a named snippet instead

## lifecycle_outside_component

> `%name%(...)` can only be used during component initialisation

## render_tag_invalid_argument

> The argument to `{@render ...}` must be a snippet function, not a component or a slot with a `let:` directive or some other kind of function. If you want to dynamically render one snippet or another, use `$derived` and pass its result to `{@render ...}`

## snippet_used_as_component

> A snippet must be rendered with `{@render ...}`

## store_invalid_shape

> `%name%` is not a store with a `subscribe` method

## svelte_element_invalid_this_value

> The `this` prop on `<svelte:element>` must be a string, if defined
