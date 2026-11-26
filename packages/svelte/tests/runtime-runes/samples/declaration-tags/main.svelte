<script>
	let visible = $state(true);
	let initial = $state(2);
</script>

{let top = $state(1)}
{let top_doubled = $derived(top * 2)}

<button onclick={() => (top += 1)}>top {top_doubled}</button>
<button onclick={() => (visible = !visible)}>toggle</button>

{#if visible}
	{let counter = $state({ value: initial })}
	{let doubled = $derived(counter.value * 2)}
	{const suffix = ' total'}
	{const format = (value) => `${value}${suffix}`}

	<button onclick={() => (counter.value += 1)}>{counter.value}</button>
	<p>{format(doubled)}</p>
	<div>
		{const doubled = 'nested'}
		<span>{doubled}</span>
	</div>
{/if}

<div>
	{const nested = 'nested'}
	<span>{nested}</span>
</div>
