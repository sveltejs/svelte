<script>
	let { x, load } = $props();
	const value = $derived(await load(x));
	console.log(value);
</script>

<span>{value}</span>
