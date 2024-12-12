<script>
	let { a = $bindable() } = $props();
</script>

<input
	type="value"
	bind:value={() => a,
	(v) => {
		console.log('b', v);
		a = v;
	}}
/>
