<script>
	let object = $state({ n: 0n });

	function reassign() {
		object = { n: 0n };
	}

	function mutate() {
		return object.n++;
	}
</script>

<button onclick={mutate}>mutate</button>
<button onclick={reassign}>reassign</button>

<p>{object.n}</p>
