## bindable_invalid_location

> `$bindable()` can only be used inside a `$props()` declaration

## constant_assignment

> Cannot assign to %thing%

## constant_binding

> Cannot bind to %thing%

## declaration_duplicate

> `%name%` has already been declared

## declaration_duplicate_module_import

> Cannot declare a variable with the same name as an import inside `<script module>`

## derived_invalid_export

> Cannot export derived state from a module. To expose the current derived value, export a function returning its value

## dollar_binding_invalid

> The $ name is reserved, and cannot be used for variables and imports

## dollar_prefix_invalid

> The $ prefix is reserved, and cannot be used for variables and imports

## each_item_invalid_assignment

> Cannot reassign or bind to each block argument in runes mode. Use the array and index variables instead (e.g. `array[i] = value` instead of `entry = value`)

## effect_invalid_placement

> `$effect()` can only be used as an expression statement

## export_undefined

> `%name%` is not defined

## global_reference_invalid

> `%name%` is an illegal variable name. To reference a global variable called `%name%`, use `globalThis.%name%`

## host_invalid_placement

> `$host()` can only be used inside custom element component instances

## import_svelte_internal_forbidden

> Imports of `svelte/internal/*` are forbidden. It contains private runtime code which is subject to change without notice. If you're importing from `svelte/internal/*` to work around a limitation of Svelte, please open an issue at https://github.com/sveltejs/svelte and explain your use case

## inspect_trace_generator

> `$inspect.trace(...)` cannot be used inside a generator function

## inspect_trace_invalid_placement

> `$inspect.trace(...)` must be the first statement of a function body

## invalid_arguments_usage

> The arguments keyword cannot be used within the template or at the top level of a component

## legacy_export_invalid

> Cannot use `export let` in runes mode — use `$props()` instead

## legacy_props_invalid

> Cannot use `$$props` in runes mode

## legacy_reactive_statement_invalid

> `$:` is not allowed in runes mode, use `$derived` or `$effect` instead

## legacy_rest_props_invalid

> Cannot use `$$restProps` in runes mode

## module_illegal_default_export

> A component cannot have a default export

## props_duplicate

> Cannot use `$props()` more than once

## props_illegal_name

> Declaring or accessing a prop starting with `$$` is illegal (they are reserved for Svelte internals)

## props_invalid_identifier

> `$props()` can only be used with an object destructuring pattern

## props_invalid_pattern

> `$props()` assignment must not contain nested properties or computed keys

## props_invalid_placement

> `$props()` can only be used at the top level of components as a variable declaration initializer

## reactive_declaration_cycle

> Cyclical dependency detected: %cycle%

## rune_invalid_arguments

> `%rune%` cannot be called with arguments

## rune_invalid_arguments_length

> `%rune%` must be called with %args%

## rune_invalid_computed_property

> Cannot access a computed property of a rune

## rune_invalid_name

> `%name%` is not a valid rune

## rune_invalid_usage

> Cannot use `%rune%` rune in non-runes mode

## rune_missing_parentheses

> Cannot use rune without parentheses

## rune_removed

> The `%name%` rune has been removed

## rune_renamed

> `%name%` is now `%replacement%`

## runes_mode_invalid_import

> %name% cannot be used in runes mode

## snippet_invalid_export

> An exported snippet can only reference things declared in a `<script module>`, or other exportable snippets

It's possible to export a snippet from a `<script module>` block, but only if it doesn't reference anything defined inside a non-module-level `<script>`. For example you can't do this...

```svelte
<script module>
	export { greeting };
</script>

<script>
	let message = 'hello';
</script>

{#snippet greeting(name)}
	<p>{message} {name}!</p>
{/snippet}
```

...because `greeting` references `message`, which is defined in the second `<script>`.

## snippet_parameter_assignment

> Cannot reassign or bind to snippet parameter

## state_invalid_export

> Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties

## state_invalid_placement

> `%rune%(...)` can only be used as a variable declaration initializer or a class field

## store_invalid_scoped_subscription

> Cannot subscribe to stores that are not declared at the top level of the component

## store_invalid_subscription

> Cannot reference store value inside `<script module>`

## store_invalid_subscription_module

> Cannot reference store value outside a `.svelte` file

Using a `$` prefix to refer to the value of a store is only possible inside `.svelte` files, where Svelte can automatically create subscriptions when a component is mounted and unsubscribe when the component is unmounted. Consider migrating to runes instead.

## typescript_invalid_feature

> TypeScript language features like %feature% are not natively supported, and their use is generally discouraged. Outside of `<script>` tags, these features are not supported. For use within `<script>` tags, you will need to use a preprocessor to convert it to JavaScript before it gets passed to the Svelte compiler. If you are using `vitePreprocess`, make sure to specifically enable preprocessing script tags (`vitePreprocess({ script: true })`)
