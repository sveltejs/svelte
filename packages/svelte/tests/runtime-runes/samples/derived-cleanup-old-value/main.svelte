<script>
	let count = $state(1);
	let squared = $derived(count * count);

	$effect(() => {
		console.log(`count: ${count}`);

		return () => {
			console.log(`squared: ${squared}`);
		};
	});
</script>

<button onclick={() => count++}>increment</button>

<p>count: {count}</p>

{#if count % 2 === 0}
	<p id="squared">squared: {squared}</p>
{/if}
