<script>
	let checked = $state([`a&b<c"d'e`]);
	let picked = $state(`a&b<c"d'e`);
</script>

<input type="checkbox" bind:group={checked} value="x" />
<input type="checkbox" bind:group={checked} value="a&b<c&quot;d'e" />
<input type="radio" bind:group={picked} value="x" />
<input type="radio" bind:group={picked} value="a&b<c&quot;d'e" />
