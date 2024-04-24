## store_with_rune_name

It looks like you're using the `$%name%` rune, but there is a local binding called `%name%`. Referencing a local variable with a `$` prefix will create a store subscription. Please rename `%name%` to avoid the ambiguity

## non_state_reference

`%name%` is updated, but is not declared with `$state(...)`. Changing its value will not correctly trigger updates

## derived_iife

Use `$derived.by(() => {...})` instead of `$derived((() => {...})())`

## invalid_props_declaration

Component properties are declared using `$props()` in runes mode. Did you forget to call the function?

## invalid_bindable_declaration

Bindable component properties are declared using `$bindable()` in runes mode. Did you forget to call the function?
