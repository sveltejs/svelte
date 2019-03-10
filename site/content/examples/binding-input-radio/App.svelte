<script>
	let selected = 'blue';
</script>

<label>
	<input type=radio bind:group={selected} value="red">
	red
</label>

<label>
	<input type=radio bind:group={selected} value="green">
	green
</label>

<label>
	<input type=radio bind:group={selected} value="blue">
	blue
</label>

<p style="color: {selected};">selected {selected}</p>