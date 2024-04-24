## invalid_svelte_option_attribute

> `<svelte:options>` can only receive static attributes

## invalid_svelte_option_namespace

> Unsupported `<svelte:option>` value for "namespace". Valid values are "html", "svg" or "foreign"

## tag_option_deprecated

> "tag" option is deprecated — use "customElement" instead

## invalid_svelte_option_runes

> Unsupported `<svelte:option>` value for "runes". Valid values are true or false

## invalid_svelte_option_accessors

> Unsupported `<svelte:option>` value for "accessors". Valid values are true or false

## invalid_svelte_option_preserveWhitespace

> Unsupported `<svelte:option>` value for "preserveWhitespace". Valid values are true or false

## invalid_svelte_option_immutable

> Unsupported `<svelte:option>` value for "immutable". Valid values are true or false

## invalid_tag_property

> Tag name must be two or more words joined by the "-" character

## invalid_svelte_option_customElement

> "customElement" must be a string literal defining a valid custom element name or an object of the form { tag: string; shadow?: "open" | "none"; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }

## invalid_customElement_props_attribute

> "props" must be a statically analyzable object literal of the form "{ [key: string]: { attribute?: string; reflect?: boolean; type?: "String" | "Boolean" | "Number" | "Array" | "Object" }"

## invalid_customElement_shadow_attribute

> "shadow" must be either "open" or "none"

## unknown_svelte_option_attribute

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