<script>
	let { readonly, readonlyWithDefault = 1, binding = $bindable() } = $props();
</script>

<p>
	readonly: {readonly}
	readonlyWithDefault: {readonlyWithDefault}
	binding: {binding}
</p>

<button on:click={() => {
	binding = 5;
}}>set bindings to 5</button>

<button on:click={() => {
	binding = undefined;
}}>set bindings to undefined</button>
