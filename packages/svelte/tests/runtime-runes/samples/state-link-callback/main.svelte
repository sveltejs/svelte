<script>
	let a = $state(0);
	let b = $state.link(a, (value) => {
		console.log(`in callback ${value}`);
		b = value;
	});
</script>

<button onclick={() => a++}>{a}</button>
<button onclick={() => b++}>{b}</button>
