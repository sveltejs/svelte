{#each items as item}
	{@const x = item.value /* a */}
	{x}
	{@const y = (item.n) // b
	}
	{y}
	{@const z = (item.a /* c */) /* d */}
	{z}
	{@const w = item.w // e   
	}
	{w}
{/each}
