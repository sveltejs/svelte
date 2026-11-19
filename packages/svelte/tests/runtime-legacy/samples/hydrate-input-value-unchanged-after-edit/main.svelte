<script>
	let text = 'initial';
	let checked = true;
	let count = 0;
</script>

<form>
	<input value={text} data-count={count} />
	<input type="radio" name="choice" value="a" {checked} data-count={count} />
	<input type="radio" name="choice" value="b" />
	<button type="button" on:click={() => count++}>update count</button>
	<button
		type="button"
		on:click={() => {
			text = 'updated';
			checked = false;
		}}
	>update values</button>
	<button type="button" on:click={() => checked = true}>check</button>
</form>
