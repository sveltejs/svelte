<script>
	import { afterUpdate, beforeUpdate, onMount } from 'svelte';
	import order from './order.js';
	import Item from './Item.svelte';

	export let n = 0;

	function logRender () {
		order.push(`parent: render ${n}`);
		return 'parent';
	}

	beforeUpdate(() => {
		order.push(`parent: beforeUpdate ${n}`);
	})

	afterUpdate(() => {
		order.push(`parent: afterUpdate ${n}`);
	})

	onMount(() => {
		order.push(`parent: onMount ${n}`);
	})
</script>

{logRender()}
<ul>
	{#each [1,2,3] as index}
		<Item {index} {n} />
	{/each}
</ul>


