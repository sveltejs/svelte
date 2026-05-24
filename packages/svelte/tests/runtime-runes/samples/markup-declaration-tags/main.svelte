<script>
	let visible = $state(true);
	let initial = $state(2);
</script>

<button onclick={() => (visible = !visible)}>toggle</button>

{#if visible}
	{let counter = $state({ value: initial })}
	{let doubled = $derived(counter.value * 2)}
	{var suffix = ' total'}
	{function format(value) {
		return `${value}${suffix}`;
	}}

	<button onclick={() => (counter.value += 1)}>{counter.value}</button>
	<p>{format(doubled)}</p>
{/if}
