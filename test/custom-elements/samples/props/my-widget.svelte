<svelte:options tag="my-widget"/>

<script>
	export let items = [];
</script>

<p>{items.length} items</p>
<p>{items.join(', ')}</p>
