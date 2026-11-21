<script>
	let selected = $state();
</script>

<input type="checkbox" bind:group={selected} value="a" />
<input type="checkbox" bind:group={selected} value="b" />
<p>{selected?.join(',')}</p>
