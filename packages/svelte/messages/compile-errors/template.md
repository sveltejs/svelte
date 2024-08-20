## animation_duplicate

> An element can only have one 'animate' directive

## animation_invalid_placement

> An element that uses the `animate:` directive must be the only child of a keyed `{#each ...}` block

## animation_missing_key

> An element that uses the `animate:` directive must be the only child of a keyed `{#each ...}` block. Did you forget to add a key to your each block?

## attribute_contenteditable_dynamic

> 'contenteditable' attribute cannot be dynamic if element uses two-way binding

## attribute_contenteditable_missing

> 'contenteditable' attribute is required for textContent, innerHTML and innerText two-way bindings

## attribute_duplicate

> Attributes need to be unique

## attribute_empty_shorthand

> Attribute shorthand cannot be empty

## attribute_invalid_event_handler

> Event attribute must be a JavaScript expression, not a string

## attribute_invalid_multiple

> 'multiple' attribute must be static if select uses two-way binding

## attribute_invalid_name

> '%name%' is not a valid attribute name

## attribute_invalid_sequence_expression

> Sequence expressions are not allowed as attribute/directive values in runes mode, unless wrapped in parentheses

## attribute_invalid_type

> 'type' attribute must be a static text value if input uses two-way binding

## attribute_unquoted_sequence

> Attribute values containing `{...}` must be enclosed in quote marks, unless the value only contains the expression

## bind_invalid_expression

> Can only bind to an Identifier or MemberExpression

## bind_invalid_name

> `bind:%name%` is not a valid binding

> `bind:%name%` is not a valid binding. %explanation%

## bind_invalid_target

> `bind:%name%` can only be used with %elements%

## bind_invalid_value

> Can only bind to state or props

## block_duplicate_clause

> %name% cannot appear more than once within a block

## block_invalid_continuation_placement

> {:...} block is invalid at this position (did you forget to close the preceeding element or block?)

## block_invalid_elseif

> 'elseif' should be 'else if'

## block_invalid_placement

