<script>
	let { items } = $props();
</script>

{#each items as item, i}
	<img
		src={item.src}
		bind:this={items[i].img}
		alt="slider{i}"
	/>
{/each}
