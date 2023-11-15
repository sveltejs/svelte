<script>
	import Item from './Item.svelte';

	let { n = 0, order } = $props();

	function logRender () {
		order.push(`parent: render ${n}`);
		return 'parent';
	}

	$effect.pre(() => {
		order.push(`parent: $effect.pre ${n}`);
	});

	$effect(() => {
		order.push(`parent: $effect ${n}`);
	});
</script>

{logRender()}
<ul>
	{#each [1,2,3] as index}
		<Item {index} {n} {order} />
	{/each}
</ul>


