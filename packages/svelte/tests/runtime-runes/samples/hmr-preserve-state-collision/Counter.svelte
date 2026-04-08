<script>
	let count = $state(0);
</script>

<button class="child" onclick={() => count += 1}>
	child: {count}
</button>
