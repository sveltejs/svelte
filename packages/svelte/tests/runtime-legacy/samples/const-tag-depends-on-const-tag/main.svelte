<svelte:options runes={false} />

<script>
	let message = 'hello';
</script>

<input bind:value={message} />

{#if true}
	{@const m1 = message}
	{@const m2 = (() => m1)()}

	<p>{m1}</p>
	<p>{m2}</p>
{/if}
