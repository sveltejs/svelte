<script>
	import { setContext } from 'svelte';

	import Item from './Item.svelte'

	let items = $state({});

	setContext('container', {
		register: (id) => items[id] = true,
		unregister: (id) => delete items[id]
	});
</script>

<Item />
