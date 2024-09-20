## export_let_unused

> Component has unused export property '%name%'. If it is for external reference only, please consider using `export const %name%`

## legacy_component_creation

> Svelte 5 components are no longer classes. Instantiate them using `mount` or `hydrate` (imported from 'svelte') instead.

## non_reactive_update

> `%name%` is updated, but is not declared with `$state(...)`. Changing its value will not correctly trigger updates

## perf_avoid_inline_class

> Avoid 'new class' — instead, declare the class at the top level scope

## perf_avoid_nested_class

> Avoid declaring classes below the top level scope

## reactive_declaration_invalid_placement

> Reactive declarations only exist at the top level of the instance script

## reactive_declaration_module_script_dependency

> Reassignments of module-level declarations will not cause reactive statements to update

## reactive_declaration_non_reactive_property

> Properties of objects and arrays are not reactive unless in runes mode. Changes to this property will not cause the reactive statement to update

## state_referenced_locally

> State referenced in its own scope will never update. Did you mean to reference it inside a closure?

## store_rune_conflict

> It looks like you're using the `$%name%` rune, but there is a local binding called `%name%`. Referencing a local variable with a `$` prefix will create a store subscription. Please rename `%name%` to avoid the ambiguity
