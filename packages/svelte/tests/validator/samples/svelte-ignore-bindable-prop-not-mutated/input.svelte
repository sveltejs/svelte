<script>
	// svelte-ignore bindable_prop_not_mutated
	let { foo = $bindable() } = $props();
</script>

<p>{foo}</p>
