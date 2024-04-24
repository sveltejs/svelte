## animation_invalid_placement

> An element that uses the `animate:` directive must be the only child of a keyed `{#each ...}` block

## animation_missing_key

> An element that uses the `animate:` directive must be the only child of a keyed `{#each ...}` block. Did you forget to add a key to your each block?

## animation_duplicate

> An element can only have one 'animate' directive

## event_handler_invalid_modifier

> Valid event modifiers are %list%

## event_handler_invalid_modifier_combination

> The '%modifier1%' and '%modifier2%' modifiers cannot be used together

## event_handler_invalid_component_modifier

> Event modifiers other than 'once' can only be used on DOM elements

## slot_snippet_conflict

> Cannot use `<slot>` syntax and `{@render ...}` tags in the same component. Migrate towards `{@render ...}` tags completely.

## svelte_component_invalid_this

> Invalid component definition — must be an `{expression}`

## svelte_component_missing_this

> `<svelte:component>` must have a 'this' attribute

## svelte_element_invalid_this

> Invalid element definition — must be an `{expression}`

## svelte_element_missing_this

> `<svelte:element>` must have a 'this' attribute

## svelte_fragment_invalid_attribute

> `<svelte:fragment>` can only have a slot attribute and (optionally) a let: directive

## svelte_fragment_invalid_slot

> `<svelte:fragment>` slot attribute must have a static value

## svelte_fragment_invalid_placement

> `<svelte:fragment>` must be the direct child of a component

## svelte_head_illegal_attribute

> `<svelte:head>` cannot have attributes nor directives

## svelte_meta_invalid_placement

> `<%name%>` tags cannot be inside elements or blocks

## svelte_meta_duplicate

> A component can only have one `<%name%>` element

## svelte_meta_invalid_tag

> Valid `<svelte:...>` tag names are %list%

## svelte_options_deprecated_tag

> "tag" option is deprecated — use "customElement" instead

## svelte_options_invalid_attribute

> `<svelte:options>` can only receive static attributes

## svelte_options_invalid_attribute_value

> Valid values are %list%

## svelte_options_invalid_customelement

> "customElement" must be a string literal defining a valid custom element name or an object of the form { tag: string; shadow?: "open" | "none"; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }

## svelte_options_invalid_customelement_props

> "props" must be a statically analyzable object literal of the form "{ [key: string]: { attribute?: string; reflect?: boolean; type?: "String" | "Boolean" | "Number" | "Array" | "Object" }"

## svelte_options_invalid_customelement_shadow

> "shadow" must be either "open" or "none"

## svelte_options_invalid_tagname

> Tag name must be two or more words joined by the "-" character

## svelte_options_unknown_attribute

> `<svelte:options>` unknown attribute '%name%'

## svelte_self_invalid_placement

> `<svelte:self>` components can only exist inside `{#if}` blocks, `{#each}` blocks, `{#snippet}` blocks or slots passed to components

## transition_duplicate

> Cannot use multiple `%type%:` directives on a single element

## transition_conflict

> Cannot use `%type%:` alongside existing `%existing%:` directive
