<script>
	const { onclick, increment, count } = $props();
</script>

<button {onclick}>{count}</button>
<button onclick={increment}>{count}</button>
