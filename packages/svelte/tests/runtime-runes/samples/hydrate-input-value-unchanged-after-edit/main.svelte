<script>
	let text = $state('');
	let checked = $state(true);
	let count = $state(0);
</script>

<form>
	<input value={text} data-count={count} />
	<input type="checkbox" {checked} data-count={count} />
	<button type="button" onclick={() => count++}>update count</button>
	<button
		type="button"
		onclick={() => {
			text = 'updated';
			checked = false;
		}}
	>update values</button>
</form>
