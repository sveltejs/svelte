<script>
	let selection = '';

	const handleSelectionChange = (e) => selection = document.getSelection();
</script>

<svelte:body />

<p>Select this text to fire events</p>
<p>Selection: {selection}</p>
