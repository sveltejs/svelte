<script>
	let { x } = $props();
	const result = $derived(await x);
</script>

<p>block: {result}</p>
