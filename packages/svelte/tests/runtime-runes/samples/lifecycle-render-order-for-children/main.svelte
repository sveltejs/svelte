<script>
	import Item from './Item.svelte';
	import { log } from './log.js';

	let { n = 0 } = $props();

	function logRender () {
		log.push(`parent: render ${n}`);
		return 'parent';
	}

	$effect.pre(() => {
		log.push(`parent: $effect.pre ${n}`);
	});

	$effect(() => {
		log.push(`parent: $effect ${n}`);
	});
</script>

{logRender()}
<ul>
	{#each [1,2,3] as index}
		<Item {index} {n} />
	{/each}
</ul>


