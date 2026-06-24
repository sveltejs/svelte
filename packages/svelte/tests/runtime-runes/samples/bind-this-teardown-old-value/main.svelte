<script>
	let input = $state(null);
	let show = $state(true);

	$effect(() => {
		input;

		return () => {
			console.log(input === null ? 'null' : input.tagName);
		};
	});
</script>

<button onclick={() => (show = false)}>hide</button>

{#if show}
	<input bind:this={input} />
{/if}
