## invalid_svelte_option_attribute

<svelte:options> can only receive static attributes

## invalid_svelte_option_namespace

Unsupported <svelte:option> value for "namespace". Valid values are "html", "svg" or "foreign".

## tag_option_deprecated

"tag" option is deprecated — use "customElement" instead

## invalid_svelte_option_runes

Unsupported <svelte:option> value for "runes". Valid values are true or false.

## invalid_svelte_option_accessors

TODO

## invalid_svelte_option_preserveWhitespace

TODO

## invalid_svelte_option_immutable

TODO

## invalid_tag_property

TODO

## invalid_svelte_option_customElement

TODO

## invalid_customElement_props_attribute

TODO

## invalid_customElement_shadow_attribute

TODO

## unknown_svelte_option_attribute

<svelte:options> unknown attribute '%name%'

## illegal_svelte_head_attribute

TODO

## invalid_svelte_fragment_attribute

<svelte:fragment> can only have a slot attribute and (optionally) a let: directive

## invalid_svelte_fragment_slot

<svelte:fragment> slot attribute must have a static value

## invalid_svelte_fragment_placement

<svelte:fragment> must be the direct child of a component

## invalid_svelte_element_placement

<%name%> tags cannot be inside elements or blocks

## duplicate_svelte_element

A component can only have one <%name%> element

## invalid_self_placement

<svelte:self> components can only exist inside {#if} blocks, {#each} blocks, {#snippet} blocks or slots passed to components

## missing_svelte_element_definition

<svelte:element> must have a 'this' attribute

## missing_svelte_component_definition

<svelte:component> must have a 'this' attribute

## invalid_svelte_element_definition

Invalid element definition — must be an {expression}

## invalid_svelte_component_definition

Invalid component definition — must be an {expression}

## invalid_svelte_tag

Valid <svelte:...> tag names are %list(tags)%%match ? ' (did you mean ' + match + '?)' : ''%

## conflicting_slot_usage

Cannot use <slot> syntax and {@render ...} tags in the same component. Migrate towards {@render ...} tags completely.