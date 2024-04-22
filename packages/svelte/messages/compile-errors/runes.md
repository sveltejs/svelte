## invalid_legacy_props

Cannot use $$props in runes mode

## invalid_legacy_rest_props

Cannot use $$restProps in runes mode

## invalid_legacy_reactive_statement

$: is not allowed in runes mode, use $derived or $effect instead

## invalid_legacy_export

Cannot use \`export let\` in runes mode — use $props instead

## invalid_rune_usage

Cannot use %rune% rune in non-runes mode

## invalid_state_export

Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties

## invalid_derived_export

Cannot export derived state from a module. To expose the current derived value, export a function returning its value

## invalid_props_id

$props() can only be used with an object destructuring pattern

## invalid_props_pattern

$props() assignment must not contain nested properties or computed keys

## invalid_props_location

$props() can only be used at the top level of components as a variable declaration initializer

## invalid_bindable_location

$bindable() can only be used inside a $props() declaration

## invalid_state_location

%rune%(...) can only be used as a variable declaration initializer or a class field

## invalid_effect_location

$effect() can only be used as an expression statement

## invalid_host_location

$host() can only be used inside custom element component instances

## invalid_const_assignment

Invalid %is_binding ? 'binding' : 'assignment'% to const variable%
			show_details
				? ' ($derived values, let: directives, :then/:catch variables and @const declarations count as const)'
				: ''
		%

## invalid_derived_assignment

Invalid assignment to derived state

## invalid_derived_binding

Invalid binding to derived state

## invalid_rune_args_length

%rune% can only be called with %list(args, 'or')% %
			args.length === 1 && args[0] === 1 ? 'argument' : 'arguments'
		%

## invalid_runes_mode_import

%name% cannot be used in runes mode

## duplicate_props_rune

Cannot use $props() more than once

## invalid_each_assignment

Cannot reassign or bind to each block argument in runes mode. Use the array and index variables instead (e.g. 'array[i] = value' instead of 'entry = value')

## invalid_snippet_assignment

Cannot reassign or bind to snippet parameter

## invalid_derived_call

$derived.call(...) has been replaced with $derived.by(...)

## conflicting_property_name

Cannot have a property and a component export with the same name