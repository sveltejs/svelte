<script>
	let object = $state({ id: 1 });
</script>

<button onclick={() => (object = null)}>clear</button>

{#if object}
	<div {@attach () => () => console.log(`detach: ${object.id}`)}></div>
{/if}
