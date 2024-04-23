<script>
	import Item from './Item.svelte';

	let { n = 0 } = $props();

	function logRender () {
		console.log(`parent: render ${n}`);
		return 'parent';
	}

	$effect.pre(() => {
		console.log(`parent: $effect.pre ${n}`);
	});

	$effect(() => {
		console.log(`parent: $effect ${n}`);
	});
</script>

{logRender()}
<ul>
	{#each [1,2,3] as index}
		<Item {index} {n} />
	{/each}
</ul>


