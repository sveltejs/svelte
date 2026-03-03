<script>
	import Inner from './Inner.svelte';

	let value = $state('hello');

	function compute(v) {
		console.log(v);
		return { data: v, ready: true };
	}
</script>

<button
	onclick={() => {
		value = undefined;
	}}>clear</button
>

{#if value}
	{@const result = compute(value)}
	{#if result.ready}
		<Inner data={result} />
	{/if}
{/if}
