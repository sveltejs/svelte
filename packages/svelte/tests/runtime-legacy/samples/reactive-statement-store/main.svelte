<script>
	let x = 1;
	let y = true;
	$: array = y ? [1, 2] : [1];
	$: count = array.length === 2 && x ? 1 : 0;
	$: sum = count + array.length;
</script>

<button
	on:click={() => {
		// order is important here: x must be updated before y
		// in order to test that $: still runs in the correct order
		x = 2;
		y = false;
	}}>{sum}</button
>
