<script>
	let { a = $bindable() } = $props();

	const bindings = [
		() => a,
		(v) => {
			console.log('b', v);
			a = v;
		}
	];
</script>

<input
	type="value"
	bind:value={...bindings}
/>
