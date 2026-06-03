<script>
	let value = $state('1');

	function onkeydown (e) {
		let _v = parseFloat(value);
		if (e.key === 'ArrowUp') _v += 1;
		else if (e.key === 'ArrowDown') _v -= 1;
		value = _v.toString();
	}
</script>

<label>
	<input bind:value {onkeydown} /> arrow up/down
</label>

<p>value = {value}</p>
