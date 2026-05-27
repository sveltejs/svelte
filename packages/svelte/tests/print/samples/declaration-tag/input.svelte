{#if visible}
	{let count = 1}
	{const doubled = count * 2}
	{const label = 'count'}
	{const format = (value) => `${label}: ${value}`}
	<p>{format(doubled)}</p>
{/if}
