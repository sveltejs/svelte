<script>
	let power = $state(0);

	$effect(() => {
		if (power !== 10) {
			power += 1;
		}
	});
</script>

<p>power: {power}</p>

{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as n}
	<button on:click={() => power = n}>{n}</button>
{/each}
