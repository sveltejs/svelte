## empty_attribute_shorthand

Attribute shorthand cannot be empty

## duplicate_attribute

Attributes need to be unique

## invalid_event_attribute_value

Event attribute must be a JavaScript expression, not a string

## invalid_attribute_name

'%name%' is not a valid attribute name

## invalid_animation

An element that uses the animate directive must be the immediate child of a keyed each block`
			: type === 'each-key'
				? `An element that uses the animate directive must be used inside a keyed each block. Did you forget to add a key to your each block?`
				: `An element that uses the animate directive must be the sole child of a keyed each block

## duplicate_animation

An element can only have one 'animate' directive

## invalid_event_modifier

Valid event modifiers are %modifiers.slice(0, -1).join(', ')% or %modifiers.slice(-1)%`
			: `Event modifiers other than 'once' can only be used on DOM elements

## invalid_event_modifier_combination

The '%modifier1%' and '%modifier2%' modifiers cannot be used together

## duplicate_transition

TODO

## invalid_let_directive_placement

TODO

## invalid_style_directive_modifier

Invalid 'style:' modifier. Valid modifiers are: 'important'

## invalid_sequence_expression

Sequence expressions are not allowed as attribute/directive values in runes mode, unless wrapped in parentheses