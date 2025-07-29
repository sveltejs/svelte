<script>
	let { a = $bindable() } = $props();

	const bindings = $derived([
		() => a,
		(v) => {
			console.log('b', v);
			a = v;
		}
	]);
</script>

<input
	type="value"
	bind:value={...bindings}
/>
