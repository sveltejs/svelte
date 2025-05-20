<script>
	let value = $state(1);
</script>

<div {@attach (node) => node.textContent = value}></div>
<button onclick={() => value += 1}>increment</button>
