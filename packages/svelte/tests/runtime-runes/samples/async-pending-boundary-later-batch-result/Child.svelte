<script>
	let { a, push } = $props();

	let q = $derived(await push('q', a));
</script>

<p>q: {q}</p>
