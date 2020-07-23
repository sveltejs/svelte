<svelte:options tag="my-widget"/>

<script>
	export let widgetItems = [];
</script>

<p>{widgetItems.length} items</p>
<p>{widgetItems.join(', ')}</p>
