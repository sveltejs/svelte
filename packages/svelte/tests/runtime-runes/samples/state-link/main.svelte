<script>
	let a = $state(0);
	let b = $state.link(a);
</script>

<button onclick={() => a++}>{a}</button>
<button onclick={() => b++}>{b}</button>
