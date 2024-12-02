<script>
	import List from './List.svelte';
	import Item from './Item.svelte';

	let selectedIndex = $state(0);
	let selectedValue = $derived(`${selectedIndex}`);

	const changeSelection = () => {
			selectedIndex = (selectedIndex + 1)%3;
	};
</script>

<List {selectedValue}>
	<Item value="0">First</Item>
	<Item value="1">Second</Item>
	<Item value="2">Third</Item>
</List>
<button onclick={changeSelection}>Change Selection</button>
