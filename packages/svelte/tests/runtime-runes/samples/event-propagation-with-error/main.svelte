<script>
	let y = $state(0);
	let n = $state(0);

	function yep() {
		y += 1;
	}

	function nope() {
		n += 1;
		throw new Error('nope');
	}
</script>

<div onclick={yep}>
	<button onclick={nope}>
		{y} {n}
	</button>
</div>
