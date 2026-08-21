<script>
	let { count } = $props();

	async function x() {
		let d = $derived(await new Promise((f) => {}));
	}

	let indirect = $derived(x() && count);
</script>

<p>{indirect}</p>
