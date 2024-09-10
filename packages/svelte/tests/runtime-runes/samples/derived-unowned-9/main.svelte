<script>
	let count = $state(0);

	function increment() {
		count += 1;
	}

	let double = $state();
	function setDerived() {
		const d = $derived(count * 2);
		double = {
			get v() { return d }
		};
	}
</script>

<button onclick={increment}>a</button>
<button onclick={setDerived}>b</button>

<div>{count}</div>

{#if double && count % 5}
	double: {double.v}
{/if}
