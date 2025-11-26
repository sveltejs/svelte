<script>
	let count = $state(1);

	// More complex init
	let { squared, cubed } = $derived(await {
		squared: count ** 2,
		cubed: count ** 3
	});
	// Simple init with multiple destructurings after await
	let { toFixed, toString } = $derived(count);
</script>

<button onclick={() => count++}>increment</button>

<p>{count} ** 2 = {squared}</p>
<p>{count} ** 3 = {cubed}</p>
<p>{typeof toFixed} {typeof toString}</p>
