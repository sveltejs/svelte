<script>
	let count = $state(0);
	function showCount() {
		return count;
	}
</script>

{showCount``} <button onclick={() => count++}></button>
