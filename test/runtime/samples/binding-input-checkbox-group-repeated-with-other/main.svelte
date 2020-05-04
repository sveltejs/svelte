<script>
	export let selected;
	export let selected2;
	export let values;
</script>

<label>
	<input type="checkbox" value="{values[0]}" bind:group={selected} /> {values[0]}
</label>

<label>
	<input type="checkbox" value="{values[1]}" bind:group={selected} /> {values[1]}
</label>

<label>
	<input type="checkbox" value="{values[0]}" bind:group={selected} /> {values[0]}
</label>

<label>
	<input type="checkbox" value="{values[1]}" bind:group={selected} /> {values[1]}
</label>

<p>{selected.join(', ')}</p>

<label>
	<input type="checkbox" value="{values[0]}" bind:group={selected2} /> {values[0]}
</label>

<label>
	<input type="checkbox" value="{values[1]}" bind:group={selected2} /> {values[1]}
</label>

<p>{selected2.join( ', ' ) }</p>