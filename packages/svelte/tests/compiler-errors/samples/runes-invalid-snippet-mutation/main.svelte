<svelte:options runes />

{#snippet foo(value)}
	<button onclick={() => value += 1}>click</button>
{/snippet}
