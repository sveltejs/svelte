<script>
	let count = $state(0);
	let obj = $state({ onclick: () => count++});
</script>

<button {...obj}>{count}</button>
<button onclick={() => obj = { onclick: () => count-- }}>change handler</button>
