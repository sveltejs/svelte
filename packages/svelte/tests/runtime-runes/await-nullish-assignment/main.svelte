<script>
	let obj = { value: null };

	async function load() {
		obj.value ??= await Promise.resolve(42);
	}

	load();
</script>

<p>{obj.value}</p>
