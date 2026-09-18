<script>
	let state = $state({});
</script>

<button onclick={() => (state.y = true)}>add y</button>
<button onclick={() => delete state.y}>delete y</button>
<p>{Object.hasOwn(state, 'y')}</p>
