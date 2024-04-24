## element_unclosed

> `<%name%>` was left open

## block_unclosed

> Block was left open

## block_unexpected_close

> Unexpected block closing tag

## unexpected_eof

> Unexpected end of input

## js_parse_error

> %message%

## expected_token

> Expected token %token%

## unexpected_reserved_word

> '%word%' is a reserved word in JavaScript and cannot be used here

## expected_whitespace

> Expected whitespace

## expected_pattern

> Expected identifier or destructure pattern

## script_invalid_context

> If the context attribute is supplied, its value must be "module"

## block_invalid_elseif

> 'elseif' should be 'else if'

## block_invalid_continuation_placement

> {:...} block is invalid at this position (did you forget to close the preceeding element or block?)

## block_duplicate_clause

> %name% cannot appear more than once within a block

## expected_block_type

> Expected 'if', 'each', 'await', 'key' or 'snippet'

## expected_identifier

> Expected an identifier

## debug_tag_invalid_arguments

> {@debug ...} arguments must be identifiers, not arbitrary expressions

## const_tag_invalid_expression

> {@const ...} must be an assignment

## block_invalid_placement

> {#%name% ...} block cannot be %location%

## tag_invalid_placement

> {@%name% ...} tag cannot be %location%

## expected_attribute_value

> Expected attribute value

## directive_invalid_value

> Directive value must be a JavaScript expression enclosed in curly braces

## directive_missing_name

> `%type%` name cannot be empty

## invalid_closing_tag

> </%name%> attempted to close an element that was not open

## invalid_closing_tag_after_autoclose

> </%name%> attempted to close element that was already automatically closed by <%reason%> (cannot nest <%reason%> inside <%name%>)

## invalid_dollar_binding

> The $ name is reserved, and cannot be used for variables and imports

## invalid_dollar_prefix

> The $ prefix is reserved, and cannot be used for variables and imports

## invalid_dollar_global

> The $ name is reserved. To reference a global variable called $, use globalThis.$

## illegal_subscription

> Cannot reference store value inside `<script context="module">`

## duplicate_style_element

> A component can have a single top-level `<style>` element

## duplicate_script_element

> A component can have a single top-level `<script>` element and/or a single top-level `<script context="module">` element

## invalid_render_expression

> {@render ...} tags can only contain call expressions

## invalid_render_arguments

> expected at most one argument

## invalid_render_call

> Calling a snippet function using apply, bind or call is not allowed

## invalid_render_spread_argument

> cannot use spread arguments in {@render ...} tags

## invalid_snippet_rest_parameter

> snippets do not support rest parameters; use an array instead
