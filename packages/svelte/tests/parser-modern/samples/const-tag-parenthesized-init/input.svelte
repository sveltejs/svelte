{#each items as item}
	{@const x = (item.value)}
	{@const y = (a = item.n)}
	{@const z = ({ a: item.a })}
	{x}{y}{z.a}
{/each}
