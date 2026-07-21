## bindable_prop_not_mutated

> `%name%` is declared with `$bindable()` but is not mutated or reassigned

The `$bindable()` rune marks a prop as two-way bindable, meaning the component can update the value and the parent will see the changes. If the prop is never mutated or reassigned within the component, `$bindable()` has no effect and should be removed.

## custom_element_props_identifier

> Using a rest element or a non-destructured declaration with `$props()` means that Svelte can't infer what properties to expose when creating a custom element. Consider destructuring all the props or explicitly specifying the `customElement.props` option.

## export_let_unused

> Component has unused export property '%name%'. If it is for external reference only, please consider using `export const %name%`

## legacy_component_creation

> Svelte 5 components are no longer classes. Instantiate them using `mount` or `hydrate` (imported from 'svelte') instead.

See the [migration guide](v5-migration-guide#Components-are-no-longer-classes) for more info.

## non_reactive_update

> `%name%` is updated, but is not declared with `$state(...)`. Changing its value will not correctly trigger updates

This warning is thrown when the compiler detects the following:
- a variable was declared without `$state` or `$state.raw`
- the variable is reassigned
- the variable is read in a reactive context

In this case, changing the value will not correctly trigger updates. Example:

```svelte
<script>
	let reactive = $state('reactive');
	let stale = 'stale';
</script>

<p>This value updates: {reactive}</p>
<p>This value does not update: {stale}</p>

<button onclick={() => {
	stale = 'updated';
	reactive = 'updated';
}}>update</button>
```

To fix this, wrap your variable declaration with `$state`.

## perf_avoid_inline_class

> Avoid 'new class' — instead, declare the class at the top level scope

## perf_avoid_nested_class

> Avoid declaring classes below the top level scope

## reactive_declaration_invalid_placement

> Reactive declarations only exist at the top level of the instance script

## reactive_declaration_module_script_dependency

> Reassignments of module-level declarations will not cause reactive statements to update

## state_referenced_locally

> This reference only captures the initial value of `%name%`. Did you mean to reference it inside a %type% instead?

This warning is thrown when the compiler detects the following:

- A reactive variable is declared
- ...and later reassigned...
- ...and referenced in the same scope

This 'breaks the link' to the original state declaration. For example, if you pass the state to a function, the function loses access to the state once it is reassigned:

```svelte
<!--- file: Parent.svelte --->
<script>
	import { setContext } from 'svelte';

	let count = $state(0);

	// warning: state_referenced_locally
	setContext('count', count);
</script>

<button onclick={() => count++}>
	increment
</button>
```

```svelte
<!--- file: Child.svelte --->
<script>
	import { getContext } from 'svelte';

	const count = getContext('count');
</script>

<!-- This will never update -->
<p>The count is {count}</p>
```

To fix this, reference the variable such that it is lazily evaluated. For the above example, this can be achieved by wrapping `count` in a function:

```svelte
<!--- file: Parent.svelte --->
<script>
	import { setContext } from 'svelte';

	let count = $state(0);
	setContext('count', +++() => count+++);
</script>

<button onclick={() => count++}>
	increment
</button>
```

```svelte
<!--- file: Child.svelte --->
<script>
	import { getContext } from 'svelte';

	const count = getContext('count');
</script>

<!-- This will update -->
<p>The count is {+++count()+++}</p>
```

For more info, see [Passing state into functions]($state#Passing-state-into-functions).

## store_rune_conflict

> It looks like you're using the `$%name%` rune, but there is a local binding called `%name%`. Referencing a local variable with a `$` prefix will create a store subscription. Please rename `%name%` to avoid the ambiguity
