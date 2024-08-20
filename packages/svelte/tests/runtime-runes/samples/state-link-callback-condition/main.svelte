<script>
	let a = $state(0);
	let b = $state.link(a, (value) => {
		if (c) return;
		b = value;
	});
	let c = $state(false);
</script>

<button onclick={() => a++}>{a}</button>
<button onclick={() => b++}>{b}</button>
<button onclick={() => c = !c}>{c}</button>
