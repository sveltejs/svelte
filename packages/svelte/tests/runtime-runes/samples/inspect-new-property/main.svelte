<script>
	let obj = $state({});
	let array = $state([]);

	$inspect(obj);
	$inspect(array);
</script>

<button
	onclick={() => {
		obj.x = "hello";
		array[0] = "hello";
	}}>
	add prop
</button>
