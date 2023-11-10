<script>
	let { readonly, readonlyWithDefault = 1, binding, bindingWithDefault = 1 } = $props();
</script>

<p>
	readonly: {readonly}
	readonlyWithDefault: {readonlyWithDefault}
	binding: {binding}
	bindingWithDefault: {bindingWithDefault}
</p>

<button on:click={() => {
	binding = 5;
	bindingWithDefault = 5;
}}>set bindings to 5</button>

<button on:click={() => {
	binding = undefined;
	bindingWithDefault = undefined;
}}>set bindings to undefined</button>
