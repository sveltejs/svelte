{#each [1, 2, 3, 4, 5] as func}
	<p>{(() => func)()}</p>
{/each}
