{#if visible}
	{let count = 1}
	{const doubled = count * 2;}
	{var label = 'count'}
	{function format(value) {
		return `${label}: ${value}`;
	}}
	<p>{format(doubled)}</p>
{/if}
