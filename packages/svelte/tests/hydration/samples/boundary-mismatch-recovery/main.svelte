<svelte:boundary>
	<p>{@html '<p>Valid HTML fragment</p>'}</p>

	{#snippet failed()}
		<p>boundary fallback</p>
	{/snippet}
</svelte:boundary>
