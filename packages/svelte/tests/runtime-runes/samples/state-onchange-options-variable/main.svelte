<script>
	const options = {
		onchange() {
			console.log('count');
		}
	};

	let count = $state(0, options);
	let raw = $state.raw(0, { ...options });
	let object = $state({ count: 0 }, { get onchange() { return () => console.log('object'); } });
</script>

<button onclick={() => count++}>{count}</button>
<button onclick={() => raw++}>{raw}</button>
<button onclick={() => object.count++}>{object.count}</button>
