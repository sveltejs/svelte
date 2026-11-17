<script>
	let source = $state(1);
	let value = $derived(source);

	function update() {
		source = 2;
		value = 1;
	}
</script>

<button onclick={update}>override</button>
<button onclick={() => source++}>increment</button>

<p>{value}</p>
