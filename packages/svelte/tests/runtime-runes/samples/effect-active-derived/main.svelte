<script>
	let foo = $state(false)
	let bar = $derived(foo ? $effect.active() : false);
</script>

<button onclick={() => foo = !foo}>
	toggle ({foo})
</button>

{#if bar}
	<p>bar is true</p>
{/if}
