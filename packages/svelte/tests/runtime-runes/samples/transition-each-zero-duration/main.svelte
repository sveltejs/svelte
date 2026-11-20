<script>
	function fade(_, duration) {
		return {
			duration,
			css: (t) => `opacity: ${t}`
		};
	}

	let items = $state([1, 2, 3]);
</script>

<button onclick={() => (items = [1])}>Remove</button>

{#each items as item (item)}
	<p out:fade={item === 2 ? 0 : 100}>{item}</p>
{/each}
