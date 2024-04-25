## attribute_avoid_is

> The "is" attribute is not supported cross-browser and should be avoided

## attribute_global_event_reference

> You are referencing `globalThis.%name%`. Did you forget to declare a variable with that name?

## attribute_illegal_colon

> Attributes should not contain ':' characters to prevent ambiguity with Svelte directives

## attribute_invalid_property_name

> '%wrong%' is not a valid HTML attribute. Did you mean '%right%'?

## bind_invalid_each_rest

> The rest operator (...) will create a new object and binding '%name%' with the original object will not work

## block_empty

> Empty block

## component_name_lowercase

> `<%name%>` will be treated as an HTML element unless it begins with a capital letter

## element_invalid_self_closing_tag

> Self-closing HTML tags for non-void elements are ambiguous — use `<%name% ...></%name%>` rather than `<%name% ... />`

## event_directive_deprecated

> Using `on:%name%` to listen to the %name% event is deprecated. Use the event attribute `on%name%` instead.

## slot_element_deprecated

> Using `<slot>` to render parent content is deprecated. Use `{@render ...}` tags instead.
