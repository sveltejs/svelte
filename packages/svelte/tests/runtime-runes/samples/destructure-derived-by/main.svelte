<script>
	let count = $state(0);
	let fn = () => ({ n: count });

	let { n } = $derived.by(fn);
</script>

<button onclick={() => (count += 1)}>clicks: {n}</button>
