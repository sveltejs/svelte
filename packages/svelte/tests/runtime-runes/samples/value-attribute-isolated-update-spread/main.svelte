<script>
	let count = $state(0);
	let value = $state({
		value: "",
	});
	let checked = $state({
		checked: false,
	});
</script>

<input type="text" {...value} />

<textarea {...value}></textarea>

<input type="checkbox" {...checked} />

<button onclick={()=>count++}>{count}</button>