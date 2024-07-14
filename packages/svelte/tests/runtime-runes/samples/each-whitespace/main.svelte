<svelte:options runes />

<p>
	{#each ['space', ' ', 'between'] as word}
		{word}
	{/each}
</p>
