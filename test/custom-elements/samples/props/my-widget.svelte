<svelte:options tag="my-widget"/>

<script>
	export let items = [];
	export let flag1 = false;
	export let flag2 = false;
</script>

<p>{items.length} items</p>
<p>{items.join(', ')}</p>
<p>{flag1 ? 'flagged (dynamic attribute)' : 'not flagged'}</p>
<p>{flag2 ? 'flagged (static attribute)' : 'not flagged'}</p>
