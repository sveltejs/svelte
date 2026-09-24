<script>
	import Item from './Item.svelte';

	let item = $state({ heading: 'initial' });
</script>

<Item {item} />
<p>{item.heading}</p>
