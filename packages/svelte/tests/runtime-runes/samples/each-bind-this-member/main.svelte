<script>
	let { items = $bindable([{ src: 'https://ds' }]) } = $props();
</script>

{#each items as item, i}
	<img
		src={item.src}
		bind:this={items[i].img}
		alt="slider{i}"
	/>
{/each}
