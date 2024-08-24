## bind_invalid_checkbox_value

> Using `bind:value` together with a checkbox input is not allowed. Use `bind:checked` instead

## bind_invalid_export

> Component %component% has an export named `%key%` that a consumer component is trying to access using `bind:%key%`, which is disallowed. Instead, use `bind:this` (e.g. `<%name% bind:this={component} />`) and then access the property on the bound component instance (e.g. `component.%key%`)

## bind_not_bindable

> A component is attempting to bind to a non-bindable property `%key%` belonging to %component% (i.e. `<%name% bind:%key%={...}>`). To mark a property as bindable: `let { %key% = $bindable() } = $props()`

## component_api_changed

> %parent% called `%method%` on an instance of %component%, which is no longer valid in Svelte 5. See https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes for more information

## component_api_invalid_new

> Attempted to instantiate %component% with `new %name%`, which is no longer valid in Svelte 5. If this component is not under your control, set the `compatibility.componentApi` compiler option to `4` to keep it working. See https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes for more information

## derived_references_self

> A derived value cannot reference itself recursively

## each_key_duplicate

> Keyed each block has duplicate key at indexes %a% and %b%

> Keyed each block has duplicate key `%value%` at indexes %a% and %b%

## effect_in_teardown

> `%rune%` cannot be used inside an effect cleanup function

## effect_in_unowned_derived

> Effect cannot be created inside a `$derived` value that was not itself created inside an effect

## effect_orphan

> `%rune%` can only be used inside an effect (e.g. during component initialisation)

## effect_update_depth_exceeded

> Maximum update depth exceeded. This can happen when a reactive block or effect repeatedly sets a new value. Svelte limits the number of nested updates to prevent infinite loops

## hydration_failed

> Failed to hydrate the application

## lifecycle_legacy_only

> `%name%(...)` cannot be used in runes mode

## props_invalid_value

> Cannot do `bind:%key%={undefined}` when `%key%` has a fallback value

## props_rest_readonly

> Rest element properties of `$props()` such as `%property%` are readonly

## rune_outside_svelte

> The `%rune%` rune is only available inside `.svelte` and `.svelte.js/ts` files

## state_descriptors_fixed

> Property descriptors defined on `$state` objects must contain `value` and always be `enumerable`, `configurable` and `writable`.

## state_prototype_fixed

> Cannot set prototype of `$state` object

## state_unsafe_local_read

> Reading state that was created inside the same derived is forbidden. Consider using `untrack` to read locally created state

## state_unsafe_mutation

> Updating state inside a derived is forbidden. If the value should not be reactive, declare it without `$state`

## svelte_component_invalid_this_value

> The `this={...}` property of a `<svelte:component>` must be a Svelte component, if defined
