## svelte_options_invalid_attribute

> `<svelte:options>` can only receive static attributes

## svelte_options_invalid_attribute_value

> Valid values are %list%

## svelte_options_deprecated_tag

> "tag" option is deprecated — use "customElement" instead

## svelte_options_invalid_tagname

> Tag name must be two or more words joined by the "-" character

## svelte_options_invalid_customelement

> "customElement" must be a string literal defining a valid custom element name or an object of the form { tag: string; shadow?: "open" | "none"; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }

## svelte_options_invalid_customelement_props

> "props" must be a statically analyzable object literal of the form "{ [key: string]: { attribute?: string; reflect?: boolean; type?: "String" | "Boolean" | "Number" | "Array" | "Object" }"

## svelte_options_invalid_customelement_shadow

> "shadow" must be either "open" or "none"

## svelte_options_unknown_attribute

> `<svelte:options>` unknown attribute '%name%'

## illegal_svelte_head_attribute

> `<svelte:head>` cannot have attributes nor directives

## invalid_svelte_fragment_attribute

> `<svelte:fragment>` can only have a slot attribute and (optionally) a let: directive

## invalid_svelte_fragment_slot

> `<svelte:fragment>` slot attribute must have a static value

## invalid_svelte_fragment_placement

> `<svelte:fragment>` must be the direct child of a component

## invalid_svelte_element_placement

> <%name%> tags cannot be inside elements or blocks

## duplicate_svelte_element

> A component can only have one <%name%> element

## invalid_self_placement

> `<svelte:self>` components can only exist inside {#if} blocks, {#each} blocks, {#snippet} blocks or slots passed to components

## missing_svelte_element_definition

> `<svelte:element>` must have a 'this' attribute

## missing_svelte_component_definition

> `<svelte:component>` must have a 'this' attribute

## invalid_svelte_element_definition

> Invalid element definition — must be an {expression}

## invalid_svelte_component_definition

> Invalid component definition — must be an {expression}

## invalid_svelte_tag

> Valid `<svelte:...>` tag names are %list%

## conflicting_slot_usage

> Cannot use `<slot>` syntax and `{@render ...}` tags in the same component. Migrate towards `{@render ...}` tags completely.
