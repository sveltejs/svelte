<script>
	let count = 0;
	let value = { value: "" };
	let checked = { value: false };
</script>

<input type="text" value={value.value} />

<textarea value={value.value}></textarea>

<input type="checkbox" checked={checked.value} />

<button on:click={()=>count++}>{count}</button>