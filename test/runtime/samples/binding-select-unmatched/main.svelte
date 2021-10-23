<script>
	// set as null so no option will be selected by default
	export let selected = null;
	export let o3;
</script>

<p>selected: {selected}</p>

<select bind:value={selected}>
	<option>a</option>
	<option>b</option>
	<option bind:this={o3}>c</option>
</select>

<p>selected: {selected}</p>
<button id='add-attr' on:click={() => o3.setAttribute('selected', '')}>add attr</button>
<button id='remove-attr' on:click={() => o3.removeAttribute('selected')}>remove attr</button>