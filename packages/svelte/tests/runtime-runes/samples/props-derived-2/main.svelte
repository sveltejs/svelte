<script>
	import Item from './Item.svelte';
	let activeIndex = $state(0);
</script>

<input bind:value={activeIndex} type="number" min="0" max={4} />
<Item active={activeIndex == 0} />
<Item active={activeIndex == 1} />
<Item active={activeIndex == 2} />
<Item active={activeIndex == 3} />
<Item active={activeIndex == 4} />
