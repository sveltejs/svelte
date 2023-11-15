<script>
	let count = $state(0);
	const onclick = () => count++;
</script>

<button onclick={() => count++}>{count}</button>
<button {onclick}>{count}</button>
