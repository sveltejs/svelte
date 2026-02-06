<svelte:options runes />

<script>
	function* gen() {
		const arr = [0];

		for (let i = 0; i < 5; i += 1) {
			arr[0] = i;
			yield arr;
		}
	}
</script>

{#each gen() as [item]}
	<p>{item}</p>
{/each}

