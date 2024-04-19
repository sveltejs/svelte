<script>
	let count = $state(0);

	function yep() {
		count++;
	}

	function nope() {
		count++;
		throw new Error('nope');
	}
</script>

<div onclick={yep}>
	<button onclick={nope}>
		{count}
	</button>
</div>

