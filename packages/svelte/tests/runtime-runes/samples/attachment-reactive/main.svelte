<script>
	let value = $state(1);
</script>

<div attachments={[(node) => node.textContent = value]}></div>
<button onclick={() => value += 1}>increment</button>
