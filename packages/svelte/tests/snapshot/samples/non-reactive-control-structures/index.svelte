<svelte:options runes={true} />

<script>
	const a = true;
	let b = $state(true);
</script>

{#if a}
  hello
{/if}

{#if b}
  world
{/if}

{#if a}
  hi
{:else}
	earth
{/if}
