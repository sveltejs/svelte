<script>
	let count = $state(0);

	let object = {
		toString() {
			return count;
		}
	};
</script>

<button onclick={() => count += 1}>
	{object}
</button>
