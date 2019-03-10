<script>
	const selected = ['blue'];
</script>

<label>
	<input type=checkbox bind:group={selected} value="red">
	red
</label>

<label>
	<input type=checkbox bind:group={selected} value="green">
	green
</label>

<label>
	<input type=checkbox bind:group={selected} value="blue">
	blue
</label>

<p>{selected.join(', ') || 'nothing'} selected</p>