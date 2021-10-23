<script>
	export let selected;
	export let o3;
</script>

<p>selected: {selected}</p>

<select bind:value={selected}>
	<option>a</option>
	<option>b</option>
	<option bind:this={o3} selected>c</option>
</select>

<p>selected: {selected}</p>