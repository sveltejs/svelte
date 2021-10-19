<script>
	import { onMount, beforeUpdate, afterUpdate } from 'svelte';
	import order from './order.js';
	import Item from './Item.svelte';

	const parentIndex = 0;
	let ul;
	let ulW;
	function logRender () {
  		order.push(`${parentIndex}: render`);
  		return parentIndex;
  	}

  	beforeUpdate(() => {
  		order.push(`${parentIndex}: beforeUpdate`);
  	});

  	afterUpdate(() => {
  		order.push(`${parentIndex}: afterUpdate`);
  	});

  	onMount(() => {
  		order.push(`${parentIndex}: onMount`);
  	})
</script>

{logRender()}
<ul bind:this={ul} bind:clientWidth={ulW}>
	{#each [1,2,3] as index}
		<Item {index} />
	{/each}
</ul>


