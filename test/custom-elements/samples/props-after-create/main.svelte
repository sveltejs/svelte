<svelte:options tag="custom-element"/>

<script>
	export let items = [];
</script>

<p>{items.length} items</p>
<p>{items.join(', ')}</p>
