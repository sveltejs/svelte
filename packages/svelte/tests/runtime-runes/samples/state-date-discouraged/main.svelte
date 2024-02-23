<script>
	let state = $state({
		date: null,
	});
</script>
<button onclick={() => {
	state.date = new Date();
}}>click</button>

{state.date}
