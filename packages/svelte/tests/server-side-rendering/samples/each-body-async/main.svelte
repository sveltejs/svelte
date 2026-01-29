{#each { length: 1 }}
	{@const data = await Promise.resolve("each")}
	{data}
{/each}

{#each { length: 0 }}
	should not see this
{:else}
	{@const data = await Promise.resolve("else")}
	{data}
{/each}