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

## block_unexpected_close

> Unexpected block closing tag

## const_tag_invalid_expression

> {@const ...} must be an assignment

## debug_tag_invalid_arguments

> {@debug ...} arguments must be identifiers, not arbitrary expressions

## directive_invalid_value

> Directive value must be a JavaScript expression enclosed in curly braces

## directive_missing_name

> `%type%` name cannot be empty

## dollar_binding_invalid

> The $ name is reserved, and cannot be used for variables and imports

## dollar_prefix_invalid

> The $ prefix is reserved, and cannot be used for variables and imports

## element_invalid_closing_tag

> `</%name%>` attempted to close an element that was not open

## element_invalid_closing_tag_autoclosed

> `</%name%>` attempted to close element that was already automatically closed by `<%reason%>` (cannot nest `<%reason%>` inside `<%name%>`)

## element_unclosed

> `<%name%>` was left open

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

## snippet_invalid_rest_parameter

> snippets do not support rest parameters; use an array instead

## store_invalid_subscription

> Cannot reference store value inside `<script context="module">`

## style_duplicate

> A component can have a single top-level `<style>` element

## tag_invalid_placement

> {@%name% ...} tag cannot be %location%

## unexpected_eof

> Unexpected end of input

## unexpected_reserved_word

> '%word%' is a reserved word in JavaScript and cannot be used here