> {#%name% ...} block cannot be %location%

## block_unclosed

> Block was left open

## block_unexpected_character

> Expected a `%character%` character immediately following the opening bracket

## block_unexpected_close

> Unexpected block closing tag

## component_invalid_directive

> This type of directive is not valid on components

## component_invalid_name

> Component name must be a valid variable name or dot notation expression

## const_tag_cycle

> Cyclical dependency detected: %cycle%

## const_tag_invalid_expression

> {@const ...} must consist of a single variable declaration

## const_tag_invalid_placement

> `{@const}` must be the immediate child of `{#snippet}`, `{#if}`, `{:else if}`, `{:else}`, `{#each}`, `{:then}`, `{:catch}`, `<svelte:fragment>` or `<Component>`

## debug_tag_invalid_arguments

> {@debug ...} arguments must be identifiers, not arbitrary expressions

## directive_invalid_value

> Directive value must be a JavaScript expression enclosed in curly braces

## directive_missing_name

> `%type%` name cannot be empty

## element_invalid_closing_tag

> `</%name%>` attempted to close an element that was not open

## element_invalid_closing_tag_autoclosed

> `</%name%>` attempted to close element that was already automatically closed by `<%reason%>` (cannot nest `<%reason%>` inside `<%name%>`)

## element_invalid_tag_name

> Expected valid tag name

## element_unclosed

> `<%name%>` was left open

## event_handler_invalid_component_modifier

> Event modifiers other than 'once' can only be used on DOM elements

## event_handler_invalid_modifier

> Valid event modifiers are %list%

## event_handler_invalid_modifier_combination

> The '%modifier1%' and '%modifier2%' modifiers cannot be used together

## expected_attribute_value

> Expected attribute value

## expected_block_type

> Expected 'if', 'each', 'await', 'key' or 'snippet'

## expected_identifier

> Expected an identifier

## expected_pattern

> Expected identifier or destructure pattern

## expected_token

> Expected token %token%

## expected_whitespace

> Expected whitespace

## js_parse_error

> %message%

## let_directive_invalid_placement

> `let:` directive at invalid position

## mixed_event_handler_syntaxes

> Mixing old (on:%name%) and new syntaxes for event handling is not allowed. Use only the on%name% syntax

## node_invalid_placement

> %thing% is invalid inside `<%parent%>`

HTML restricts where certain elements can appear. In case of a violation the browser will 'repair' the HTML in a way that breaks Svelte's assumptions about the structure of your components. Some examples:

- `<p>hello <div>world</div></p>` will result in `<p>hello </p><div>world</div><p></p>` for example (the `<div>` autoclosed the `<p>` because `<p>` cannot contain block-level elements)
- `<option><div>option a</div></option>` will result in `<option>option a</option>` (the `<div>` is removed)
- `<table><tr><td>cell</td></tr></table>` will result in `<table><tbody><tr><td>cell</td></tr></tbody></table>` (a `<tbody>` is auto-inserted)

## render_tag_invalid_call_expression

> Calling a snippet function using apply, bind or call is not allowed

## render_tag_invalid_expression

> `{@render ...}` tags can only contain call expressions

## render_tag_invalid_spread_argument

> cannot use spread arguments in `{@render ...}` tags

## script_duplicate

> A component can have a single top-level `<script>` element and/or a single top-level `<script context="module">` element

## script_invalid_context

> If the context attribute is supplied, its value must be "module"

## slot_attribute_duplicate

> Duplicate slot name '%name%' in <%component%>

## slot_attribute_invalid

> slot attribute must be a static value

## slot_attribute_invalid_placement

> Element with a slot='...' attribute must be a child of a component or a descendant of a custom element

## slot_default_duplicate

> Found default slot content alongside an explicit slot="default"

## slot_element_invalid_attribute

> `<slot>` can only receive attributes and (optionally) let directives

## slot_element_invalid_name

> slot attribute must be a static value

## slot_element_invalid_name_default

> `default` is a reserved word — it cannot be used as a slot name

## slot_snippet_conflict

> Cannot use `<slot>` syntax and `{@render ...}` tags in the same component. Migrate towards `{@render ...}` tags completely

## snippet_conflict

> Cannot use explicit children snippet at the same time as implicit children content. Remove either the non-whitespace content or the children snippet block

## snippet_invalid_rest_parameter

> Snippets do not support rest parameters; use an array instead

## snippet_shadowing_prop

> This snippet is shadowing the prop `%prop%` with the same name

## style_directive_invalid_modifier

> `style:` directive can only use the `important` modifier

## style_duplicate

> A component can have a single top-level `<style>` element

## svelte_component_invalid_this

> Invalid component definition — must be an `{expression}`

## svelte_component_missing_this

> `<svelte:component>` must have a 'this' attribute

## svelte_element_missing_this

> `<svelte:element>` must have a 'this' attribute with a value

## svelte_fragment_invalid_attribute

> `<svelte:fragment>` can only have a slot attribute and (optionally) a let: directive

## svelte_fragment_invalid_placement

> `<svelte:fragment>` must be the direct child of a component

## svelte_fragment_invalid_slot

> `<svelte:fragment>` slot attribute must have a static value

## svelte_head_illegal_attribute

> `<svelte:head>` cannot have attributes nor directives

## svelte_meta_duplicate

> A component can only have one `<%name%>` element

## svelte_meta_invalid_content

> <%name%> cannot have children

## svelte_meta_invalid_placement

> `<%name%>` tags cannot be inside elements or blocks

## svelte_meta_invalid_tag

> Valid `<svelte:...>` tag names are %list%

## svelte_options_deprecated_tag

> "tag" option is deprecated — use "customElement" instead

## svelte_options_invalid_attribute

> `<svelte:options>` can only receive static attributes

## svelte_options_invalid_attribute_value

> Value must be %list%, if specified

## svelte_options_invalid_customelement

> "customElement" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: "open" | "none"; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }

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

## tag_invalid_placement

> {@%name% ...} tag cannot be %location%

## textarea_invalid_content

> A `<textarea>` can have either a value attribute or (equivalently) child content, but not both

## title_illegal_attribute

> `<title>` cannot have attributes nor directives

## title_invalid_content

> `<title>` can only contain text and {tags}

## transition_conflict

> Cannot use `%type%:` alongside existing `%existing%:` directive

## transition_duplicate

> Cannot use multiple `%type%:` directives on a single element

## unexpected_eof

> Unexpected end of input

## unexpected_reserved_word

> '%word%' is a reserved word in JavaScript and cannot be used here

## void_element_invalid_content

> Void elements cannot have children or closing tags
